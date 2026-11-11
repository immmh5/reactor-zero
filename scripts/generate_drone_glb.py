#!/usr/bin/env python3
"""
Generates public/assets/models/security_drone.glb
A high-detail 3D mechanical patrol drone model with:
- Aerodynamic faceted fuselage
- Sensor eye optic with glowing emissive core
- Lateral stabilizer wings & angled winglets
- Underslung dual plasma blaster pods
- Dual rear ion thrusters with emissive exhaust rings
- Top communications crest & antenna
Valid glTF 2.0 binary (.glb) format.
"""

import json
import struct
import math
import os

def create_box(min_pt, max_pt):
    # 8 corners
    x0, y0, z0 = min_pt
    x1, y1, z1 = max_pt
    
    # 6 faces * 4 vertices = 24 vertices
    # Each face: normal, 4 pos, 2 tris
    faces = [
        # +Z Front
        ([0, 0, 1], [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]),
        # -Z Back
        ([0, 0, -1], [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)]),
        # +Y Top
        ([0, 1, 0], [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)]),
        # -Y Bottom
        ([0, -1, 0], [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)]),
        # +X Right
        ([1, 0, 0], [(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)]),
        # -X Left
        ([-1, 0, 0], [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)]),
    ]
    
    positions = []
    normals = []
    indices = []
    v_idx = 0
    for norm, quad in faces:
        for p in quad:
            positions.append(p)
            normals.append(norm)
        indices.extend([v_idx, v_idx + 1, v_idx + 2, v_idx, v_idx + 2, v_idx + 3])
        v_idx += 4
    return positions, normals, indices

def create_cylinder(center, radius, height, segments=16, axis='z'):
    cx, cy, cz = center
    positions = []
    normals = []
    indices = []
    
    half_h = height / 2.0
    
    # Generate circle vertices along axis
    # For axis == 'z', circle in XY plane, height along Z
    # For axis == 'y', circle in XZ plane, height along Y
    v_offset = 0
    
    # Tube
    for i in range(segments):
        a1 = 2 * math.pi * i / segments
        a2 = 2 * math.pi * (i + 1) / segments
        
        if axis == 'z':
            p1_top = (cx + radius * math.cos(a1), cy + radius * math.sin(a1), cz + half_h)
            p1_bot = (cx + radius * math.cos(a1), cy + radius * math.sin(a1), cz - half_h)
            p2_top = (cx + radius * math.cos(a2), cy + radius * math.sin(a2), cz + half_h)
            p2_bot = (cx + radius * math.cos(a2), cy + radius * math.sin(a2), cz - half_h)
            n1 = [math.cos(a1), math.sin(a1), 0]
            n2 = [math.cos(a2), math.sin(a2), 0]
        elif axis == 'y':
            p1_top = (cx + radius * math.cos(a1), cy + half_h, cz + radius * math.sin(a1))
            p1_bot = (cx + radius * math.cos(a1), cy - half_h, cz + radius * math.sin(a1))
            p2_top = (cx + radius * math.cos(a2), cy + half_h, cz + radius * math.sin(a2))
            p2_bot = (cx + radius * math.cos(a2), cy - half_h, cz + radius * math.sin(a2))
            n1 = [math.cos(a1), 0, math.sin(a1)]
            n2 = [math.cos(a2), 0, math.sin(a2)]
        else: # 'x'
            p1_top = (cx + half_h, cy + radius * math.cos(a1), cz + radius * math.sin(a1))
            p1_bot = (cx - half_h, cy + radius * math.cos(a1), cz + radius * math.sin(a1))
            p2_top = (cx + half_h, cy + radius * math.cos(a2), cz + radius * math.sin(a2))
            p2_bot = (cx - half_h, cy + radius * math.cos(a2), cz + radius * math.sin(a2))
            n1 = [0, math.cos(a1), math.sin(a1)]
            n2 = [0, math.cos(a2), math.sin(a2)]
            
        positions.extend([p1_bot, p2_bot, p2_top, p1_top])
        normals.extend([n1, n2, n2, n1])
        indices.extend([v_offset, v_offset + 1, v_offset + 2, v_offset, v_offset + 2, v_offset + 3])
        v_offset += 4
        
    # Caps
    # Front / Top cap
    cap_center = (cx, cy + half_h, cz) if axis == 'y' else ((cx, cy, cz + half_h) if axis == 'z' else (cx + half_h, cy, cz))
    cap_norm = [0, 1, 0] if axis == 'y' else ([0, 0, 1] if axis == 'z' else [1, 0, 0])
    
    center_idx = v_offset
    positions.append(cap_center)
    normals.append(cap_norm)
    v_offset += 1
    
    for i in range(segments):
        a = 2 * math.pi * i / segments
        if axis == 'y':
            p = (cx + radius * math.cos(a), cy + half_h, cz + radius * math.sin(a))
        elif axis == 'z':
            p = (cx + radius * math.cos(a), cy + radius * math.sin(a), cz + half_h)
        else:
            p = (cx + half_h, cy + radius * math.cos(a), cz + radius * math.sin(a))
        positions.append(p)
        normals.append(cap_norm)
        
    for i in range(segments):
        next_i = (i + 1) % segments
        indices.extend([center_idx, center_idx + 1 + i, center_idx + 1 + next_i])
    v_offset += segments
    
    # Bottom / Back cap
    back_center = (cx, cy - half_h, cz) if axis == 'y' else ((cx, cy, cz - half_h) if axis == 'z' else (cx - half_h, cy, cz))
    back_norm = [0, -1, 0] if axis == 'y' else ([0, 0, -1] if axis == 'z' else [-1, 0, 0])
    
    back_center_idx = v_offset
    positions.append(back_center)
    normals.append(back_norm)
    v_offset += 1
    
    for i in range(segments):
        a = 2 * math.pi * i / segments
        if axis == 'y':
            p = (cx + radius * math.cos(a), cy - half_h, cz + radius * math.sin(a))
        elif axis == 'z':
            p = (cx + radius * math.cos(a), cy + radius * math.sin(a), cz - half_h)
        else:
            p = (cx - half_h, cy + radius * math.cos(a), cz + radius * math.sin(a))
        positions.append(p)
        normals.append(back_norm)
        
    for i in range(segments):
        next_i = (i + 1) % segments
        indices.extend([back_center_idx, back_center_idx + 1 + next_i, back_center_idx + 1 + i])
    v_offset += segments

    return positions, normals, indices

