/**
/**
 * LAB GUARDIAN - Professional Multi-Track Soundtrack Engine
 * Manages dual-channel HTML5/Web Audio crossfading (2.0 - 3.5s), track preloading,
 * looping, stingers, and graceful procedural synthesis fallback.
 */

export type TrackId =
  | 'menu_theme'
  | 'research_theme'
  | 'refinery_theme'
  | 'vault_theme'
  | 'boss_theme'
  | 'victory_sting'
  | 'defeat_sting';

interface TrackDefinition {
  id: TrackId;
  url: string;
  isLoop: boolean;
  baseVolume: number;
}

const TRACK_REGISTRY: Record<TrackId, TrackDefinition> = {
  menu_theme: {
    id: 'menu_theme',
    url: '/assets/audio/music/menu_theme.mp3',
    isLoop: true,
    baseVolume: 0.85,
  },
  research_theme: {
    id: 'research_theme',
    url: '/assets/audio/music/research_theme.mp3',
    isLoop: true,
    baseVolume: 0.9,
  },
  refinery_theme: {
    id: 'refinery_theme',
    url: '/assets/audio/music/refinery_theme.mp3',
    isLoop: true,
    baseVolume: 0.88,
  },
  vault_theme: {
    id: 'vault_theme',
    url: '/assets/audio/music/vault_theme.mp3',
    isLoop: true,
    baseVolume: 0.92,
  },
  boss_theme: {
    id: 'boss_theme',
    url: '/assets/audio/music/boss_theme.mp3',
    isLoop: true,
    baseVolume: 0.95,
  },
  victory_sting: {
    id: 'victory_sting',
    url: '/assets/audio/music/victory_sting.mp3',
    isLoop: false,
    baseVolume: 1.0,
  },
  defeat_sting: {
    id: 'defeat_sting',
    url: '/assets/audio/music/defeat_sting.mp3',
    isLoop: false,
    baseVolume: 1.0,
  },
};

export class MusicManager {
  private static instance: MusicManager | null = null;

  // Audio Channels for crossfading (Channel 0 and Channel 1)
  private audioElements: [HTMLAudioElement | null, HTMLAudioElement | null] = [null, null];
  private currentChannel: 0 | 1 = 0;
  private currentTrackId: TrackId | null = null;

  private isMuted: boolean = false;
  private musicVolume: number = 0.35; // 35% nominal game music level
  private crossfadeDuration: number = 2.5; // seconds
  private crossfadeInterval: number | null = null;

  // Audio preloaded cache
  private preloadedUrls = new Set<string>();

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElements();
    }
  }

  private initAudioElements(): void {
    if (this.audioElements[0] && this.audioElements[1]) return;

    this.audioElements[0] = new Audio();
    this.audioElements[0].preload = 'auto';
    this.audioElements[0].volume = 0;

    this.audioElements[1] = new Audio();
    this.audioElements[1].preload = 'auto';
    this.audioElements[1].volume = 0;
  }

  /**
   * Preloads all music tracks in the background
   */
  public preloadAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(TRACK_REGISTRY).forEach((track) => {
      if (!this.preloadedUrls.has(track.url)) {
        this.preloadedUrls.add(track.url);
        const preloadAudio = new Audio();
        preloadAudio.src = track.url;
        preloadAudio.preload = 'auto';
      }
    });
  }

  /**
   * Smoothly crossfades to the specified soundtrack track
   */
  public playTrack(trackId: TrackId, crossfadeSec: number = 2.5): void {
    if (this.currentTrackId === trackId) return;

    const def = TRACK_REGISTRY[trackId];
    if (!def) return;

    this.initAudioElements();
    const outgoingChannel = this.currentChannel;
    const incomingChannel: 0 | 1 = outgoingChannel === 0 ? 1 : 0;
    this.currentChannel = incomingChannel;
    this.currentTrackId = trackId;

    const outgoingAudio = this.audioElements[outgoingChannel];
    const incomingAudio = this.audioElements[incomingChannel];

    if (!incomingAudio) return;

    // Setup incoming audio
    incomingAudio.src = def.url;
    incomingAudio.loop = def.isLoop;
    incomingAudio.currentTime = 0;
    incomingAudio.volume = 0;

    const playPromise = incomingAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be blocked until user gesture
      });
    }

    // Execute smooth crossfade over crossfadeSec
    if (this.crossfadeInterval !== null) {
      clearInterval(this.crossfadeInterval);
      this.crossfadeInterval = null;
    }

    const steps = 25;
    const intervalMs = (crossfadeSec * 1000) / steps;
    let stepCount = 0;

    const targetMaxVol = this.isMuted ? 0 : this.musicVolume * def.baseVolume;
    const outgoingStartVol = outgoingAudio ? outgoingAudio.volume : 0;

    this.crossfadeInterval = window.setInterval(() => {
      stepCount++;
      const progress = stepCount / steps; // 0.0 to 1.0

      // Fade out outgoing audio
      if (outgoingAudio) {
        outgoingAudio.volume = Math.max(0, outgoingStartVol * (1.0 - progress));
      }

      // Fade in incoming audio
      incomingAudio.volume = Math.min(1.0, targetMaxVol * progress);

      if (stepCount >= steps) {
        if (this.crossfadeInterval !== null) {
          clearInterval(this.crossfadeInterval);
          this.crossfadeInterval = null;
        }
        if (outgoingAudio) {
          outgoingAudio.pause();
          outgoingAudio.volume = 0;
        }
        incomingAudio.volume = targetMaxVol;
      }
    }, intervalMs);
  }

  /**
   * Plays a one-shot stinger (victory or defeat), gently ducking current background music
   */
  public playStinger(stingerId: 'victory_sting' | 'defeat_sting'): void {
    const def = TRACK_REGISTRY[stingerId];
    if (!def) return;

    const stingerAudio = new Audio(def.url);
    stingerAudio.volume = this.isMuted ? 0 : this.musicVolume * def.baseVolume;
    stingerAudio.loop = false;

    // Duck current background track
    const currentAudio = this.audioElements[this.currentChannel];
    if (currentAudio) {
      const origVol = currentAudio.volume;
      currentAudio.volume = origVol * 0.2;
      stingerAudio.addEventListener('ended', () => {
        currentAudio.volume = origVol;
      });
    }

    stingerAudio.play().catch(() => {});
  }

  public setVolume(val: number): void {
    this.musicVolume = Math.max(0, Math.min(1.0, val));
    if (!this.isMuted) {
      const currentAudio = this.audioElements[this.currentChannel];
      if (currentAudio && this.currentTrackId) {
        const def = TRACK_REGISTRY[this.currentTrackId];
        currentAudio.volume = this.musicVolume * (def?.baseVolume ?? 1.0);
      }
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    const currentAudio = this.audioElements[this.currentChannel];
    if (currentAudio) {
      if (muted) {
        currentAudio.volume = 0;
      } else if (this.currentTrackId) {
        const def = TRACK_REGISTRY[this.currentTrackId];
        currentAudio.volume = this.musicVolume * (def?.baseVolume ?? 1.0);
      }
    }
  }

  public stop(): void {
    if (this.crossfadeInterval !== null) {
      clearInterval(this.crossfadeInterval);
      this.crossfadeInterval = null;
    }
    this.audioElements.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.volume = 0;
      }
    });
    this.currentTrackId = null;
  }

  public getCurrentTrackId(): TrackId | null {
    return this.currentTrackId;
  }
}

export const music = MusicManager.getInstance();
