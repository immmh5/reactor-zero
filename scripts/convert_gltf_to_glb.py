import json
import struct
import base64
import os
import glob

def gltf_to_glb(gltf_path, glb_path):
    with open(gltf_path, 'r', encoding='utf-8') as f:
        gltf = json.load(f)
        
    buffers = gltf.get('buffers', [])
    bin_buffer = bytearray()
    
    # Process buffers
    for buf in buffers:
        uri = buf.get('uri', '')
        if uri.startswith('data:'):
            # Parse base64
            comma_idx = uri.find(',')
            raw_bytes = base64.b64decode(uri[comma_idx+1:])
            # Align offset
            while len(bin_buffer) % 4 != 0:
                bin_buffer.append(0)
            bin_buffer.extend(raw_bytes)
        elif uri:
            # External file
            dir_path = os.path.dirname(gltf_path)
            with open(os.path.join(dir_path, uri), 'rb') as bf:
                raw_bytes = bf.read()
            while len(bin_buffer) % 4 != 0:
                bin_buffer.append(0)
            bin_buffer.extend(raw_bytes)

    # In GLB, there is only one binary buffer at index 0, with byteLength and NO uri
    gltf['buffers'] = [{'byteLength': len(bin_buffer)}]
    
    json_str = json.dumps(gltf, separators=(',', ':'))
    json_bytes = json_str.encode('utf-8')
    while len(json_bytes) % 4 != 0:
        json_bytes += b' '
        
    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_buffer)
    with open(glb_path, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total_length))
        f.write(struct.pack('<II', len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack('<II', len(bin_buffer), 0x004E4942))
        f.write(bin_buffer)
    print(f"Converted {gltf_path} -> {glb_path} ({total_length} bytes)")

for f in glob.glob("public/assets/models/*.gltf"):
    out_glb = f[:-5] + ".glb"
    try:
        gltf_to_glb(f, out_glb)
    except Exception as e:
        print(f"Error converting {f}: {e}")
