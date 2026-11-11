# LAB GUARDIAN: REACTOR ZERO - 3D ASSET INVENTORY & ACQUISITION MANIFEST

This directory houses the 3D assets, textures, and models for **LAB GUARDIAN: REACTOR ZERO**.

## Architecture & Graceful Fallback System
The game's `AssetManager` (`src/game/assets/AssetManager.ts`) dynamically resolves assets via `@babylonjs/loaders`.
If any GLB model is missing or delayed, the engine automatically and silently substitutes a procedural 3D model without crashing, freezing, or throwing unhandled exceptions.

---

## 1. Integrated Real 3D GLB Assets (`public/assets/models/`)

| File Name | Asset Name | Status | Size | License | Source & Description |
|-----------|------------|--------|------|---------|---------------------|
| `security_drone.glb` | Malfunctioning Security Patrol Drone | **INTEGRATED & ACTIVE** | 40.1 KB | CC0 1.0 (Public Domain) | Multi-part robotic drone with articulated wings, blasters, ion thrusters, and PBR metallic materials. Integrated in `CombatSystem.ts`. |
| `containment_warden.glb` | Heavy Containment Warden (Boss) | **INTEGRATED & ACTIVE** | 3.19 MB | CC-BY 4.0 | Rigged heavy mechanical warden mech with animations and joints. Integrated in `CombatSystem.ts`. |
| `damaged_helmet.glb` | Damaged Operative Helmet Artifact | **INTEGRATED & ACTIVE** | 3.77 MB | CC-BY 4.0 | High-fidelity PBR battle-damaged sci-fi hazmat helmet. Integrated in `HubEnvironment.ts` and `ResearchWingEnvironment.ts` on observation pedestal. |
| `resource_crate.glb` | Tactical Resource Container | **INTEGRATED & ACTIVE** | 11.9 KB | CC0 1.0 (Public Domain) | Animated sci-fi supply container crate with opening hatches. Integrated across all campaign sectors. |
| `player_operative.glb` | Lab Guardian Operative | **INTEGRATED & READY** | 438 KB | Apache 2.0 | Rigged humanoid operative with walking animation. Available via `AssetManager.ts` while preserving the user-favored procedural operative suit. |

---

## 2. Integrated Multi-Track Game Soundtrack (`public/assets/audio/music/`)

All music tracks are fully synthesized, mastered, and encoded at 192 kbps CBR MP3 (44.1 kHz Stereo) with dual-channel seamless crossfading (2.0 - 3.5s) managed by `MusicManager.ts`:

| Track File | Sector / State | Key & Tempo | Size | License | Musical Description |
|------------|----------------|-------------|------|---------|---------------------|
| `menu_theme.mp3` | Main Menu & Central Hub | D minor / 92 BPM | 502 KB | Game Original / CC0 | Ambient analog synth pad chords (Dm9, Bbmaj7, C9, Am7) with delicate glass marimba arpeggio. |
| `research_theme.mp3` | Sector 01: Equation Research Wing | E minor / 104 BPM | 444 KB | Game Original / CC0 | Clinical, analytical sequenced synth bassline with crisp electronica percussion and crystalline FM bells. |
| `refinery_theme.mp3` | Sector 02: Mass Industrial Refinery | C minor / 116 BPM | 398 KB | Game Original / CC0 | Heavy industrial mechanical rhythm with distorted saw bassline, driving kick/snare, and syncopated alarm synths. |
| `vault_theme.mp3` | Sector 03: Mole Ratio Vault | A minor / 78 BPM | 444 KB | Game Original / CC0 | Cavernous 55 Hz sub-bass drone with slow binaural beating, tense ambient choir swells, and resonance pings. |
| `boss_theme.mp3` | Sector 03 Boss: Reactor Titan | D minor / 132 BPM | 350 KB | Game Original / CC0 | High-octane battle electro-synth with driving four-on-the-floor kick, 16th-note rolling bassline, and brass stabs. |
| `victory_sting.mp3` | Mission & Campaign Victory | C major / Fanfare | 157 KB | Game Original / CC0 | Triumphant major cadence resolution (C -> F -> G -> C) with shimmering high chimes. |
| `defeat_sting.mp3` | Reactor Meltdown / Defeat | D minor / Descending | 133 KB | Game Original / CC0 | Solemn descending minor cadence fading into a low sub-bass rumble. |

---

## 3. External 3D Asset Acquisition Manifest (Roadmap for Direct Download)

### Priority 2: Modular Laboratory Environment Pieces
- **Target Path**: `public/assets/environments/lab_modules.glb`
- **Recommended Library**: Kenney Sci-Fi Kit / Poly Haven
- **Source URL**: `https://kenney.nl/assets/sci-fi-kit` or `https://polyhaven.com/`
- **Format**: glTF 2.0 Binary (`.glb`)
- **License**: CC0 1.0 Universal (Public Domain)
- **Target Polycount**: 8,000 – 15,000 triangles total
- **Required Components**: Bulkhead blast door, wall struts, hexagonal floor tiles, ceiling catwalk
- **Current Fallback**: High-fidelity procedural laboratory arena with metallic composite floor, blast perimeters, and glowing floor conduits (`EnvironmentBuilder.ts`).

### Priority 3: Cold-Fusion Reactor Core
- **Target Path**: `public/assets/models/reactor_core.glb`
- **Recommended Library**: Quaternius Sci-Fi Modular / Poly Haven
- **Source URL**: `https://quaternius.com/`
- **Format**: glTF 2.0 Binary (`.glb`)
- **License**: CC0 1.0 Universal
- **Target Polycount**: 4,000 – 8,000 triangles
- **Required Components**: Central plasma containment vessel, magnetic induction stator rings
- **Current Fallback**: Real-time animated cold-fusion core with 3 independently rotating magnetic rings and pulsating plasma sphere (`EnvironmentBuilder.ts`).

### Priority 4: Chemical Synthesizer & Cryo Coolant Tanks
- **Target Paths**: `public/assets/models/chem_synthesizer.glb`, `public/assets/models/cryo_tank.glb`
- **Recommended Library**: Kenney Sci-Fi Kit
- **Source URL**: `https://kenney.nl/assets/sci-fi-kit`
- **Format**: glTF 2.0 Binary (`.glb`)
- **License**: CC0 1.0 Universal
- **Target Polycount**: 800 – 2,000 triangles each
- **Current Fallback**: Dedicated procedural stations with holographic analysis screens, cryo canisters, and proximity trigger fields (`InteractionManager.ts`).

### Priority 5: Collectible Pickups (Health, Energy, Ammo, Keycard)
- **Target Paths**: `public/assets/models/pickup_health.glb`, `pickup_energy.glb`, `pickup_ammo.glb`, `pickup_keycard.glb`
- **Recommended Library**: Kenney Assets / Quaternius
- **Current Fallback**: High-contrast compound 3D meshes:
  - Health: Glowing emerald crystal octahedron with inner medical cross.
  - Energy: Dual-cylinder power battery cell with golden terminal coils.
  - Ammo: Tactical cyan prism capacitor with orbiting accelerator ring.
  - Keycard: Golden holographic clearance badge with central security chip.
