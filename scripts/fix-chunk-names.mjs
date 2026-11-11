// Fix mismatched chunk filenames in the built output.
// rolldown-vite emits files as `name-hashA-hashB.js` but some references
// (Babylon shader-chunk manifest / dynamic import strings) keep the
// single-hash form `name-hashA.js`, which 404s at runtime.
// This script rewrites every missing reference to the real on-disk name.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(process.cwd(), 'dist');
const assetsDir = path.join(dist, 'assets');

const onDisk = new Set(await readdir(assetsDir));

// collect text files to scan/rewrite
const targets = [];
for (const f of await readdir(dist)) {
  if (f.endsWith('.html') || f.endsWith('.js')) targets.push(path.join(dist, f));
}
for (const f of await readdir(assetsDir)) {
  if (f.endsWith('.js') || f.endsWith('.css')) targets.push(path.join(assetsDir, f));
}

const contents = new Map();
for (const f of targets) contents.set(f, await readFile(f, 'utf8'));

// every "xxx.js" token referenced anywhere
const refRe = /[A-Za-z0-9][A-Za-z0-9._-]*\.js/g;
const referenced = new Set();
for (const text of contents.values()) {
  for (const m of text.matchAll(refRe)) referenced.add(m[0]);
}

const htmlRefs = contents.get(path.join(dist, 'index.html')) || '';

const rename = new Map();
for (const ref of referenced) {
  if (onDisk.has(ref)) continue;
  // candidates: on-disk files that extend this name with a second hash segment
  const prefix = ref.slice(0, -3); // strip ".js"
  const cands = [...onDisk].filter((n) => n.startsWith(prefix + '-'));
  if (cands.length === 0) continue;
  let target = cands[0];
  if (cands.length > 1) {
    // prefer the candidate that the entry HTML references (canonical emit name)
    const inHtml = cands.filter((c) => htmlRefs.includes(c));
    if (inHtml.length === 1) target = inHtml[0];
    else {
      const buf0 = await readFile(path.join(assetsDir, cands[0]));
      const same = await Promise.all(cands.slice(1).map(async (c) =>
        (await readFile(path.join(assetsDir, c))).equals(buf0)));
      if (!same.every(Boolean)) {
        console.warn(`[fix-chunk-names] ambiguous for ${ref}: ${cands.join(', ')} — using first`);
      }
    }
  }
  rename.set(ref, target);
}

if (rename.size === 0) {
  console.log('[fix-chunk-names] nothing to fix');
  process.exit(0);
}

let total = 0;
for (const [f, text] of contents) {
  let out = text;
  let n = 0;
  for (const [from, to] of rename) {
    // safe: `name-hashA.js` never occurs inside `name-hashA-hashB.js`
    // because the match requires ".js" right after the first hash.
    const parts = out.split(from);
    n += parts.length - 1;
    out = parts.join(to);
  }
  if (n > 0) {
    await writeFile(f, out);
    total += n;
    console.log(`[fix-chunk-names] ${path.relative(dist, f)}: ${n} refs fixed`);
  }
}
console.log(`[fix-chunk-names] fixed ${total} references (${rename.size} unique files)`);
