/**
 * LAB GUARDIAN - Professional Procedural Audio Engine
 * Features 3 independent mixing buses (Music, Ambience, SFX),
 * soft filtered laboratory hum (no harsh sawtooth), and a multi-state procedural soundtrack.
 */

import { music, TrackId } from './MusicManager';
import { LocationId } from '../campaign/CampaignTypes';

export type MusicState = 'menu' | 'gameplay' | 'boss' | 'victory' | 'defeat';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Master & Bus Gain Nodes
  private masterGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private ambienceBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private warningBus: GainNode | null = null;

  // Volume levels (0.0 to 1.0)
  public musicVolume: number = 0.35;
  public ambienceVolume: number = 0.08;
  public sfxVolume: number = 0.45;
  public warningVolume: number = 0.55;

  // Throttle timestamps for warning effects to prevent audio glitching
  private lastHeartbeatTime: number = 0;
  private lastAlarmTime: number = 0;
  private lastSirenTime: number = 0;
  private lastImpactTime: number = 0;

  // Ambience Nodes
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private isAmbientRunning: boolean = false;

  // Music Sequencer State
  private currentMusicState: MusicState = 'menu';
  private sequencerTimer: number | null = null;
  private stepCounter: number = 0;
  private isMusicPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        } else {
          if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted) {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  public initContext(): boolean {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1.0;
      this.masterGain.connect(this.ctx.destination);

      // Music Bus (Default: 35%)
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVolume;
      this.musicBus.connect(this.masterGain);

      // Ambience Bus (Default: 8% - gentle distant machinery)
      this.ambienceBus = this.ctx.createGain();
      this.ambienceBus.gain.value = this.ambienceVolume;
      this.ambienceBus.connect(this.masterGain);

      // SFX Bus (Default: 45%)
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.sfxVolume;
      this.sfxBus.connect(this.masterGain);

      // Warning & Hazard Bus (Default: 55% - clear tactical danger cues)
      this.warningBus = this.ctx.createGain();
      this.warningBus.gain.value = this.warningVolume;
      this.warningBus.connect(this.masterGain);

      return true;
    } catch {
      return false;
    }
  }

  public setMasterMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
    music.setMute(muted);
  }

  public getMasterMute(): boolean {
    return this.isMuted;
  }

  public setMusicVolume(val: number): void {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
    music.setVolume(this.musicVolume);
  }

  public setAmbienceVolume(val: number): void {
    this.ambienceVolume = Math.max(0, Math.min(1, val));
    if (this.ambienceBus && this.ctx) {
      this.ambienceBus.gain.setTargetAtTime(this.ambienceVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(val: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxBus && this.ctx) {
      this.sfxBus.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setWarningVolume(val: number): void {
    this.warningVolume = Math.max(0, Math.min(1, val));
    if (this.warningBus && this.ctx) {
      this.warningBus.gain.setTargetAtTime(this.warningVolume, this.ctx.currentTime, 0.05);
    }
  }

  // ==========================================
  // A. SOFT AMBIENT REACTOR TEXTURE (NO SAWTOOTH)
  // ==========================================
  public startAmbientHum(): void {
    if (!this.initContext() || !this.ctx || !this.ambienceBus || this.isAmbientRunning) return;

    try {
      this.isAmbientRunning = true;

      // Soft sine layer 1: 55 Hz (A1 sub-bass)
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Soft triangle layer 2: 82.4 Hz (E2 fifth)
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

      // Low-pass filter cutting off high buzzing (cutoff at 95 Hz)
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(95, this.ctx.currentTime);
      this.ambientFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Gentle LFO (0.2 Hz) for subtle machine breathing
      this.ambientLfo = this.ctx.createOscillator();
      this.ambientLfo.type = 'sine';
      this.ambientLfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(12, this.ctx.currentTime);
      this.ambientLfo.connect(lfoGain);
      lfoGain.connect(this.ambientFilter.frequency);

      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambienceBus);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.ambientLfo.start();
    } catch {
      this.isAmbientRunning = false;
    }
  }

  public stopAmbientHum(): void {
    if (this.ambientOsc1) {
      try {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
      } catch {}
      this.ambientOsc1 = null;
    }
    if (this.ambientOsc2) {
      try {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
      } catch {}
      this.ambientOsc2 = null;
    }
    if (this.ambientLfo) {
      try {
        this.ambientLfo.stop();
        this.ambientLfo.disconnect();
      } catch {}
      this.ambientLfo = null;
    }
    this.ambientFilter = null;
    this.isAmbientRunning = false;
  }

  // ==========================================
  // B. PROFESSIONAL MULTI-TRACK SOUNDTRACK & PROCEDURAL FALLBACK
  // ==========================================
  public setMusicState(state: MusicState): void {
    this.currentMusicState = state;
    if (state === 'menu') {
      music.playTrack('menu_theme', 2.0);
    } else if (state === 'boss') {
      music.playTrack('boss_theme', 1.5);
    } else if (state === 'victory') {
      music.playStinger('victory_sting');
    } else if (state === 'defeat') {
      music.playStinger('defeat_sting');
    } else if (state === 'gameplay') {
      // If no location track playing, default to menu_theme or research
      if (!music.getCurrentTrackId()) {
        music.playTrack('menu_theme', 2.0);
      }
    }
  }

  public playTrackForLocation(locationId: LocationId): void {
    if (this.currentMusicState === 'boss' && locationId === 'vault') {
      music.playTrack('boss_theme', 2.0);
      return;
    }

    switch (locationId) {
      case 'hub':
        music.playTrack('menu_theme', 2.5);
        break;
      case 'research_wing':
        music.playTrack('research_theme', 2.5);
        break;
      case 'refinery':
        music.playTrack('refinery_theme', 2.5);
        break;
      case 'vault':
        music.playTrack('vault_theme', 2.5);
        break;
      default:
        music.playTrack('menu_theme', 2.5);
        break;
    }
  }

  public playTrack(trackId: TrackId, crossfadeSec: number = 2.0): void {
    music.playTrack(trackId, crossfadeSec);
  }

  public playStinger(stingerId: 'victory_sting' | 'defeat_sting'): void {
    music.playStinger(stingerId);
  }

  public startMusic(): void {
    if (!this.initContext() || !this.ctx || !this.musicBus || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.stepCounter = 0;

    // Tempo: 98 BPM -> 16th note interval = 60 / (98 * 4) = ~0.153s
    const stepInterval = 153;

    this.sequencerTimer = window.setInterval(() => {
      this.tickSequencer();
    }, stepInterval);
  }

  public stopMusic(): void {
    if (this.sequencerTimer !== null) {
      clearInterval(this.sequencerTimer);
      this.sequencerTimer = null;
    }
    this.isMusicPlaying = false;
  }

  private tickSequencer(): void {
    if (!this.ctx || !this.musicBus || this.isMuted) return;

    const step = this.stepCounter % 16;
    const bar = Math.floor(this.stepCounter / 16) % 4;
    this.stepCounter++;

    const now = this.ctx.currentTime;

    // Chords progression: Am (A2/C3/E3), F (F2/A2/C3), C (C2/G2/E3), G (G2/B2/D3)
    const roots = [110, 87.31, 130.81, 98.0]; // A2, F2, C3, G2
    const currentRoot = roots[bar];

    // 1. Synth Bass Pulse (on steps 0, 4, 8, 12 in gameplay, every step in boss)
    const isBassStep =
      this.currentMusicState === 'boss'
        ? step % 2 === 0
        : step === 0 || step === 6 || step === 10;

    if (isBassStep && this.currentMusicState !== 'menu') {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = this.currentMusicState === 'boss' ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(currentRoot / 2, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(this.currentMusicState === 'boss' ? 240 : 160, now);

      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicBus);

      bassOsc.start(now);
      bassOsc.stop(now + 0.25);
    }

    // 2. Sci-Fi Melodic Arpeggio (steps 2, 5, 8, 11, 14)
    const arpeggioSteps = [0, 3, 6, 9, 12, 14];
    if (arpeggioSteps.includes(step)) {
      const scaleOffsets = [1, 1.25, 1.333, 1.5, 1.875, 2.0]; // Minor pentatonic intervals
      const noteFreq = currentRoot * scaleOffsets[(step + bar) % scaleOffsets.length];

      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(noteFreq * 2, now);

      const amp = this.currentMusicState === 'menu' ? 0.04 : 0.09;
      arpGain.gain.setValueAtTime(amp, now);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      arpOsc.connect(arpGain);
      arpGain.connect(this.musicBus);

      arpOsc.start(now);
      arpOsc.stop(now + 0.3);
    }
  }

  // ==========================================
  // C. COMBAT & GAMEPLAY SOUND EFFECTS
  // ==========================================

  /**
   * Player plasma laser fire (F key)
   */
  public playLaserFire(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxBus);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Enemy plasma orb impact or bolt explosion
   */
  public playImpact(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxBus);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  /**
   * Player taking damage from enemy
   */
  public playPlayerHit(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxBus);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  /**
   * Distinct pickup audio generator based on category
   */
  public playPickup(type: 'health' | 'energy' | 'ammo' | 'keycard' = 'health'): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const now = this.ctx.currentTime;

      if (type === 'health') {
        // Healing resonant chord (C5 - E5 - G5 warm harmonic chime)
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((f, idx) => {
          if (!this.ctx || !this.sfxBus) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.18, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxBus);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.38);
        });
      } else if (type === 'energy') {
        // Ascending electronic energy sweep (amber power boost)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.22);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'ammo') {
        // Tactical capacitor mechanical click + high tone
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(600, now);
        osc1.frequency.setValueAtTime(1200, now + 0.06);
        gain1.gain.setValueAtTime(0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(this.sfxBus);
        osc1.start(now);
        osc1.stop(now + 0.2);
      } else if (type === 'keycard') {
        // High-tech holographic access authorization confirmation
        const freqs = [880, 1174.66, 1760];
        freqs.forEach((f, idx) => {
          if (!this.ctx || !this.sfxBus) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);
          osc.connect(gain);
          gain.connect(this.sfxBus);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.3);
        });
      }
    } catch {}
  }

  // ==========================================
  // D. DYNAMIC DANGER & WARNING SYSTEM AUDIO
  // ==========================================

  /**
   * Low-health heartbeat pulse (sub-bass lub-dub thump)
   * @param intensity 0.0 to 1.0 (higher = faster and louder)
   */
  public playHeartbeat(intensity: number = 0.5): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.warningBus) return;

    const now = Date.now();
    const minInterval = 1000 - Math.min(650, intensity * 500); // 1000ms down to 350ms
    if (now - this.lastHeartbeatTime < minInterval) return;
    this.lastHeartbeatTime = now;

    try {
      const audioNow = this.ctx.currentTime;
      const vol = 0.15 + intensity * 0.25;

      // First thump (lub)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(52, audioNow);
      osc1.frequency.exponentialRampToValueAtTime(32, audioNow + 0.12);
      gain1.gain.setValueAtTime(vol, audioNow);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.14);
      osc1.connect(gain1);
      gain1.connect(this.warningBus);
      osc1.start(audioNow);
      osc1.stop(audioNow + 0.15);

      // Second thump (dub - slightly quieter and higher)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(46, audioNow + 0.16);
      osc2.frequency.exponentialRampToValueAtTime(28, audioNow + 0.28);
      gain2.gain.setValueAtTime(vol * 0.85, audioNow + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.3);
      osc2.connect(gain2);
      gain2.connect(this.warningBus);
      osc2.start(audioNow + 0.16);
      osc2.stop(audioNow + 0.32);
    } catch {}
  }

  /**
   * Critical health hazard alarm (two-tone urgent klaxon)
   */
  public playCriticalAlarm(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.warningBus) return;

    const now = Date.now();
    if (now - this.lastAlarmTime < 1400) return; // Throttled every 1.4s
    this.lastAlarmTime = now;

    try {
      const audioNow = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740, audioNow);
      osc.frequency.setValueAtTime(550, audioNow + 0.15);
      osc.frequency.setValueAtTime(740, audioNow + 0.3);
      osc.frequency.setValueAtTime(550, audioNow + 0.45);

      gain.gain.setValueAtTime(0.22, audioNow);
      gain.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.6);

      osc.connect(gain);
      gain.connect(this.warningBus);

      osc.start(audioNow);
      osc.stop(audioNow + 0.65);
    } catch {}
  }

  /**
   * Reactor instability warning siren (oscillating emergency horn)
   */
  public playReactorSiren(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.warningBus) return;

    const now = Date.now();
    if (now - this.lastSirenTime < 2200) return; // Throttled every 2.2s
    this.lastSirenTime = now;

    try {
      const audioNow = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, audioNow);
      osc.frequency.linearRampToValueAtTime(390, audioNow + 0.45);
      osc.frequency.linearRampToValueAtTime(240, audioNow + 0.9);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, audioNow);

      gain.gain.setValueAtTime(0.24, audioNow);
      gain.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.95);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.warningBus);

      osc.start(audioNow);
      osc.stop(audioNow + 1.0);
    } catch {}
  }

  /**
   * Heavy damage impact with low bass thump
   */
  public playDamageImpact(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.warningBus) return;

    const now = Date.now();
    if (now - this.lastImpactTime < 250) return;
    this.lastImpactTime = now;

    try {
      const audioNow = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, audioNow);
      osc.frequency.exponentialRampToValueAtTime(35, audioNow + 0.22);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, audioNow);

      gain.gain.setValueAtTime(0.35, audioNow);
      gain.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.warningBus);

      osc.start(audioNow);
      osc.stop(audioNow + 0.26);
    } catch {}
  }

  public playFootstep(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(85, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxBus);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {}
  }

  public playJump(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxBus);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  public playLand(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxBus);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  public playInteract(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.setValueAtTime(840, now + 0.07);

      osc2.frequency.setValueAtTime(1040, now);
      osc2.frequency.setValueAtTime(1680, now + 0.07);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxBus);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch {}
  }

  public playSuccess(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxBus) return;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.08);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.setValueAtTime(0.2, now + idx * 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        noteOsc.connect(noteGain);
        noteGain.connect(this.sfxBus);

        noteOsc.start(now + idx * 0.08);
        noteOsc.stop(now + idx * 0.08 + 0.5);
      });
    } catch {}
  }

  public playDefeat(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.sfxBus) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [330, 293.66, 261.63, 196]; // Descending minor cadence
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxBus) return;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        noteOsc.type = 'sawtooth';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.15);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now + idx * 0.15);

        noteGain.gain.setValueAtTime(0.25, now + idx * 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);

        noteOsc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.sfxBus);

        noteOsc.start(now + idx * 0.15);
        noteOsc.stop(now + idx * 0.15 + 0.4);
      });
    } catch {}
  }

  public dispose(): void {
    this.stopAmbientHum();
    this.stopMusic();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
}

export const sounds = new AudioEngine();
