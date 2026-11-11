#!/usr/bin/env python3
"""
Synthesizes professional multi-track soundtrack audio files for LAB GUARDIAN: REACTOR ZERO.
Outputs clean 16-bit 44.1kHz stereo WAVs and encodes to MP3 via ffmpeg:
1. menu_theme.mp3 (Central Hub & Menu - Ambient contemplative sci-fi pad & arpeggios)
2. research_theme.mp3 (Research Wing - Analytical, rhythmic pulses & glass FM bells)
3. refinery_theme.mp3 (Mass Refinery - Heavy industrial bass & driving mechanical beats)
4. vault_theme.mp3 (Mole Ratio Vault - Deep cavernous sub-bass & tense atmospheric drones)
5. boss_theme.mp3 (Boss Battle - High-octane 132 BPM combat electro-synth)
6. victory_sting.mp3 (Victory Stinger - Fanfare major chord resolution & chimes)
7. defeat_sting.mp3 (Defeat Stinger - Solemn descending minor cadence)
"""

import math
import struct
import wave
import os
import subprocess

SAMPLE_RATE = 44100

def clamp(v, min_v=-1.0, max_v=1.0):
    return max(min_v, min(max_v, v))

def write_wav(filename, left_samples, right_samples):
    n_samples = len(left_samples)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        
        raw_bytes = bytearray()
        for i in range(n_samples):
            l = int(clamp(left_samples[i]) * 32767)
            r = int(clamp(right_samples[i]) * 32767)
            raw_bytes.extend(struct.pack('<hh', l, r))
        wav_file.writeframes(raw_bytes)

