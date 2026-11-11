/**
 * LAB GUARDIAN - Game Configuration Constants
 */

export const GAME_CONFIG = {
  TITLE: 'LAB GUARDIAN',
  SUBTITLE: 'REACTOR ZERO',
  TITLE_AR: 'حارس المختبر',
  SUBTITLE_AR: 'المفاعل صفر',

  // Player Physics & Movement
  PLAYER: {
    WALK_SPEED: 6.2,
    SPRINT_SPEED: 10.5,
    JUMP_STRENGTH: 8.5,
    GRAVITY: 21.0,
    RADIUS: 0.6,
    HEIGHT: 1.85,
    ROTATION_LERP: 0.15,
    SPAWN_POSITION: { x: 0, y: 0, z: -14 },
  },

  // Third-person Camera
  CAMERA: {
    DEFAULT_RADIUS: 7.2,
    MIN_RADIUS: 3.5,
    MAX_RADIUS: 12.0,
    DEFAULT_ALPHA: -Math.PI / 2, // Looking forward toward reactor at center (0,0,0)
    DEFAULT_BETA: 1.25, // Slightly above shoulder level
    MIN_BETA: 0.25, // Prevent looking directly top-down
    MAX_BETA: Math.PI / 2 - 0.08, // Prevent looking through floor
    TARGET_OFFSET_Y: 1.45,
    LERP_SPEED: 0.12,
    FOV: 0.85,
  },

  // World Bounds
  WORLD: {
    ARENA_RADIUS: 29.0,
    REACTOR_RADIUS: 4.8,
    CEILING_HEIGHT: 10.0,
  },

  // Colors (RGB / Hex)
  PALETTE: {
    NAVY_DEEP: '#050811',
    NAVY_PANEL: '#0c1427',
    NAVY_BORDER: '#1a2948',
    CYAN_PRIMARY: '#00f0ff',
    CYAN_GLOW: '#00e5ff',
    AMBER_WARNING: '#ffaa00',
    AMBER_GLOW: '#ff9100',
    EMERALD_STABLE: '#00ff88',
    CRIMSON_DANGER: '#ff2255',
    TEXT_LIGHT: '#e2e8f0',
    TEXT_MUTED: '#94a3b8',
  },

  // Interaction distance
  INTERACTION: {
    MAX_DISTANCE: 3.2,
  },
} as const;
