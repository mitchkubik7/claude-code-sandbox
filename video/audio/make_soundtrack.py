#!/usr/bin/env python3
"""Procedurally synthesize the 60 s ad soundtrack (120 BPM, Am-F-C-G).

Output: ../public/soundtrack.wav (44.1 kHz, 16-bit stereo, exactly 60.0 s).
Cue timings come from ../src/timing.json (frame numbers at 30 fps).
Everything is generated with numpy/scipy; fixed seeds => deterministic.
"""
import json
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
TIMING = os.path.join(HERE, "..", "src", "timing.json")
OUT = os.path.join(HERE, "..", "public", "soundtrack.wav")

SR = 44100
DUR = 60.0
N = int(SR * DUR)
BEAT = 0.5          # 120 BPM
BAR = 2.0
FPS = 30

with open(TIMING) as fh:
    timing = json.load(fh)
SFX = timing["sfx"]


def f2s(frame):
    return frame / FPS


def mtof(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def tvec(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def saw(freq, t, phase=0.0):
    return 2.0 * ((freq * t + phase) % 1.0) - 1.0


def env_adsr(n, a, d, s, r, total):
    """Linear ADSR; `total` = held length (s) before release, n = samples."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6),
                 np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-6), s))
    rel = t > total
    e[rel] = s * np.clip(1 - (t[rel] - total) / max(r, 1e-6), 0, 1)
    return e


def add(bus, sig, t0, pan=0.0, gain=1.0):
    """Mix mono (1-D) or stereo (2,n) sig into stereo bus starting at t0 s."""
    i0 = int(round(t0 * SR))
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        sig = np.vstack([sig * l, sig * r])
    if i0 < 0:
        sig = sig[:, -i0:]
        i0 = 0
    n = min(sig.shape[1], N - i0)
    if n > 0:
        bus[:, i0:i0 + n] += gain * sig[:, :n]


def svf(x, fc, q=2.0, mode="bp"):
    """TPT state-variable filter with per-sample cutoff array (python loop;
    only used on short signals)."""
    g = np.tan(np.pi * np.clip(fc, 20, SR * 0.45) / SR)
    k = 1.0 / q
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    out = np.empty_like(x)
    ic1 = ic2 = 0.0
    for i in range(len(x)):
        v3 = x[i] - ic2
        v1 = a1[i] * ic1 + a2[i] * v3
        v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        if mode == "bp":
            out[i] = v1
        elif mode == "lp":
            out[i] = v2
        else:
            out[i] = x[i] - k * v1 - v2
    return out


rng = np.random.default_rng(1234)

# ---------------------------------------------------------------- buses
music = np.zeros((2, N))      # dry music
verb_send = np.zeros((2, N))  # reverb input
sc_music = np.zeros((2, N))   # pad + bass, sidechained by kick
sfx = np.zeros((2, N))

# ---------------------------------------------------------------- harmony
CHORDS = {  # pad voicing, bass midi, arp tones
    "Am": ([57, 60, 64], 33, [69, 72, 76, 81]),
    "F":  ([57, 60, 65], 29, [65, 69, 72, 77]),
    "C":  ([55, 60, 64], 36, [67, 72, 76, 79]),
    "G":  ([55, 59, 62], 31, [67, 71, 74, 79]),
}
PROG = ["Am", "F", "C", "G"]
NBARS = 30


def chord_of(bar):
    # Outro cadence: bars 27-28 = F, G, bar 29 = C (resolves to final C chord)
    if bar == 27:
        return "F"
    if bar == 28:
        return "G"
    if bar >= 29:
        return "C"
    return PROG[bar % 4]


def section(bar):
    if bar <= 2:
        return "hook"
    if bar <= 6:
        return "pain"
    if bar <= 26:
        return "drop"
    if bar <= 28:
        return "outro"
    return "end"


DROP_T = 14.0
CTA_T = 54.0

# ---------------------------------------------------------------- pad
def pad_note(midi, dur, cutoff, detune_cents=(-11, -4, 4, 11)):
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    f = mtof(midi)
    out = np.zeros((2, n))
    prng = np.random.default_rng(int(midi * 7 + dur * 10))
    for i, c in enumerate(detune_cents):
        ff = f * 2 ** (c / 1200)
        # L/R get slightly different detune + phase -> width
        out[0] += saw(ff * (1 + 0.0007), t, prng.random())
        out[1] += saw(ff * (1 - 0.0007), t, prng.random())
    out /= len(detune_cents)
    e = env_adsr(n, 0.45, 0.6, 0.8, 1.1, dur)
    out[0] = lp(out[0], cutoff, 2) * e
    out[1] = lp(out[1], cutoff * 1.04, 2) * e
    return out


for bar in range(NBARS):
    sec = section(bar)
    tones, _, _ = CHORDS[chord_of(bar)]
    cutoff = {"hook": 900, "pain": 1100, "drop": 2200, "outro": 1600, "end": 1800}[sec]
    gain = {"hook": 0.20, "pain": 0.17, "drop": 0.17, "outro": 0.14, "end": 0.22}[sec]
    dur = 2.0 if bar < 29 else 2.0
    for m in tones:
        note = pad_note(m, dur, cutoff)
        add(sc_music, note, bar * BAR, gain=gain)
        add(verb_send, note, bar * BAR, gain=gain * 0.5)
    if sec == "end":  # add a low C and high E for a fuller final chord
        for m in (48, 72):
            note = pad_note(m, dur, 1800)
            add(sc_music, note, bar * BAR, gain=0.14)
            add(verb_send, note, bar * BAR, gain=0.1)

# tension shimmer in pain section: soft high B (9th) wobbling against chord
t = tvec(8.0)
shim = np.sin(2 * np.pi * mtof(83) * t * (1 + 0.002 * np.sin(2 * np.pi * 5.5 * t)))
shim *= np.clip(t / 3, 0, 1) * np.clip((8 - t) / 0.5, 0, 1) * 0.025
add(music, shim, 6.0, pan=0.3)
add(verb_send, shim, 6.0, gain=1.5)

# ---------------------------------------------------------------- pluck
def pluck(midi, bright=1.0, dur=0.6):
    t = tvec(dur)
    f = mtof(midi)
    s = np.zeros_like(t)
    for k in range(1, 11):
        if f * k > 14000:
            break
        s += (1.0 / k) * np.exp(-t * (6 + k * 5.0 / bright)) * np.sin(2 * np.pi * f * k * t)
    s *= np.minimum(t / 0.002, 1)
    return s * 0.5


ARP_PAT = [0, 1, 2, 3, 2, 1, 2, 3]
for bar in range(NBARS):
    sec = section(bar)
    _, _, arp = CHORDS[chord_of(bar)]
    if sec == "end":
        # final strum
        for j, m in enumerate([60, 64, 67, 72, 76]):
            s = pluck(m, 1.2, 2.2)
            add(music, s, bar * BAR + j * 0.03, pan=-0.4 + 0.2 * j, gain=0.22)
            add(verb_send, s, bar * BAR + j * 0.03, gain=0.15)
        continue
    gain = {"hook": 0.16, "pain": 0.13, "drop": 0.16, "outro": 0.12}[sec]
    bright = {"hook": 0.7, "pain": 0.8, "drop": 1.6, "outro": 1.1}[sec]
    for i in range(8):
        m = arp[ARP_PAT[i]]
        tt = bar * BAR + i * 0.25
        s = pluck(m, bright)
        pan = -0.35 if i % 2 == 0 else 0.35
        add(music, s, tt, pan=pan, gain=gain * (1.0 if i % 2 == 0 else 0.8))
        add(verb_send, s, tt, gain=gain * 0.35)

# ---------------------------------------------------------------- lead hook (drop)
LEAD = [  # (beat offset within 4-bar phrase, length beats, midi)
    (0, 1, 76), (1.5, 0.5, 74), (2, 1, 72), (3, 0.5, 74), (3.5, 0.5, 76),
    (4, 1.5, 77), (5.5, 0.5, 76), (6, 2, 72),
    (8, 1, 79), (9.5, 0.5, 76), (10, 1, 72), (11, 1, 74),
    (12, 1.5, 74), (13.5, 0.5, 71), (14, 1, 74), (15, 1, 71),
]


def lead_note(midi, dur):
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    f = mtof(midi) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t) * np.clip(t / 0.3, 0, 1))
    ph = np.cumsum(f) / SR
    s = 0.5 * np.sign(np.sin(2 * np.pi * ph)) + 0.5 * (2 * ((ph * 1.005) % 1) - 1)
    s = lp(s, 3200, 2)
    return s * env_adsr(n, 0.01, 0.15, 0.6, 0.2, dur)


lead = np.zeros((2, N))
# phrase starts (bars): drop bars 7..26 => phrases at 7, 11, 15, 19, 23 (bar 7 = Am? 7%4=3 -> G)
# Align phrase to Am bars: bars 8, 12, 16, 20, 24 (Am-F-C-G)
for pb in (8, 16, 20, 24):
    octave = 12 if pb == 20 else 0
    for off, ln, m in LEAD:
        tt = pb * BAR + off * BEAT
        if tt >= CTA_T:
            continue
        s = lead_note(m + octave, ln * BEAT * 0.9)
        add(lead, s, tt, gain=0.075)
# ping-pong dotted-8th delay
dly = int(0.375 * SR)
lead_out = lead.copy()
for k in range(1, 5):
    g = 0.38 ** k
    src = lead[0] + lead[1]
    ch = k % 2  # alternate R, L
    lead_out[ch, k * dly:] += 0.5 * g * src[:-k * dly]
music += lead_out
verb_send += lead_out * 0.3

# ---------------------------------------------------------------- bass
def bass_note(midi, dur, drive=1.0):
    n = int((dur + 0.02) * SR)
    t = np.arange(n) / SR
    f = mtof(midi)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) \
        + 0.12 * lp(saw(f * 2, t), 900)
    s = np.tanh(s * drive)
    e = np.minimum(t / 0.005, 1) * np.clip((dur + 0.02 - t) / 0.03, 0, 1)
    return s * e


for bar in range(3, 29):
    sec = section(bar)
    _, root, _ = CHORDS[chord_of(bar)]
    for i in range(8):
        tt = bar * BAR + i * 0.25
        if sec == "pain":
            # pulsing 8ths with decaying envelope -> nervous pump
            s = bass_note(root + 12, 0.22, 1.2)
            s *= np.exp(-np.arange(len(s)) / SR * 7)
            add(sc_music, s, tt, gain=0.20)
        elif sec == "drop":
            # round offbeat-leaning bass: octave jump on the last 8th
            m = root + 12 if i in (3, 7) else root + (12 if i % 2 else 0)
            s = bass_note(m, 0.24, 1.6)
            add(sc_music, s, tt, gain=0.24)
        elif sec == "outro" and i % 2 == 0:
            s = bass_note(root + 12, 0.45, 1.2)
            add(sc_music, s, tt, gain=0.11)

# ---------------------------------------------------------------- drums
def kick():
    t = tvec(0.45)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.18)
    s += 0.25 * hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.004)
    return np.tanh(1.6 * s)


def clap():
    t = tvec(0.35)
    nz = bp(rng.standard_normal(len(t)), 900, 3000)
    e = np.zeros_like(t)
    for d in (0.0, 0.011, 0.022):
        e += (t >= d) * np.exp(-np.clip(t - d, 0, None) / 0.008)
    e += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) / 0.07)
    return nz * e * 0.6


def snare():
    t = tvec(0.25)
    s = 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)
    s += bp(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.06)
    return s * 0.6


def hat(decay):
    t = tvec(decay * 6)
    s = hp(rng.standard_normal(len(t)), 7000, 4) * np.exp(-t / decay)
    return s


def crash():
    t = tvec(2.5)
    return hp(rng.standard_normal(len(t)), 4500, 2) * np.exp(-t / 0.7) * 0.25


kick_times = []
KICK = kick()
for bar in range(7, 29):
    for b in range(4):
        tt = bar * BAR + b * BEAT
        if 43.0 <= tt < 44.0:      # kick drop for half a bar before 44 s
            continue
        kick_times.append(tt)
for tt in kick_times:
    add(music, KICK, tt, gain=0.62 if tt < CTA_T else 0.42)

# claps on 2 & 4 (drop)
for bar in range(7, 27):
    for b in (1, 3):
        tt = bar * BAR + b * BEAT
        c = clap()
        add(music, c, tt, pan=0.0, gain=0.45)
        add(verb_send, c, tt, gain=0.35)
# outro: lighter claps only on beat 4 (keeps a pulse without hats)
for bar in (27, 28):
    c = clap()
    add(music, c, bar * BAR + 3 * BEAT, gain=0.3)
    add(verb_send, c, bar * BAR + 3 * BEAT, gain=0.3)

# fills: 16th snare run on the last beat of every 4th bar, bigger every 8
for bar in (10, 14, 18, 22, 26):
    n16 = 4 if bar not in (14, 26) else 8
    start = bar * BAR + 2.0 - n16 * 0.125
    for k in range(n16):
        s = snare()
        add(music, s, start + k * 0.125, pan=(-0.3 + 0.6 * k / max(n16 - 1, 1)),
            gain=0.18 + 0.25 * k / n16)
        add(verb_send, s, start + k * 0.125, gain=0.15)
# fill during the half-bar kick drop (43-44 s): rising snare 16ths
for k in range(8):
    tt = 43.0 + k * 0.125
    s = snare()
    add(music, s, tt, gain=0.12 + 0.3 * k / 8)
    add(verb_send, s, tt, gain=0.2)

# hats: offbeat open hats + quiet 16th closed hats in drop (width via L/R offset)
for bar in range(7, 27):
    for b in range(4):
        tt = bar * BAR + b * BEAT + 0.25
        h = hat(0.06)
        hs = np.vstack([h, np.concatenate([np.zeros(int(0.006 * SR)), h])[:len(h)]])
        add(music, hs * np.array([[0.8], [1.0]]), tt, gain=0.16)
    for k in range(16):
        if k % 2 == 1 and (k // 2) % 2 == 1:
            pass
        tt = bar * BAR + k * 0.125
        h = hat(0.012)
        acc = 1.0 if k % 2 == 0 else 0.6
        add(music, h, tt, pan=-0.45 + (0.1 if k % 4 == 2 else 0), gain=0.06 * acc)

# pain section: clock-like ticking 16ths (tick-tock alternating tone)
for bar in range(3, 7):
    for k in range(16):
        tt = bar * BAR + k * 0.125
        t = tvec(0.03)
        f = 3200 if k % 2 == 0 else 2600
        s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) * 0.6 + hat(0.005)[:len(t)] * 0.4
        acc = 1.0 if k % 4 == 0 else 0.55
        add(music, s, tt, pan=(-0.3 if k % 2 == 0 else 0.3), gain=0.07 * acc)

# crashes at phrase restarts
for tt in (DROP_T, 30.0, 44.0):
    c = crash()
    add(music, c, tt, pan=0.2, gain=0.6)
    add(verb_send, c, tt, gain=0.3)

# ---------------------------------------------------------------- riser bar 6 (12 -> 13.92 s)
rdur = 1.92
t = tvec(rdur)
prog = t / rdur
nz = rng.standard_normal(len(t))
fc = 300 * (30 ** prog)           # 300 Hz -> 9 kHz
riser = svf(nz, fc, q=1.6, mode="bp") * (prog ** 2) * 0.55
pitch = 180 * (8 ** prog)         # 180 -> 1440 Hz
ph = 2 * np.pi * np.cumsum(pitch) / SR
riser += (0.5 * np.sin(ph) + 0.2 * np.sin(2 * ph)) * (prog ** 2.2) * 0.18
riser_st = np.vstack([riser, np.roll(riser, int(0.009 * SR))])
add(music, riser_st, 12.0, gain=0.9)
add(verb_send, riser_st, 12.0, gain=0.35)
# snare roll accelerating in bar 6
times = list(np.arange(12.0, 13.0, 0.25)) + list(np.arange(13.0, 13.5, 0.125)) \
    + list(np.arange(13.5, 13.92, 0.0625))
for i, tt in enumerate(times):
    s = snare()
    add(music, s, tt, gain=0.06 + 0.22 * (tt - 12.0) / 1.92)

# ---------------------------------------------------------------- sidechain + ducking
sc = np.ones(N)
dk = np.arange(int(0.4 * SR)) / SR
duck_shape = 1 - 0.65 * np.exp(-dk / 0.09) * np.minimum(dk / 0.003 + 0.0, 1) ** 0.2
for tt in kick_times:
    i0 = int(tt * SR)
    n = min(len(dk), N - i0)
    sc[i0:i0 + n] = np.minimum(sc[i0:i0 + n], duck_shape[:n])
music += sc_music * sc

# short silence right before the drop (13.92 -> 14.0) and a breath before CTA
def gap(bus, t_end, length, fade=0.01):
    g = np.ones(N)
    a, b = int((t_end - length) * SR), int(t_end * SR)
    fl = int(fade * SR)
    g[a - fl:a] = np.linspace(1, 0, fl)
    g[a:b] = 0
    g[b:b + 40] = np.linspace(0, 1, 40)
    bus *= g


# ---------------------------------------------------------------- reverb
def make_ir(dur, rt60, seed, lp_fc):
    r = np.random.default_rng(seed)
    t = tvec(dur)
    ir = r.standard_normal(len(t)) * np.exp(-6.9 * t / rt60)
    ir = lp(ir, lp_fc)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))  # predelay-ish
    return ir / np.sqrt(np.sum(ir ** 2))


IR_L = make_ir(2.8, 2.2, 11, 6000)
IR_R = make_ir(2.8, 2.2, 22, 6000)

# ---------------------------------------------------------------- impacts (from timing.json)
def impact():
    t = tvec(3.0)
    f = 28 + 70 * np.exp(-t / 0.12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-t / 0.9) * np.minimum(t / 0.002, 1)
    nzb = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.12)
    crack = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.025)
    return np.tanh(1.3 * boom) * 0.9 + nzb * 0.45 + crack * 0.2


impact_bus = np.zeros((2, N))
for fr in SFX.get("impact", []):
    s = impact()
    add(impact_bus, s, f2s(fr), gain=0.85)
    add(verb_send, s, f2s(fr), gain=0.5)

gap(music, DROP_T, 0.08)
gap(music, CTA_T, 0.05)
gap(verb_send, DROP_T, 0.08)

verb = np.vstack([fftconvolve(verb_send[0], IR_L)[:N], fftconvolve(verb_send[1], IR_R)[:N]])
verb = hp(verb, 180)
music += verb * 0.32

# drop -> CTA: groove ends at 54; music between 54 and 58 is the lighter version
# (already arranged); final fade 58 -> 60 applied on master below.

# ---------------------------------------------------------------- SFX
srng = np.random.default_rng(777)


def whoosh():
    dur = 0.55
    t = tvec(dur)
    peak = 0.35
    nz = srng.standard_normal(len(t))
    fc = 350 * (14 ** (t / dur))
    s = svf(nz, fc, q=1.4, mode="bp")
    e = np.where(t < peak, (t / peak) ** 2, np.exp(-(t - peak) / 0.06))
    s *= e
    pan = np.linspace(-0.6, 0.6, len(t))
    return np.vstack([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)]) * 1.4


def slam():
    t = tvec(0.6)
    f = 40 + 90 * np.exp(-t / 0.03)
    thud = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    crack = bp(srng.standard_normal(len(t)), 1500, 9000) * np.exp(-t / 0.018)
    return np.tanh(1.8 * thud) * 0.8 + crack * 0.35


def pop():
    t = tvec(0.07)
    k = 2 ** (srng.uniform(-2, 2) / 12)
    f = (400 + 500 * np.exp(-t / 0.015)) * k
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.minimum(t / 0.002, 1) * np.exp(-t / 0.022)
    return s * e


def tick_ding():
    t = tvec(0.5)
    s = np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t / 0.12) \
        + 0.5 * np.sin(2 * np.pi * 1975.5 * t) * np.exp(-t / 0.07)
    return s * np.minimum(t / 0.002, 1) * 0.6


def blip(i):
    t = tvec(0.06)
    scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
    f0 = mtof(81 + scale[i % len(scale)])
    f = f0 * (1 + 0.15 * (t / 0.06))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s += 0.25 * np.sign(s)
    return lp(s, 6000) * np.minimum(t / 0.001, 1) * np.exp(-t / 0.02) * 0.6


def click():
    t = tvec(0.03)
    s = hp(srng.standard_normal(len(t)), 3000) * np.exp(-t / 0.0015)
    s += 0.6 * np.sin(2 * np.pi * 2200 * t) * np.exp(-t / 0.004)
    s2 = np.zeros(len(t))
    i = int(0.012 * SR)
    s2[i:] = 0.5 * s[: len(t) - i]
    return s + s2


for fr in SFX.get("whoosh", []):
    add(sfx, whoosh(), f2s(fr) - 0.35, gain=0.22)
for fr in SFX.get("slam", []):
    s = slam()
    add(sfx, s, f2s(fr), gain=0.5)
    add(sfx, np.vstack([fftconvolve(s, IR_L)[:len(s) * 3], fftconvolve(s, IR_R)[:len(s) * 3]]),
        f2s(fr), gain=0.06)
for j, fr in enumerate(SFX.get("pop", [])):
    add(sfx, pop(), f2s(fr), pan=(-0.25 if j % 2 else 0.25), gain=0.22)
for fr in SFX.get("tick", []):
    s = tick_ding()
    add(sfx, s, f2s(fr), gain=0.22)
    add(sfx, np.vstack([fftconvolve(s, IR_L)[:SR], fftconvolve(s, IR_R)[:SR]]), f2s(fr), gain=0.05)
for i, fr in enumerate(SFX.get("blip", [])):
    add(sfx, blip(i), f2s(fr), pan=-0.5 + i / 9.0, gain=0.16)
for fr in SFX.get("click", []):
    add(sfx, click(), f2s(fr), gain=0.3)

# ---------------------------------------------------------------- master
mix = music + impact_bus + sfx
mix = hp(mix, 25)

# loudness: scale so the drop section hits a target RMS, then soft-limit
drop_rms = np.sqrt(np.mean(mix[:, int(16 * SR):int(52 * SR)] ** 2))
TARGET_DROP_RMS = 0.26
mix *= TARGET_DROP_RMS / drop_rms
mix = np.tanh(mix * 1.1) / 1.1

# final fade 58.0 -> 60.0 to exact silence (equal-power-ish curve)
fade = np.ones(N)
a = int(58.0 * SR)
x = np.linspace(0, 1, N - a)
fade[a:] = np.cos(x * np.pi / 2) ** 1.5
fade[-1] = 0.0
mix *= fade
mix[:, :int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))

peak = np.max(np.abs(mix))
mix *= 10 ** (-1 / 20) / peak
# output trim to land around -14.5 LUFS integrated (peak stays <= -1 dBFS)
OUTPUT_TRIM_DB = -2.3
mix *= 10 ** (OUTPUT_TRIM_DB / 20)

pcm = np.clip(np.round(mix.T * 32767), -32768, 32767).astype(np.int16)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
wavfile.write(OUT, SR, pcm)

# ---------------------------------------------------------------- verification
sr_r, data = wavfile.read(OUT)
d = data.astype(np.float64) / 32768
print(f"wrote {os.path.normpath(OUT)}")
print(f"sample rate {sr_r}, channels {d.shape[1]}, samples {d.shape[0]}, "
      f"duration {d.shape[0] / sr_r:.4f} s ({d.shape[0] / sr_r * FPS:.1f} frames)")
pk = np.max(np.abs(d))
print(f"peak {20 * np.log10(pk):.2f} dBFS, clipped samples: {int(np.sum(np.abs(data) >= 32767))}")
print("RMS per 2 s bar (dBFS):")
for b in range(NBARS):
    seg = d[b * 2 * sr_r:(b + 1) * 2 * sr_r]
    r = np.sqrt(np.mean(seg ** 2))
    db = 20 * np.log10(max(r, 1e-9))
    print(f"  bar {b:2d} {b * 2:2d}-{b * 2 + 2:2d}s {section(b):5s} {db:6.1f} " + "#" * max(0, int((db + 50) / 1.5)))
