#!/usr/bin/env python3
"""
Aligns the recitation audio to the text lines and writes assets/data/timings.js.

Method
------
1. Decode the MP3 to 16 kHz mono and take a 20 ms RMS envelope.
2. Run a Viterbi search over frames for the 109 internal line boundaries. Each
   line pays
       (actual duration - expected duration)^2 / expected duration
   where the expected duration is its share of the total speech span by syllable
   count, plus a saturating penalty for ending anywhere that is not a pause.
   Boundaries therefore snap to real pauses where the reciter takes one, and are
   interpolated by syllable count inside a continuously recited phrase.

Why not a plain silence split: the recitation has only ~60 pauses of 0.3 s or
more but the text is split into 110 lines, so most line breaks are not pauses at
all. A segment-per-line assignment cannot express that; this can.

The result is a machine estimate. Verify it once by ear with tools/tune.html,
which lets you nudge any line and export a corrected file.

Requirements: numpy, and ffmpeg on PATH (or `pip install imageio-ffmpeg`).
Usage: node tools/export-lines.mjs > lines.json && python3 tools/align.py lines.json
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import wave
import numpy as np

MP3 = "Ganapatyatarvasheersam.mp3"
OUT = "assets/data/timings.js"
SR = 16000
HOP = 0.020          # envelope frame hop, seconds
WIN = 0.040          # envelope window, seconds
NOISE_DB = -42.0     # measured noise floor of this recording
SPEECH_DB = -24.0    # comfortably inside speech
SILENCE_DB = -30.0   # below this counts as a pause
DUR_W = 1.0          # weight on the duration model
PAUSE_W = 2.0        # weight on "end this line at a pause"
SATURATE = 0.25      # energies above this are all equally "not a pause"
LEAD = 0.15          # highlight a line this long before its first syllable


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("ffmpeg not found: install ffmpeg or `pip install imageio-ffmpeg`")


def envelope(mp3_path):
    """Decode to mono 16 kHz; return (dB per frame, total seconds)."""
    tmpdir = tempfile.mkdtemp()
    wav = os.path.join(tmpdir, "a.wav")
    subprocess.run([ffmpeg_exe(), "-v", "error", "-y", "-i", mp3_path,
                    "-ac", "1", "-ar", str(SR), "-f", "wav", wav], check=True)
    with wave.open(wav) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    shutil.rmtree(tmpdir, ignore_errors=True)
    x = x.astype(np.float32) / 32768.0
    hop, win = int(HOP * SR), int(WIN * SR)
    n = (len(x) - win) // hop
    frames = np.lib.stride_tricks.as_strided(
        x, shape=(n, win), strides=(x.strides[0] * hop, x.strides[0]))
    rms = np.sqrt((frames ** 2).mean(axis=1))
    return 20 * np.log10(rms + 1e-9), len(x) / SR


def pause_cost(db):
    """Per-frame cost of ending a line there: ~0 in a pause, ~1 in speech."""
    e = np.clip((db - NOISE_DB) / (SPEECH_DB - NOISE_DB), 0, 1).astype(np.float32)
    k = np.hanning(7)
    k /= k.sum()
    smooth = np.convolve(e, k, mode="same").astype(np.float32)
    return (np.minimum(smooth, SATURATE) / SATURATE).astype(np.float32)


def pause_centres(db):
    """Mid-frame of every pause of at least 0.30 s, used only for scoring."""
    quiet = db < SILENCE_DB
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - i) * HOP >= 0.30:
                out.append((i + j) // 2)
            i = j
        else:
            i += 1
    return np.array(out)


def viterbi(cost, expected, first, last):
    """Least-cost placement of line boundaries. Returns a list of (start, end) frames."""
    n_lines, n_frames = len(expected), len(cost)
    INF = np.float32(1e18)
    dp = np.full(n_frames, INF, np.float32)
    dp[first] = 0
    back = np.zeros((n_lines, n_frames), np.int16)

    for i, exp in enumerate(expected):
        exp_f = exp / HOP
        d_lo = max(int(0.30 * exp_f), int(0.25 / HOP))
        d_hi = min(int(2.60 * exp_f), int((exp + 5.0) / HOP))
        cur = np.full(n_frames, INF, np.float32)
        best_d = np.zeros(n_frames, np.int16)
        for d in range(d_lo, d_hi + 1):
            c = np.float32(DUR_W * (d * HOP - exp) ** 2 / exp)
            cand = np.full(n_frames, INF, np.float32)
            cand[d:] = dp[:-d] + c
            better = cand < cur
            cur[better] = cand[better]
            best_d[better] = d
        if i < n_lines - 1:                    # the final boundary is pinned to `last`
            cur = cur + PAUSE_W * cost
        dp, back[i] = cur, best_d

    spans, t = [], last
    for i in range(n_lines - 1, -1, -1):
        d = int(back[i][t])
        spans.append((t - d, t))
        t -= d
    return list(reversed(spans))


def main():
    lines = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "lines.json"))
    syl = np.array([l["syl"] for l in lines], dtype=float)

    db, duration = envelope(MP3)
    speech = np.where(db >= SILENCE_DB)[0]
    first, last = int(speech[0]), int(speech[-1])
    span = (last - first) * HOP
    expected = syl / syl.sum() * span

    print(f"audio {duration:.2f}s | speech {first * HOP:.2f}s .. {last * HOP:.2f}s")
    print(f"{len(lines)} lines, {int(syl.sum())} syllables at "
          f"{syl.sum() / span:.2f} syll/sec")

    spans = viterbi(pause_cost(db), expected, first, last)

    durations = np.array([(b - a) * HOP for a, b in spans])
    boundaries = np.array([b for a, b in spans[:-1]])
    ref = pause_centres(db)
    dist = np.abs(boundaries[:, None] - ref[None, :]).min(axis=1) * HOP
    print(f"duration/syllable correlation {np.corrcoef(durations, syl)[0, 1]:.3f}")
    print(f"{len(ref)} pauses >= 0.30s available for {len(boundaries)} internal boundaries; "
          f"{(dist <= 0.20).mean() * 100:.0f}% of boundaries landed on one")

    cues = {l["id"]: round(max(0.0, a * HOP - LEAD), 3) for l, (a, b) in zip(lines, spans)}
    payload = {
        "audio": MP3,
        "duration": round(duration, 3),
        "method": "viterbi alignment: syllable duration model + pause snapping",
        "generated_by": "tools/align.py",
        "verified_by_ear": False,
        "cues": cues,
    }
    with open(OUT, "w") as f:
        f.write("/* Generated by tools/align.py - machine estimate, not hand-timed.\n"
                " * Line start times in seconds. To correct one line, edit its number\n"
                " * here, or use tools/tune.html to nudge lines by ear and export. */\n")
        f.write("(function (root) {\n  var T = ")
        f.write(json.dumps(payload, indent=2).replace("\n", "\n  "))
        f.write(";\n  if (typeof module !== 'undefined' && module.exports) { module.exports = T; }\n")
        f.write("  root.GA_TIMINGS = T;\n})(typeof window !== 'undefined' ? window : globalThis);\n")
    print(f"wrote {OUT} ({len(cues)} cues)")


if __name__ == "__main__":
    main()