def encode_mp3(wav_path, mp3_path):
    cmd = [
        'ffmpeg', '-y', '-i', wav_path,
        '-codec:a', 'libmp3lame', '-b:a', '192k',
        mp3_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(wav_path):
        os.remove(wav_path)
    print(f"Encoded {mp3_path} ({os.path.getsize(mp3_path)} bytes)")

# --- Sound Synthesis Helpers ---
def osc_sine(phase):
    return math.sin(phase)

def osc_triangle(phase):
    # Normalized -1 to 1
    p = (phase / (2 * math.pi)) % 1.0
    return 4.0 * abs(p - 0.5) - 1.0

def osc_saw(phase):
    p = (phase / (2 * math.pi)) % 1.0
    return 2.0 * p - 1.0

def adsr(t, duration, attack=0.05, decay=0.1, sustain=0.7, release=0.2):
    if t < 0 or t > duration:
        return 0.0
    if t < attack:
        return t / max(0.001, attack)
    elif t < attack + decay:
        dt = t - attack
        return 1.0 - (1.0 - sustain) * (dt / max(0.001, decay))
    elif t < duration - release:
        return sustain
    else:
        rt = (duration - t) / max(0.001, release)
        return sustain * max(0.0, rt)

# 1. MENU THEME (Hub & Menu) - 92 BPM, 16 bars (approx 20.87s loop)
def generate_menu_theme():
    bpm = 92
    beat_dur = 60.0 / bpm
    total_beats = 32
    duration = total_beats * beat_dur
    num_samples = int(duration * SAMPLE_RATE)
    
    left = [0.0] * num_samples
    right = [0.0] * num_samples
    
    # Chord progression: Dm9 (D, F, A, C, E) -> Bbmaj7 (Bb, D, F, A) -> C9 (C, E, G, Bb, D) -> Am7 (A, C, E, G)
    chords = [
        # Dm9
        ([73.42, 146.83, 174.61, 220.0, 261.63, 329.63], 8 * beat_dur),
        # Bbmaj7
        ([58.27, 116.54, 146.83, 174.61, 220.0, 293.66], 8 * beat_dur),
        # C9
        ([65.41, 130.81, 164.81, 196.0, 233.08, 293.66], 8 * beat_dur),
        # Am7
        ([55.0, 110.0, 130.81, 164.81, 196.0, 261.63], 8 * beat_dur),
    ]
    
    time_offset = 0.0
    for freqs, chord_dur in chords:
        for f in freqs:
            for s in range(int(chord_dur * SAMPLE_RATE)):
                idx = int((time_offset + s / SAMPLE_RATE) * SAMPLE_RATE)
                if idx >= num_samples: break
                t = s / SAMPLE_RATE
                env = adsr(t, chord_dur, attack=0.4, decay=0.8, sustain=0.6, release=0.8)
                phase = 2 * math.pi * f * t
                # Warm analog blend
                sample = (osc_sine(phase) * 0.7 + osc_triangle(phase * 2) * 0.2) * env * 0.08
                # Gentle panning across chord notes
                pan = 0.5 + 0.3 * math.sin(f * 0.05)
                left[idx] += sample * (1.0 - pan)
                right[idx] += sample * pan
        time_offset += chord_dur

    # Delicate glass marimba arpeggio
    arp_notes = [293.66, 349.23, 440.0, 523.25, 659.25, 523.25, 440.0, 349.23]
    arp_step = beat_dur / 2.0
    for step in range(int(total_beats * 2)):
        t_start = step * arp_step
        f = arp_notes[step % len(arp_notes)]
        note_dur = arp_step * 0.95
        for s in range(int(note_dur * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            env = math.exp(-t * 6.0) # Pluck envelope
            phase = 2 * math.pi * f * t
            # FM sine bell
            fm_mod = math.sin(phase * 2.0) * 0.3 * math.exp(-t * 12.0)
            sample = math.sin(phase + fm_mod) * env * 0.09
            pan = 0.3 + 0.4 * ((step % 4) / 4.0)
            left[idx] += sample * (1.0 - pan)
            right[idx] += sample * pan

    return left, right

# 2. RESEARCH THEME (Research Wing) - 104 BPM, Analytical, Rhythmic Pulses & Bells
def generate_research_theme():
    bpm = 104
    beat_dur = 60.0 / bpm
    total_beats = 32
    duration = total_beats * beat_dur
    num_samples = int(duration * SAMPLE_RATE)
    
    left = [0.0] * num_samples
    right = [0.0] * num_samples
    
    # Sequenced clinical synth bassline (E minor)
    bass_notes = [82.41, 82.41, 98.0, 82.41, 110.0, 98.0, 82.41, 73.42] # E2, G2, A2, D2
    step_dur = beat_dur / 2.0
    for step in range(int(total_beats * 2)):
        t_start = step * step_dur
        f = bass_notes[step % len(bass_notes)]
        for s in range(int(step_dur * 0.8 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            env = math.exp(-t * 8.0)
            phase = 2 * math.pi * f * t
            sample = (osc_triangle(phase) * 0.6 + osc_saw(phase) * 0.2) * env * 0.16
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    # Crisp percussion click (hi-hat / electronica tick)
    for step in range(int(total_beats * 4)):
        t_start = step * (beat_dur / 4.0)
        tick_dur = 0.03
        for s in range(int(tick_dur * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            # Filtered noise tick
            noise = ((math.sin(t * 84210) * 1000) % 2.0) - 1.0
            env = math.exp(-t * 90.0)
            sample = noise * env * (0.04 if step % 2 == 0 else 0.02)
            left[idx] += sample * 0.6
            right[idx] += sample * 0.4

    # High crystalline reagent bells
    lead_notes = [659.25, 783.99, 987.77, 1174.66, 987.77, 880.0, 659.25, 587.33]
    for step in range(total_beats):
        if step % 2 == 0:
            t_start = step * beat_dur
            f = lead_notes[(step // 2) % len(lead_notes)]
            for s in range(int(beat_dur * 1.5 * SAMPLE_RATE)):
                idx = int(t_start * SAMPLE_RATE) + s
                if idx >= num_samples: break
                t = s / SAMPLE_RATE
                env = math.exp(-t * 2.8)
                phase = 2 * math.pi * f * t
                fm = math.sin(phase * 3.5) * 0.4 * math.exp(-t * 6.0)
                sample = math.sin(phase + fm) * env * 0.08
                left[idx] += sample * 0.7
                right[idx] += sample * 0.3

    return left, right

# 3. REFINERY THEME (Mass Refinery) - 116 BPM, Heavy Industrial Bass & Mechanical Beats
def generate_refinery_theme():
    bpm = 116
    beat_dur = 60.0 / bpm
    total_beats = 32
    duration = total_beats * beat_dur
    num_samples = int(duration * SAMPLE_RATE)
    
    left = [0.0] * num_samples
    right = [0.0] * num_samples
    
    # Heavy kick drum on every beat
    for b in range(total_beats):
        t_start = b * beat_dur
        for s in range(int(0.25 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            # Pitch sweep 150Hz -> 42Hz
            f = 42 + 108 * math.exp(-t * 25.0)
            phase = 2 * math.pi * f * t
            env = math.exp(-t * 12.0)
            sample = math.sin(phase) * env * 0.32
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    # Industrial metallic snare on beats 2 & 4
    for b in range(1, total_beats, 2):
        t_start = b * beat_dur
        for s in range(int(0.2 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            noise = ((math.sin(t * 123456) * 500) % 2.0) - 1.0
            tone = math.sin(2 * math.pi * 220 * t) * 0.4
            env = math.exp(-t * 16.0)
            sample = (noise * 0.7 + tone) * env * 0.22
            left[idx] += sample * 0.55
            right[idx] += sample * 0.45

    # Heavy distorted saw bassline (C minor: C1, Eb1, F1, G1)
    bass_notes = [65.41, 65.41, 77.78, 65.41, 87.31, 77.78, 98.0, 65.41]
    step_dur = beat_dur / 2.0
    for step in range(int(total_beats * 2)):
        t_start = step * step_dur
        f = bass_notes[step % len(bass_notes)]
        for s in range(int(step_dur * 0.9 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            env = math.exp(-t * 5.0)
            phase = 2 * math.pi * f * t
            # Overdriven saw wave
            saw = osc_saw(phase)
            distorted = math.tanh(saw * 2.2) * 0.5
            sample = distorted * env * 0.22
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    # Syncopated industrial alarm synth riff
    stabs = [329.63, 392.0, 440.0, 523.25]
    for step in range(int(total_beats * 2)):
        if step % 4 == 2 or step % 8 == 7:
            t_start = step * step_dur
            f = stabs[(step // 4) % len(stabs)]
            for s in range(int(step_dur * 0.5 * SAMPLE_RATE)):
                idx = int(t_start * SAMPLE_RATE) + s
                if idx >= num_samples: break
                t = s / SAMPLE_RATE
                env = math.exp(-t * 8.0)
                phase = 2 * math.pi * f * t
                sample = osc_saw(phase) * env * 0.12
                left[idx] += sample * 0.7
                right[idx] += sample * 0.3

    return left, right

# 4. VAULT THEME (Mole Ratio Vault) - 78 BPM, Deep Cavernous Sub-Bass & Tension
def generate_vault_theme():
    bpm = 78
    beat_dur = 60.0 / bpm
    total_beats = 24
    duration = total_beats * beat_dur
    num_samples = int(duration * SAMPLE_RATE)
    
    left = [0.0] * num_samples
    right = [0.0] * num_samples
    
    # Massive 55 Hz A1 sub-bass drone with slow beating
    for s in range(num_samples):
        t = s / SAMPLE_RATE
        # Binaural frequency beat (55 Hz vs 55.4 Hz)
        p1 = 2 * math.pi * 55.0 * t
        p2 = 2 * math.pi * 55.4 * t
        lfo = 0.5 + 0.5 * math.sin(2 * math.pi * 0.1 * t)
        sample = (math.sin(p1) + math.sin(p1 * 2) * 0.3) * 0.18 * lfo
        left[s] += sample
        right[s] += (math.sin(p2) + math.sin(p2 * 2) * 0.3) * 0.18 * lfo

    # Tension swells (A minor pad swells every 6 beats)
    for b in range(0, total_beats, 6):
        t_start = b * beat_dur
        swell_dur = 5.5 * beat_dur
        pad_freqs = [220.0, 261.63, 329.63, 440.0]
        for f in pad_freqs:
            for s in range(int(swell_dur * SAMPLE_RATE)):
                idx = int(t_start * SAMPLE_RATE) + s
                if idx >= num_samples: break
                t = s / SAMPLE_RATE
                env = adsr(t, swell_dur, attack=1.8, decay=0.5, sustain=0.8, release=1.5)
                phase = 2 * math.pi * f * t
                sample = osc_triangle(phase) * env * 0.06
                left[idx] += sample * 0.6
                right[idx] += sample * 0.4

    # Distant resonance ping (echos in the cavernous reactor)
    for b in [3, 9, 15, 21]:
        t_start = b * beat_dur
        for s in range(int(2.0 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            env = math.exp(-t * 2.0)
            phase = 2 * math.pi * 880.0 * t
            sample = math.sin(phase) * env * 0.08
            left[idx] += sample * 0.3
            right[idx] += sample * 0.7

    return left, right

# 5. BOSS THEME (Boss Battle: Reactor Titan) - 132 BPM, High-Octane Electro Combat
def generate_boss_theme():
    bpm = 132
    beat_dur = 60.0 / bpm
    total_beats = 32
    duration = total_beats * beat_dur
    num_samples = int(duration * SAMPLE_RATE)
    
    left = [0.0] * num_samples
    right = [0.0] * num_samples
    
    # 4-on-the-floor pounding kick
    for b in range(total_beats):
        t_start = b * beat_dur
        for s in range(int(0.22 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            f = 48 + 140 * math.exp(-t * 30.0)
            phase = 2 * math.pi * f * t
            env = math.exp(-t * 14.0)
            sample = math.sin(phase) * env * 0.35
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    # Driving snare on beats 2 and 4
    for b in range(1, total_beats, 2):
        t_start = b * beat_dur
        for s in range(int(0.18 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            noise = ((math.sin(t * 98765) * 600) % 2.0) - 1.0
            env = math.exp(-t * 20.0)
            sample = noise * env * 0.25
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    # 16th-note rolling combat bassline (D minor: 73.42 Hz)
    step_dur = beat_dur / 4.0
    bass_pattern = [73.42, 73.42, 146.83, 73.42, 87.31, 73.42, 110.0, 98.0]
    for step in range(int(total_beats * 4)):
        t_start = step * step_dur
        f = bass_pattern[step % len(bass_pattern)]
        for s in range(int(step_dur * 0.85 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            env = math.exp(-t * 14.0)
            phase = 2 * math.pi * f * t
            saw = osc_saw(phase)
            sample = saw * env * 0.18
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    # Aggressive battle brass / lead melody (D minor pentatonic)
    melody = [293.66, 349.23, 392.0, 440.0, 523.25, 440.0, 392.0, 349.23]
    for step in range(total_beats):
        if step % 2 == 0:
            t_start = step * beat_dur
            f = melody[(step // 2) % len(melody)]
            for s in range(int(beat_dur * 0.8 * SAMPLE_RATE)):
                idx = int(t_start * SAMPLE_RATE) + s
                if idx >= num_samples: break
                t = s / SAMPLE_RATE
                env = math.exp(-t * 4.5)
                phase = 2 * math.pi * f * t
                saw1 = osc_saw(phase)
                saw2 = osc_saw(phase * 1.006) # Detuned chorus
                sample = (saw1 + saw2) * env * 0.12
                left[idx] += sample * 0.65
                right[idx] += sample * 0.35

    return left, right

# 6. VICTORY STING (Triumphant Major Fanfare) - ~6.5s
def generate_victory_sting():
    duration = 6.5
    num_samples = int(duration * SAMPLE_RATE)
    left = [0.0] * num_samples
    right = [0.0] * num_samples
    
    # Fanfare chords: C -> F -> G -> C (Bright Major Resolution)
    chords = [
        ([261.63, 329.63, 392.0], 0.0, 0.8),
        ([349.23, 440.0, 523.25], 0.8, 0.8),
        ([392.0, 493.88, 587.33], 1.6, 0.8),
        ([523.25, 659.25, 783.99, 1046.50], 2.4, 3.8) # Grand finale
    ]
    
    for freqs, start_t, chord_dur in chords:
        for f in freqs:
            for s in range(int(chord_dur * SAMPLE_RATE)):
                idx = int(start_t * SAMPLE_RATE) + s
                if idx >= num_samples: break
                t = s / SAMPLE_RATE
                env = adsr(t, chord_dur, attack=0.08, decay=0.3, sustain=0.7, release=1.2)
                phase = 2 * math.pi * f * t
                sample = (osc_triangle(phase) * 0.7 + osc_saw(phase) * 0.3) * env * 0.16
                pan = 0.5 + 0.25 * math.sin(f * 0.01)
                left[idx] += sample * (1.0 - pan)
                right[idx] += sample * pan

    # Shimmering high chimes at resolution (2.4s to 6.0s)
    chimes = [1046.5, 1318.5, 1567.98, 2093.0]
    for i, cf in enumerate(chimes):
        t_start = 2.4 + i * 0.15
        for s in range(int(2.5 * SAMPLE_RATE)):
            idx = int(t_start * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            env = math.exp(-t * 3.0)
            phase = 2 * math.pi * cf * t
            sample = math.sin(phase) * env * 0.09
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    return left, right

# 7. DEFEAT STING (Solemn Descending Minor Cadence) - ~5.5s
def generate_defeat_sting():
    duration = 5.5
    num_samples = int(duration * SAMPLE_RATE)
    left = [0.0] * num_samples
    right = [0.0] * num_samples
    
    # Descending minor sequence: D4 -> C4 -> Bb3 -> A3
    notes = [
        (293.66, 0.0, 1.2),
        (261.63, 1.2, 1.2),
        (233.08, 2.4, 1.2),
        (110.0, 3.6, 1.8), # Low A2 root
    ]
    
    for f, start_t, dur in notes:
        for s in range(int(dur * SAMPLE_RATE)):
            idx = int(start_t * SAMPLE_RATE) + s
            if idx >= num_samples: break
            t = s / SAMPLE_RATE
            env = adsr(t, dur, attack=0.1, decay=0.4, sustain=0.6, release=0.6)
            phase = 2 * math.pi * f * t
            sample = osc_saw(phase) * env * 0.18
            left[idx] += sample * 0.5
            right[idx] += sample * 0.5

    # Sub-bass rumble fade
    for s in range(num_samples):
        t = s / SAMPLE_RATE
        fade = max(0.0, 1.0 - t / duration)
        p = 2 * math.pi * 42.0 * t
        sample = math.sin(p) * fade * 0.14
        left[s] += sample * 0.5
        right[s] += sample * 0.5

    return left, right

def main():
    target_dir = 'public/assets/audio/music'
    os.makedirs(target_dir, exist_ok=True)
    
    tracks = [
        ('menu_theme', generate_menu_theme),
        ('research_theme', generate_research_theme),
        ('refinery_theme', generate_refinery_theme),
        ('vault_theme', generate_vault_theme),
        ('boss_theme', generate_boss_theme),
        ('victory_sting', generate_victory_sting),
        ('defeat_sting', generate_defeat_sting),
    ]
    
    for name, gen_func in tracks:
        print(f"Synthesizing {name}...")
        l, r = gen_func()
        wav_path = os.path.join(target_dir, f"{name}.wav")
        mp3_path = os.path.join(target_dir, f"{name}.mp3")
        write_wav(wav_path, l, r)
        encode_mp3(wav_path, mp3_path)
    
    print("All soundtrack audio files successfully synthesized!")

if __name__ == '__main__':
    main()