def create_sphere(center, radius, rings=12, sectors=16):
    cx, cy, cz = center
    positions = []
    normals = []
    indices = []
    
    for r in range(rings + 1):
        theta = math.pi * r / rings
        sin_theta = math.sin(theta)
        cos_theta = math.cos(theta)
        for s in range(sectors + 1):
            phi = 2 * math.pi * s / sectors
            sin_phi = math.sin(phi)
            cos_phi = math.cos(phi)
            
            x = cos_phi * sin_theta
            y = cos_theta
            z = sin_phi * sin_theta
            
            positions.append((cx + radius * x, cy + radius * y, cz + radius * z))
            normals.append([x, y, z])
            
    for r in range(rings):
        for s in range(sectors):
            first = r * (sectors + 1) + s
            second = first + sectors + 1
            indices.extend([first, second, first + 1, second, second + 1, first + 1])
            
    return positions, normals, indices

def merge_mesh_data(mesh_list):
    positions = []
    normals = []
    indices = []
    offset = 0
    for pos, norm, ind in mesh_list:
        positions.extend(pos)
        normals.extend(norm)
        for i in ind:
            indices.append(i + offset)
        offset += len(pos)
    return positions, normals, indices

def build_drone_model():
    # 5 Materials:
    # 0: Chassis (Navy Gunmetal)
    # 1: Armor Plates (Carbon Dark Slate)
    # 2: Sensor Eye (Amber/Orange Emissive)
    # 3: Weapons (Chrome / Titanium Steel)
    # 4: Thruster Plumes (Cyan Blue Emissive)
    
    # 1. Chassis parts
    chassis_parts = []
    # Main fuselage
    chassis_parts.append(create_box((-0.45, -0.22, -0.6), (0.45, 0.22, 0.5)))
    # Cockpit wedge top
    chassis_parts.append(create_box((-0.35, 0.22, -0.4), (0.35, 0.38, 0.3)))
    # Lower avionics keel
    chassis_parts.append(create_box((-0.28, -0.38, -0.45), (0.28, -0.22, 0.35)))
    # Top communications ridge
    chassis_parts.append(create_box((-0.06, 0.38, -0.2), (0.06, 0.58, 0.2)))
    # Antenna needle
    chassis_parts.append(create_cylinder((0, 0.68, 0.05), 0.02, 0.25, segments=8, axis='y'))
    
    # 2. Armor Plates & Stabilizer Wings
    armor_parts = []
    # Left wing
    armor_parts.append(create_box((-1.25, 0.02, -0.3), (-0.45, 0.12, 0.35)))
    # Left vertical winglet
    armor_parts.append(create_box((-1.28, 0.02, -0.35), (-1.2, 0.42, 0.35)))
    # Right wing
    armor_parts.append(create_box((0.45, 0.02, -0.3), (1.25, 0.12, 0.35)))
    # Right vertical winglet
    armor_parts.append(create_box((1.2, 0.02, -0.35), (1.28, 0.42, 0.35)))
    # Front prow deflector plates
    armor_parts.append(create_box((-0.42, -0.18, 0.48), (0.42, 0.18, 0.6)))
    # Engine housing cowl Left
    armor_parts.append(create_cylinder((-0.32, 0.0, -0.62), 0.18, 0.25, segments=12, axis='z'))
    # Engine housing cowl Right
    armor_parts.append(create_cylinder((0.32, 0.0, -0.62), 0.18, 0.25, segments=12, axis='z'))
    
    # 3. Sensor Eye (Front Glowing Lens)
    sensor_parts = []
    # Central scanner eyeball
    sensor_parts.append(create_sphere((0, 0.02, 0.6), 0.22, rings=10, sectors=14))
    # Secondary tactical sensors (left & right)
    sensor_parts.append(create_sphere((-0.28, 0.14, 0.52), 0.08, rings=8, sectors=10))
    sensor_parts.append(create_sphere((0.28, 0.14, 0.52), 0.08, rings=8, sectors=10))
    
    # 4. Weapons (Underslung twin plasma blasters)
    weapon_parts = []
    # Left mount pylon
    weapon_parts.append(create_box((-0.55, -0.22, -0.1), (-0.45, -0.05, 0.2)))
    # Left cannon barrel
    weapon_parts.append(create_cylinder((-0.5, -0.25, 0.25), 0.07, 0.7, segments=10, axis='z'))
    # Left muzzle brake
    weapon_parts.append(create_cylinder((-0.5, -0.25, 0.62), 0.09, 0.08, segments=10, axis='z'))
    
    # Right mount pylon
    weapon_parts.append(create_box((0.45, -0.22, -0.1), (0.55, -0.05, 0.2)))
    # Right cannon barrel
    weapon_parts.append(create_cylinder((0.5, -0.25, 0.25), 0.07, 0.7, segments=10, axis='z'))
    # Right muzzle brake
    weapon_parts.append(create_cylinder((0.5, -0.25, 0.62), 0.09, 0.08, segments=10, axis='z'))
    
    # 5. Thruster Exhaust Plumes (Glowing Cyan)
    thruster_parts = []
    thruster_parts.append(create_cylinder((-0.32, 0.0, -0.74), 0.13, 0.12, segments=12, axis='z'))
    thruster_parts.append(create_cylinder((0.32, 0.0, -0.74), 0.13, 0.12, segments=12, axis='z'))
    
    primitives = [
        merge_mesh_data(chassis_parts),
        merge_mesh_data(armor_parts),
        merge_mesh_data(sensor_parts),
        merge_mesh_data(weapon_parts),
        merge_mesh_data(thruster_parts)
    ]
    return primitives

