# LAB GUARDIAN: REACTOR ZERO
## 3D Sci-Fi Educational Action-Adventure & Stoichiometry Academy

**LAB GUARDIAN: REACTOR ZERO** is a 3D sci-fi third-person educational action-adventure game set in a futuristic research facility. Players navigate four distinct sectors, operate tactical isolation suits, defend against rogue security automatons, and master the full 10-skill chemistry stoichiometry curriculum through interactive 3D molecular models and official certification exams.

---

### System Requirements & Environment
- **Node.js**: `>= 20.0.0` (Tested on Node.js v22 on CachyOS / Arch Linux, Ubuntu, macOS, and Windows)
- **npm**: `>= 10.0.0`
- **Graphics**: WebGL 2.0 compatible browser (Chrome, Chromium, Firefox, Edge, Safari)

---

### Quick Start (Local Setup)

1. **Install Dependencies** (Clean resolution with synchronized lockfile):
   ```bash
   npm install
   ```

2. **Run Type Checking & Linting**:
   ```bash
   npm run lint
   ```

3. **Run Automated Test Suite** (50/50 unit tests across all systems):
   ```bash
   npm test
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. (Append `?autostart=1` to jump directly into the simulation).

5. **Build for Production**:
   ```bash
   npm run build
   ```
   Generates a standalone, fully optimized client bundle in the `./dist` directory.

---

### Cloudflare Pages Deployment Guide

This project is a standalone, client-rendered Single Page Application (SPA) that deploys seamlessly to Cloudflare Pages:

1. **Create New Project** in Cloudflare Dashboard:
   - Connect your Git repository or use Direct Upload.
2. **Build Settings**:
   - **Framework Preset**: `Vite` (or None)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Root Directory**: `/`
3. **Environment Variables**:
   - `NODE_VERSION`: `22` (or `20`)
4. **Deploy**:
   - Cloudflare Pages will execute `npm install` and `npm run build`. The output in `dist/` contains `index.html`, all JavaScript/CSS chunks, all 25 GLB 3D models, and all soundtrack files.

---

### Game Controls

| Control | Action |
| :--- | :--- |
| **W, A, S, D** | Move operative (camera-relative direction) |
| **Mouse Drag / Move** | Rotate camera orbit and aim |
| **Left Click / F** | Fire plasma pulse weapon |
| **Right Click / L** | Toggle mouse cursor / Aim lock |
| **V** | Toggle First-Person / Third-Person camera mode |
| **E / Space** | Interact with terminals, 3D pedestals, portals, and airlocks |
| **M** | Open facility Sector Map & Fast Travel |
| **Esc** | Pause game / Open settings menu |

---

### Stoichiometry Academy & 3D Interactive Chemistry

The **Stoichiometry Academy** features genuine Babylon.js 3D atom and molecule geometry with dual-cylinder covalent bonds and crystalline lattices:
1. **Iron Oxidation ($4\text{Fe} + 3\text{O}_2 \rightarrow 2\text{Fe}_2\text{O}_3$)**: 4 metallic silver-blue Fe spheres, 3 diatomic $\text{O}_2$ molecules with double bonds, and crystalline hematite products showing mass and atom conservation.
2. **Diatomic Oxygen ($\text{O}_2$)**: Highlighting representative particles for gaseous non-metals and the significance of stoichiometric coefficients.
3. **Propane Combustion ($\text{C}_3\text{H}_8 + 5\text{O}_2 \rightarrow 3\text{CO}_2 + 4\text{H}_2\text{O}$)**: 3-carbon tetrahedral alkane backbone and electronic digital scale demonstrating quantitative conservation of mass ($204.1\text{g} = 204.11\text{g}$).
4. **Potassium Bromide ($\text{KBr}$)**: 3D alternating ionic crystal lattice distinguishing formula units from covalent molecules and deriving all 6 directed mole ratios.
5. **Butane Combustion ($2\text{C}_4\text{H}_{10} + 13\text{O}_2 \rightarrow 8\text{CO}_2 + 10\text{H}_2\text{O}$)**: 4-carbon chain and complete $4 \times 4$ directed mole ratio matrix excluding the diagonal ($n(n-1) = 12$ ratios).

---

### Certification Exam System

- **Tier 1 (Research Wing Qualification)**: Conceptual interpretation and representative particles ($80\%$ passing score required to unlock the Mass Refinery).
- **Tier 2 (Refinery Qualification)**: Mass balance calculations and mole ratio derivations ($80\%$ passing score required to unlock the Mole Ratio Vault).
- **Tier 3 (Master Reactor Certification)**: Multi-step stoichiometry and butane reaction matrix calculations required to penetrate the Containment Warden boss shields.
- **Visual Companion**: Live pedagogical diagrams alongside every question explaining coefficients, molar masses, and conversion roadmaps.

