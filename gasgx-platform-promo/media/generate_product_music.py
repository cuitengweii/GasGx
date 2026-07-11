from array import array
from math import cos, exp, pi, sin, sqrt
from pathlib import Path
import random
import wave


SAMPLE_RATE = 48_000
DURATION = 20.0
SAMPLES = int(SAMPLE_RATE * DURATION)
TAU = 2.0 * pi


left = array("f", [0.0]) * SAMPLES
right = array("f", [0.0]) * SAMPLES
rng = random.Random(21)


def pan_gains(pan):
    angle = (pan + 1.0) * pi / 4.0
    return cos(angle), sin(angle)


def envelope(position, duration, attack, release):
    if position < attack:
        return position / max(attack, 0.001)
    if position > duration - release:
        return max(0.0, (duration - position) / max(release, 0.001))
    return 1.0


def add_tone(start, duration, frequency, amplitude, pan=0.0, waveform="sine",
             attack=0.01, release=0.12, end_frequency=None):
    first = max(0, int(start * SAMPLE_RATE))
    last = min(SAMPLES, int((start + duration) * SAMPLE_RATE))
    gain_left, gain_right = pan_gains(pan)
    phase = 0.0

    for index in range(first, last):
        position = (index - first) / SAMPLE_RATE
        if end_frequency is None:
            current_frequency = frequency
        else:
            ratio = position / max(duration, 0.001)
            current_frequency = frequency * ((end_frequency / frequency) ** ratio)
        phase += TAU * current_frequency / SAMPLE_RATE
        phase_cycle = (phase / TAU) % 1.0
        if waveform == "saw":
            sample = 2.0 * phase_cycle - 1.0
        elif waveform == "triangle":
            sample = 1.0 - 4.0 * abs(round(phase_cycle) - phase_cycle)
        else:
            sample = sin(phase)
        level = amplitude * envelope(position, duration, attack, release)
        left[index] += sample * level * gain_left
        right[index] += sample * level * gain_right


def add_noise(start, duration, amplitude, pan=0.0, attack=0.002, release=0.08):
    first = max(0, int(start * SAMPLE_RATE))
    last = min(SAMPLES, int((start + duration) * SAMPLE_RATE))
    gain_left, gain_right = pan_gains(pan)
    previous = 0.0

    for index in range(first, last):
        position = (index - first) / SAMPLE_RATE
        raw = rng.uniform(-1.0, 1.0)
        previous = previous * 0.72 + raw * 0.28
        level = amplitude * envelope(position, duration, attack, release)
        left[index] += previous * level * gain_left
        right[index] += previous * level * gain_right


def add_kick(start, amplitude=0.48):
    add_tone(start, 0.22, 118.0, amplitude, end_frequency=42.0, attack=0.001, release=0.19)
    add_tone(start, 0.035, 1_800.0, amplitude * 0.08, release=0.03)


def add_snare(start):
    add_noise(start, 0.14, 0.16, pan=0.04, attack=0.002, release=0.12)
    add_tone(start, 0.09, 190.0, 0.10, pan=-0.04, release=0.08)


def add_hat(start, amplitude=0.045):
    add_noise(start, 0.045, amplitude, pan=0.28, attack=0.001, release=0.04)


def add_metal_hit(start, pan):
    for frequency, amplitude in ((710.0, 0.032), (1_080.0, 0.022), (1_610.0, 0.014)):
        add_tone(start, 0.24, frequency, amplitude, pan=pan, waveform="triangle", release=0.20)
    add_noise(start, 0.16, 0.018, pan=pan, release=0.14)


tempo = 120.0
beat = 60.0 / tempo
bar = beat * 4.0
progression = [
    (146.83, (146.83, 174.61, 220.00)),
    (116.54, (116.54, 146.83, 174.61)),
    (130.81, (130.81, 164.81, 196.00)),
    (98.00, (98.00, 116.54, 146.83)),
]


for bar_index in range(10):
    start = bar_index * bar
    root, chord = progression[bar_index % len(progression)]

    # Broad, restrained chord beds keep the track premium instead of abrasive.
    for note_index, note in enumerate(chord):
        add_tone(start, bar * 0.96, note, 0.035, pan=-0.18 + note_index * 0.18,
                 waveform="saw", attack=0.18, release=0.42)
        add_tone(start, bar * 0.96, note * 2.0, 0.012, pan=0.18 - note_index * 0.16,
                 waveform="sine", attack=0.22, release=0.38)

    # A compact eighth-note arpeggio gives the product reveal forward motion.
    arp = (chord[0] * 2.0, chord[1] * 2.0, chord[2] * 2.0, chord[0] * 4.0,
           chord[2] * 2.0, chord[1] * 2.0, chord[0] * 2.0, chord[2] * 2.0)
    for step, note in enumerate(arp):
        add_tone(start + step * beat / 2.0, beat * 0.38, note, 0.045,
                 pan=-0.3 if step % 2 == 0 else 0.3, waveform="triangle",
                 attack=0.008, release=0.18)

    add_metal_hit(start, -0.35 if bar_index % 2 == 0 else 0.35)
    if bar_index in (3, 7):
        add_noise(start + bar - 0.24, 0.24, 0.045, pan=0.0, attack=0.18, release=0.03)

    for beat_index in range(4):
        beat_start = start + beat_index * beat
        if beat_index in (0, 2):
            add_kick(beat_start, 0.52 if beat_index == 0 else 0.40)
        if beat_index in (1, 3):
            add_snare(beat_start)
        add_tone(beat_start, beat * 0.34, root, 0.105, pan=-0.08,
                 waveform="saw", attack=0.01, release=0.16)
        for half_step in range(2):
            add_hat(beat_start + half_step * beat / 2.0,
                    0.048 if half_step == 0 else 0.032)


# Add short room reflections so the synthetic layers feel like a designed cue.
delay_a = int(0.17 * SAMPLE_RATE)
delay_b = int(0.31 * SAMPLE_RATE)
left_source = left[:]
right_source = right[:]
for index in range(delay_b, SAMPLES):
    left[index] += left_source[index - delay_a] * 0.10 + left_source[index - delay_b] * 0.055
    right[index] += right_source[index - delay_a] * 0.10 + right_source[index - delay_b] * 0.055


for index in range(SAMPLES):
    seconds = index / SAMPLE_RATE
    fade_in = min(1.0, seconds / 0.8)
    fade_out = min(1.0, max(0.0, (DURATION - seconds) / 1.1))
    left[index] *= fade_in * fade_out
    right[index] *= fade_in * fade_out


peak = max(max(abs(value) for value in left), max(abs(value) for value in right), 0.001)
gain = 0.84 / peak
output_path = Path(__file__).with_name("product-music-premium.wav")
with wave.open(str(output_path), "wb") as output:
    output.setnchannels(2)
    output.setsampwidth(2)
    output.setframerate(SAMPLE_RATE)
    frames = bytearray()
    for left_value, right_value in zip(left, right):
        frames.extend(int(max(-1.0, min(1.0, left_value * gain)) * 32767).to_bytes(2, "little", signed=True))
        frames.extend(int(max(-1.0, min(1.0, right_value * gain)) * 32767).to_bytes(2, "little", signed=True))
    output.writeframes(frames)

print(output_path)