def export_glb(filepath, primitives):
    # Pack binary buffer
    bin_buffer = bytearray()
    
    accessors = []
    buffer_views = []
    mesh_primitives = []
    
    # For each primitive: positions, normals, indices
    for mat_idx, (pos_list, norm_list, ind_list) in enumerate(primitives):
        # Indices (UNSIGNED_SHORT = 5123 or UNSIGNED_INT = 5125)
        # Check max index
        max_idx = max(ind_list)
        is_uint = max_idx > 65535
        idx_component = 5125 if is_uint else 5123
        idx_format = '<I' if is_uint else '<H'
        idx_stride = 4 if is_uint else 2
        
        # Pad to 4 bytes
        while len(bin_buffer) % 4 != 0:
            bin_buffer.append(0)
        idx_byte_offset = len(bin_buffer)
        for idx in ind_list:
            bin_buffer.extend(struct.pack(idx_format, idx))
        idx_byte_length = len(bin_buffer) - idx_byte_offset
        while len(bin_buffer) % 4 != 0:
            bin_buffer.append(0)
            
        bv_idx = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": idx_byte_offset,
            "byteLength": idx_byte_length,
            "target": 34963 # ELEMENT_ARRAY_BUFFER
        })
        
        acc_idx = len(accessors)
        accessors.append({
            "bufferView": bv_idx,
            "byteOffset": 0,
            "componentType": idx_component,
            "count": len(ind_list),
            "type": "SCALAR",
            "max": [int(max(ind_list))],
            "min": [int(min(ind_list))]
        })
        
        # Positions (FLOAT = 5126)
        while len(bin_buffer) % 4 != 0:
            bin_buffer.append(0)
        pos_byte_offset = len(bin_buffer)
        min_p = [float('inf'), float('inf'), float('inf')]
        max_p = [float('-inf'), float('-inf'), float('-inf')]
        for x, y, z in pos_list:
            bin_buffer.extend(struct.pack('<fff', x, y, z))
            min_p[0] = min(min_p[0], x)
            min_p[1] = min(min_p[1], y)
            min_p[2] = min(min_p[2], z)
            max_p[0] = max(max_p[0], x)
            max_p[1] = max(max_p[1], y)
            max_p[2] = max(max_p[2], z)
            
        pos_byte_length = len(bin_buffer) - pos_byte_offset
        while len(bin_buffer) % 4 != 0:
            bin_buffer.append(0)
            
        bv_pos = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": pos_byte_offset,
            "byteLength": pos_byte_length,
            "target": 34962 # ARRAY_BUFFER
        })
        acc_pos = len(accessors)
        accessors.append({
            "bufferView": bv_pos,
            "byteOffset": 0,
            "componentType": 5126,
            "count": len(pos_list),
            "type": "VEC3",
            "max": [round(max_p[0], 4), round(max_p[1], 4), round(max_p[2], 4)],
            "min": [round(min_p[0], 4), round(min_p[1], 4), round(min_p[2], 4)]
        })
        
        # Normals (FLOAT = 5126)
        while len(bin_buffer) % 4 != 0:
            bin_buffer.append(0)
        norm_byte_offset = len(bin_buffer)
        min_n = [float('inf'), float('inf'), float('inf')]
        max_n = [float('-inf'), float('-inf'), float('-inf')]
        for nx, ny, nz in norm_list:
            bin_buffer.extend(struct.pack('<fff', nx, ny, nz))
            min_n[0] = min(min_n[0], nx)
            min_n[1] = min(min_n[1], ny)
            min_n[2] = min(min_n[2], nz)
            max_n[0] = max(max_n[0], nx)
            max_n[1] = max(max_n[1], ny)
            max_n[2] = max(max_n[2], nz)
            
        norm_byte_length = len(bin_buffer) - norm_byte_offset
        while len(bin_buffer) % 4 != 0:
            bin_buffer.append(0)
            
        bv_norm = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": norm_byte_offset,
            "byteLength": norm_byte_length,
            "target": 34962
        })
        acc_norm = len(accessors)
        accessors.append({
            "bufferView": bv_norm,
            "byteOffset": 0,
            "componentType": 5126,
            "count": len(norm_list),
            "type": "VEC3",
            "max": [round(max_n[0], 4), round(max_n[1], 4), round(max_n[2], 4)],
            "min": [round(min_n[0], 4), round(min_n[1], 4), round(min_n[2], 4)]
        })
        
        mesh_primitives.append({
            "attributes": {
                "POSITION": acc_pos,
                "NORMAL": acc_norm
            },
            "indices": acc_idx,
            "material": mat_idx
        })
        
    materials = [
        # 0: Chassis
        {
            "name": "Mat_Drone_Chassis",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.15, 0.20, 0.28, 1.0],
                "metallicFactor": 0.85,
                "roughnessFactor": 0.35
            }
        },
        # 1: Armor Plates
        {
            "name": "Mat_Drone_Armor",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.08, 0.10, 0.14, 1.0],
                "metallicFactor": 0.9,
                "roughnessFactor": 0.25
            }
        },
        # 2: Sensor Eye (Amber Glow)
        {
            "name": "Mat_Drone_Eye",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 0.45, 0.05, 1.0],
                "metallicFactor": 0.1,
                "roughnessFactor": 0.2
            },
            "emissiveFactor": [1.0, 0.45, 0.05]
        },
        # 3: Weapons
        {
            "name": "Mat_Drone_Weapons",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.12, 0.14, 0.18, 1.0],
                "metallicFactor": 0.95,
                "roughnessFactor": 0.2
            }
        },
        # 4: Thruster Cyan Glow
        {
            "name": "Mat_Drone_Thruster",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.0, 0.85, 1.0, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.1
            },
            "emissiveFactor": [0.0, 0.95, 1.0]
        }
    ]
    
    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "LabGuardianDroneGLBGenerator"
        },
        "scene": 0,
        "scenes": [{ "nodes": [0] }],
        "nodes": [{
            "name": "SecurityPatrolDrone",
            "mesh": 0
        }],
        "meshes": [{
            "name": "SecurityPatrolDroneMesh",
            "primitives": mesh_primitives
        }],
        "materials": materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{
            "byteLength": len(bin_buffer)
        }]
    }
    
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(json_bytes) % 4 != 0:
        json_bytes += b' ' # Space padding for JSON chunk
        
    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_buffer)
    
    with open(filepath, 'wb') as f:
        # Header (12 bytes)
        f.write(struct.pack('<4sII', b'glTF', 2, total_length))
        # Chunk 0: JSON
        f.write(struct.pack('<II', len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        # Chunk 1: BIN
        f.write(struct.pack('<II', len(bin_buffer), 0x004E4942))
        f.write(bin_buffer)
        
    print(f"Generated {filepath}: {total_length} bytes ({len(primitives)} primitives, {len(json_bytes)} JSON, {len(bin_buffer)} BIN)")

if __name__ == '__main__':
    os.makedirs('public/assets/models', exist_ok=True)
    prims = build_drone_model()
    export_glb('public/assets/models/security_drone.glb', prims)
