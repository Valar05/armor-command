#!/usr/bin/env python3
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'sfx'
SR = 44100
TAU = math.pi * 2


def clamp(v: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def env_exp(t: float, attack: float, decay: float) -> float:
    if t < 0:
        return 0.0
    if attack > 0 and t < attack:
        return t / attack
    return math.exp(-(t - attack) / max(0.001, decay))


def pitch_env(t: float, start: float, end: float, dur: float) -> float:
    if dur <= 0:
        return end
    u = clamp(t / dur, 0.0, 1.0)
    return start * ((end / start) ** u)


def tone(t: float, freq: float, phase: float = 0.0) -> float:
    return math.sin(TAU * freq * t + phase)


def square(t: float, freq: float) -> float:
    return 1.0 if math.sin(TAU * freq * t) >= 0 else -1.0


def soft_clip(x: float, drive: float = 1.0) -> float:
    return math.tanh(x * drive)


def lowpass(samples: list[float], cutoff: float) -> list[float]:
    rc = 1.0 / (TAU * cutoff)
    dt = 1.0 / SR
    a = dt / (rc + dt)
    y = 0.0
    out = []
    for x in samples:
        y += a * (x - y)
        out.append(y)
    return out


def highpass(samples: list[float], cutoff: float) -> list[float]:
    low = lowpass(samples, cutoff)
    return [x - l for x, l in zip(samples, low)]


def normalize(samples: list[float], peak: float = 0.92) -> list[float]:
    m = max(0.0001, max(abs(x) for x in samples))
    g = peak / m
    return [clamp(x * g) for x in samples]


def render(name: str, duration: float, fn: Callable[[float, random.Random], float], seed: int, peak: float = 0.90) -> None:
    rng = random.Random(seed)
    count = int(duration * SR)
    samples = [0.0] * count
    for i in range(count):
        t = i / SR
        samples[i] = fn(t, rng)
    # Gentle one-pole smoothing removes harsh digital edges while preserving attack.
    samples = normalize(samples, peak)
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    with wave.open(str(path), 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SR)
        data = bytearray()
        for x in samples:
            data.extend(struct.pack('<h', int(clamp(x) * 32767)))
        wav.writeframes(data)
    print(path.relative_to(ROOT), f'{duration:.3f}s')


def metal_click(t: float, rng: random.Random, base: float = 1800, amp: float = 0.25) -> float:
    return amp * env_exp(t, 0.0005, 0.018) * (
        tone(t, base) * 0.5 + tone(t, base * 1.47, 0.4) * 0.35 + (rng.random() * 2 - 1) * 0.25
    )


def ui_select(t: float, rng: random.Random) -> float:
    return env_exp(t, 0.003, 0.035) * (tone(t, 880) * 0.55 + tone(t, 1320) * 0.35) + metal_click(t, rng, 2200, 0.08)


def ui_pause(t: float, rng: random.Random) -> float:
    return metal_click(t, rng, 900, 0.18) + env_exp(t - 0.035, 0.002, 0.035) * tone(t, 420) * 0.22


def ui_back(t: float, rng: random.Random) -> float:
    f = pitch_env(t, 720, 170, 0.18)
    return env_exp(t, 0.003, 0.075) * (tone(t, f) * 0.45 + tone(t, f * 0.5) * 0.20)


def upgrade(t: float, rng: random.Random) -> float:
    clamp_hit = metal_click(t, rng, 600, 0.35) + env_exp(t, 0.001, 0.035) * tone(t, 105, 0.5) * 0.30
    chime = env_exp(t - 0.055, 0.004, 0.12) * (tone(t, 523) * 0.30 + tone(t, 784) * 0.18)
    return clamp_hit + chime


def missile_launch(t: float, rng: random.Random) -> float:
    thump = env_exp(t, 0.001, 0.075) * (tone(t, pitch_env(t, 86, 48, 0.12)) * 0.72)
    ignition = env_exp(t - 0.018, 0.002, 0.18) * ((rng.random() * 2 - 1) * 0.45 + tone(t, pitch_env(t, 180, 430, 0.20)) * 0.20)
    tube = metal_click(t, rng, 1250, 0.28)
    return soft_clip(thump + ignition + tube, 1.7)


def turret_bolt(t: float, rng: random.Random) -> float:
    crack = env_exp(t, 0.0008, 0.026) * ((rng.random() * 2 - 1) * 0.34 + square(t, 230) * 0.42 + tone(t, 980) * 0.18)
    muzzle = metal_click(t, rng, 2600, 0.24)
    return soft_clip(crack + muzzle, 2.3)


def drone_bolt(t: float, rng: random.Random) -> float:
    return soft_clip(env_exp(t, 0.0008, 0.018) * (tone(t, 1240) * 0.42 + (rng.random() * 2 - 1) * 0.18), 1.8)


def shotgun_burst(t: float, rng: random.Random) -> float:
    body = env_exp(t, 0.001, 0.070) * (tone(t, 115) * 0.55 + tone(t, 230) * 0.20)
    spray = env_exp(t, 0.001, 0.095) * (rng.random() * 2 - 1) * 0.62
    pellet = 0.0
    for n, d in enumerate([0.0, 0.009, 0.017, 0.026, 0.038]):
        pellet += env_exp(t - d, 0.0005, 0.016) * tone(t, 900 + n * 170) * 0.11
    return soft_clip(body + spray + pellet, 2.0)


def heavy_pistol(t: float, rng: random.Random) -> float:
    sub = env_exp(t, 0.0008, 0.090) * tone(t, pitch_env(t, 128, 66, 0.10)) * 0.70
    snap = env_exp(t, 0.0005, 0.028) * ((rng.random() * 2 - 1) * 0.48 + square(t, 310) * 0.35)
    metal = metal_click(t, rng, 1700, 0.20)
    return soft_clip(sub + snap + metal, 2.1)


def enemy_pop(t: float, rng: random.Random) -> float:
    pop = env_exp(t, 0.0005, 0.035) * tone(t, pitch_env(t, 620, 1180, 0.05)) * 0.38
    shards = env_exp(t, 0.001, 0.055) * (rng.random() * 2 - 1) * 0.32
    return soft_clip(pop + shards, 1.6)


def explosion(t: float, rng: random.Random) -> float:
    boom = env_exp(t, 0.001, 0.20) * tone(t, pitch_env(t, 110, 48, 0.22)) * 0.72
    blast = env_exp(t, 0.001, 0.24) * (rng.random() * 2 - 1) * 0.48
    crack = metal_click(t, rng, 700, 0.26)
    return soft_clip(boom + blast + crack, 1.7)


def base_impact(t: float, rng: random.Random) -> float:
    wall = env_exp(t, 0.001, 0.24) * tone(t, pitch_env(t, 82, 38, 0.18)) * 0.92
    crunch = env_exp(t, 0.001, 0.20) * (rng.random() * 2 - 1) * 0.55
    alarm = env_exp(t - 0.11, 0.006, 0.12) * tone(t, 196) * 0.20
    return soft_clip(wall + crunch + alarm, 1.8)


def base_breach(t: float, rng: random.Random) -> float:
    impact = base_impact(t, rng) * 0.75
    fall = env_exp(t - 0.12, 0.006, 0.55) * tone(t, pitch_env(max(0, t - 0.12), 360, 72, 0.62)) * 0.46
    siren = env_exp(t - 0.22, 0.01, 0.35) * square(t, 180) * 0.18
    return soft_clip(impact + fall + siren, 1.8)


def wave_clear(t: float, rng: random.Random) -> float:
    notes = [(0.00, 392, 0.26), (0.11, 587, 0.24), (0.24, 784, 0.34)]
    out = 0.0
    for d, f, a in notes:
        out += env_exp(t - d, 0.008, 0.22) * (tone(t, f) + tone(t, f * 2) * 0.22) * a
    out += metal_click(t - 0.23, rng, 1100, 0.12)
    return out


def wave_start(t: float, rng: random.Random) -> float:
    sweep = env_exp(t, 0.004, 0.20) * tone(t, pitch_env(t, 280, 760, 0.26)) * 0.34
    ready = env_exp(t - 0.24, 0.002, 0.05) * square(t, 440) * 0.18
    return sweep + ready + metal_click(t, rng, 1600, 0.08)


def low_alarm(t: float, rng: random.Random) -> float:
    a = env_exp(t, 0.004, 0.12) * square(t, 196) * 0.25
    b = env_exp(t - 0.18, 0.004, 0.12) * square(t, 147) * 0.22
    return a + b


def ready_tick(t: float, rng: random.Random) -> float:
    return metal_click(t, rng, 1800, 0.12) + env_exp(t, 0.001, 0.018) * tone(t, 1180) * 0.12


def drop_pod_break(t: float, rng: random.Random) -> float:
    shell = env_exp(t, 0.001, 0.16) * tone(t, pitch_env(t, 142, 62, 0.18)) * 0.72
    crack = env_exp(t, 0.001, 0.10) * (rng.random() * 2 - 1) * 0.58
    shards = 0.0
    for n, d in enumerate([0.025, 0.052, 0.083, 0.118, 0.165]):
        shards += env_exp(t - d, 0.0006, 0.036) * tone(t, 720 + n * 210) * (0.16 - n * 0.012)
    vent = env_exp(t - 0.045, 0.004, 0.20) * (rng.random() * 2 - 1) * 0.28
    return soft_clip(shell + crack + shards + vent, 1.9)


def trooper_rocket_launch(t: float, rng: random.Random) -> float:
    tick = metal_click(t, rng, 1350, 0.20)
    motor = env_exp(t - 0.012, 0.002, 0.10) * (tone(t, pitch_env(max(0, t - 0.012), 210, 520, 0.12)) * 0.24 + (rng.random() * 2 - 1) * 0.34)
    puff = env_exp(t, 0.001, 0.06) * tone(t, pitch_env(t, 96, 54, 0.075)) * 0.42
    return soft_clip(tick + motor + puff, 1.8)


def trooper_shatter(t: float, rng: random.Random) -> float:
    core = env_exp(t, 0.001, 0.10) * tone(t, pitch_env(t, 240, 92, 0.14)) * 0.50
    servo = env_exp(t, 0.001, 0.12) * (rng.random() * 2 - 1) * 0.42
    bits = 0.0
    for n, d in enumerate([0.0, 0.018, 0.041, 0.072, 0.113]):
        bits += env_exp(t - d, 0.0005, 0.028) * tone(t, 1100 + n * 260) * 0.11
    return soft_clip(core + servo + bits, 1.75)


def enemy_rocket_pop(t: float, rng: random.Random) -> float:
    spark = env_exp(t, 0.0006, 0.028) * tone(t, pitch_env(t, 880, 1580, 0.035)) * 0.32
    fuel = env_exp(t, 0.001, 0.055) * (rng.random() * 2 - 1) * 0.24
    return soft_clip(spark + fuel + metal_click(t, rng, 2100, 0.08), 1.55)


SOUNDS: list[tuple[str, float, Callable[[float, random.Random], float], int, float]] = [
    ('ui_select_01.wav', 0.11, ui_select, 1001, 0.72),
    ('ui_pause_01.wav', 0.14, ui_pause, 1002, 0.72),
    ('ui_back_to_itch_01.wav', 0.22, ui_back, 1003, 0.72),
    ('upgrade_select_01.wav', 0.30, upgrade, 1004, 0.82),
    ('missile_launch_01.wav', 0.34, missile_launch, 2001, 0.93),
    ('turret_bolt_01.wav', 0.075, turret_bolt, 2002, 0.86),
    ('drone_bolt_01.wav', 0.058, drone_bolt, 2003, 0.72),
    ('shotgun_burst_01.wav', 0.22, shotgun_burst, 2004, 0.92),
    ('heavy_pistol_01.wav', 0.19, heavy_pistol, 2005, 0.92),
    ('enemy_pop_01.wav', 0.13, enemy_pop, 3001, 0.75),
    ('player_missile_explosion_01.wav', 0.42, explosion, 3002, 0.94),
    ('base_impact_01.wav', 0.45, base_impact, 3003, 0.95),
    ('base_breach_01.wav', 0.95, base_breach, 3004, 0.95),
    ('wave_clear_01.wav', 0.86, wave_clear, 4001, 0.86),
    ('wave_start_01.wav', 0.42, wave_start, 4002, 0.76),
    ('base_low_alarm_loop_01.wav', 0.72, low_alarm, 4003, 0.72),
    ('missile_ready_tick_01.wav', 0.07, ready_tick, 4004, 0.58),
    ('drop_pod_break_01.wav', 0.48, drop_pod_break, 5001, 0.94),
    ('trooper_rocket_launch_01.wav', 0.20, trooper_rocket_launch, 5002, 0.82),
    ('trooper_shatter_01.wav', 0.38, trooper_shatter, 5003, 0.86),
    ('enemy_rocket_pop_01.wav', 0.12, enemy_rocket_pop, 5004, 0.72),
]


def main() -> int:
    for name, duration, fn, seed, peak in SOUNDS:
        render(name, duration, fn, seed, peak)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
