import urllib.request
import os

ASSETS = {
    # Enemies (Quaternius - CC0)
    "public/assets/models/enemy_scout.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Characters/GLTF/Enemy_Flying.gltf",
    "public/assets/models/enemy_sentinel.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Characters/GLTF/Enemy_Large.gltf",
    "public/assets/models/enemy_ranged_guard.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Characters/GLTF/Enemy_Small.gltf",
    "public/assets/models/enemy_recon_probe.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Characters/GLTF/Enemy_ExtraSmall.gltf",
    
    # Modular Environment Geometry (Quaternius - CC0)
    "public/assets/models/modular_corridor.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/Connector.gltf",
    "public/assets/models/structural_column.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/MetalSupport.gltf",
    "public/assets/models/catwalk_stairs.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/Stairs.gltf",
    "public/assets/models/industrial_ramp.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/Ramp.gltf",
    "public/assets/models/ventilation_duct.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/Roof_VentL.gltf",
    "public/assets/models/radar_scanner.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/Roof_Radar.gltf",
    "public/assets/models/antenna_mast.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/Roof_Antenna.gltf",
    "public/assets/models/refinery_silo.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/House_Cylinder.gltf",
    "public/assets/models/modular_lab_unit.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Environment/GLTF/Building_L.gltf",
    "public/assets/models/industrial_crane_rover.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Vehicles/GLTF/Rover_1.gltf",
    
    # Modular Pickups (Quaternius - CC0)
    "public/assets/models/pickup_ammo.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Items/GLTF/Pickup_Bullets.gltf",
    "public/assets/models/pickup_health.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Items/GLTF/Pickup_Health.gltf",
    "public/assets/models/pickup_keycard.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Items/GLTF/Pickup_KeyCard.gltf",
    "public/assets/models/pickup_energy.gltf": "https://raw.githubusercontent.com/tilakpatell/tilakverse-assets/main/quaternius/ultimate-space-kit/Items/GLTF/Pickup_Thunder.gltf",
    
    # Industrial Heavy Machinery (Khronos - CC0 / Sample Models)
    "public/assets/models/refinery_engine.glb": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb",
    "public/assets/models/refinery_gearbox.glb": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/GearboxAssy/glTF-Binary/GearboxAssy.glb"
}

os.makedirs("public/assets/models", exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}
for path, url in ASSETS.items():
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        print(f"Skipping already downloaded: {path} ({os.path.getsize(path)} bytes)")
        continue
    try:
        print(f"Downloading {path} from {url}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(path, 'wb') as out_file:
            data = resp.read()
            out_file.write(data)
        print(f"Success: {path} ({len(data)} bytes)")
    except Exception as e:
        print(f"Failed to download {path}: {e}")

