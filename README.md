# Gaṇapati Atharvaśīrṣa — recite along

An interactive page for the **Gaṇapati Atharvaśīrṣa** (the Gaṇapati Upaniṣad).
Umajayanthi's recitation plays; the Sanskrit lights up line by line on the left and
scrolls itself, with the English meaning alongside on the right. Tap any Sanskrit
word to see what it means.

Everything is plain HTML, CSS and JavaScript — no build step, no framework, no
dependencies. Open `index.html` and it works.

## What is in it

- **The text that is actually recited** — the twelve verses of the Upaniṣad,
  71 lines in Devanagari. The opening Śānti Pāṭha and the closing Phalaśruti are
  not on this recording, so they are not on the page; they are in git history and
  can be restored if the audio is ever re-recorded.
- **A simple phonetic reading** under each line, for anyone who does not read
  Devanagari. Press <kbd>P</kbd> or the *Phonetics* button.
- **The English meaning** beside every line.
- **Word-by-word meanings** — 193 of them. Hover a word on a computer, tap it on
  a phone.
- **Recite-along audio** with repeat-this-line, speed control from 0.7× to 1.3×,
  and tap-a-line-to-jump-there.
- **A sync nudge** in the player (<kbd>,</kbd> and <kbd>.</kbd>) that shifts the
  whole text against the voice in tenths of a second, so anyone can trim the last
  of the lag to their own ear. It is remembered per browser.
- **A background tone**: a quiet drone under the recitation, at 136.1 Hz, 432 Hz
  or 741 Hz. See below.
- **Settings in one sheet**, reachable from the gear in the header. On a phone the
  header is only the title and that gear; the quick toggles appear on wider
  screens as a convenience, and every setting lives in the sheet either way.
- **Day and evening colours** — marigold on ivory, or gold on deep plum for
  recitation at dusk. Press <kbd>T</kbd>.
- Works down to phone width, prints cleanly, and respects
  `prefers-reduced-motion`.

## Running it locally

```sh
python3 -m http.server 8000     # or: npx http-server -p 8000
# then open http://localhost:8000
```

A plain `open index.html` also works — the data files are JavaScript rather than
JSON precisely so that the page runs from `file://` with no server.

## Deploying to AWS Amplify

`amplify.yml` in the repository root is the build spec. See
[docs/DEPLOY-AMPLIFY.md](docs/DEPLOY-AMPLIFY.md) for step-by-step instructions.
In short: in the Amplify console choose **Host a web app**, connect this GitHub
repository and this branch, and accept the detected `amplify.yml`. There is
nothing to compile — the build step only runs `node tools/validate.mjs` to check
the text data, then publishes the repository as-is.

## The files

| Path | What it is |
| --- | --- |
| `index.html` | The page. |
| `assets/css/style.css` | All styling, both themes. |
| `assets/js/app.js` | Builds the text, keeps it in step with the audio. |
| `assets/js/art.js` | The Ganesha emblem, garland, lamps, lotus and petals, drawn as SVG paths. |
| `assets/data/text.js` | **The text.** Sanskrit, phonetics, translation, word meanings. Edit this to correct anything. |
| `assets/data/timings.js` | When each line starts, in seconds. Generated — see below. |
| `Ganapatyatarvasheersam.mp3` | Umajayanthi's recitation (5 min 48 s). |
| `tools/validate.mjs` | Checks that every word gloss still lines up with its Devanagari token. |
| `tools/align.py` | Generates `timings.js` from the audio. |
| `sync.html` | Tap along with the recitation to record the real timings. |
| `tools/tune.html` | Nudges individual timings by ear. |
| `tools/export-lines.mjs` | Feeds the line list to the aligner. |

## The background tone

`assets/js/tone.js` generates the drone live with Web Audio rather than shipping
an audio file, so it costs nothing to download and can be retuned while playing.
Three pitches are offered: 136.1 Hz (the earth-year tone traditionally associated
with Gaṇeśa), 432 Hz, and 741 Hz.

It is built to stay out of the way of the voice:

- **It never touches the `<audio>` element.** The recitation plays natively and is
  not routed through Web Audio at all, so no failure in the tone code can mute
  her, colour her, or cut out with a suspended audio context.
- **It sounds only while the recitation plays**, fading in over 2.5 s and out over
  1.2 s, so it is always an under-layer and never a drone on its own.
- **Each pitch carries its own trim.** 136.1 Hz sits below a speaking voice and is
  held at full level. 432 Hz lands in the first formant region and 741 Hz in the
  presence band where consonants live, so both are pulled well down: measured at
  the default level, the mixed drone peaks at about 0.022 for 136.1 Hz and 0.007
  for 741 Hz, against a recitation that peaks near 0.42.
- The audio context is created inside the play gesture, so nothing starts before
  the listener asks for it.

To change the ceiling, the fades or the per-pitch trims, edit the constants at the
top of `tone.js`.

## About the timings

`assets/data/timings.js` was built from a listener tapping along with the
recording in `sync.html` — 70 usable taps across the 71 lines — so the line
boundaries are where a person heard them, not where a model guessed.

What `tools/align.py --taps` does with them:

- **Drops taps that contradict their neighbours.** Jumping back to redo a line
  leaves one tap stranded out of sequence; the smallest set of taps that restores
  order is dropped and those lines are interpolated instead. One tap was dropped
  from this recording.
- **Subtracts a constant reaction lag** (`TAP_LAG`, 0.35 s). A listener taps after
  hearing a line begin.
- **Snaps a tap onto a pause only when one sits within 0.40 s** of the corrected
  time. 12 of 70 did. This recitation is largely continuous — it has far fewer
  audible pauses than it has lines — so a wider search would drag taps onto
  onsets in the middle of a line. Where there is no nearby pause, the tap wins.
- **Interpolates untapped lines** between the taps either side, by syllable count.

The one number that remains a judgement call is `TAP_LAG`. Rather than have it be
a guess baked into the data, the player's sync nudge shifts every cue at once:
if the text consistently changes a beat late, press <kbd>,</kbd> a few times. To
bake a different value in permanently, change `TAP_LAG` and re-run.

```sh
pip install numpy imageio-ffmpeg
node tools/export-lines.mjs > lines.json
python3 tools/align.py lines.json --taps taps.json
```

`tools/tune.html` corrects individual lines by ear: play it through, press
<kbd>S</kbd> at any line that lands wrong, then Export. It changes only the lines
you touch.

Running `align.py` with no `--taps` falls back to a pure machine estimate — a
Viterbi search over the pauses and syllable counts. That is what the site used
before the taps existed, and it is markedly worse.

## Editing the text

`assets/data/text.js` holds everything, grouped into sections → verses → lines.
Each line carries its Devanagari, its phonetic reading, its English meaning, and
an ordered list of word meanings.

The word list must line up exactly with the Devanagari: the `s` value of each
entry has to match the corresponding whitespace-separated token of `dev` (dandas
and verse numerals are skipped). After editing, run:

```sh
node tools/validate.mjs
```

It reports any line whose glosses have drifted out of step, and the Amplify build
runs it too, so a mistake fails the deploy rather than reaching the site.

If you change how lines are split, the timings no longer apply — re-run the
aligner and check it with `tune.html`.

## Where the text came from

The Sanskrit and the English meanings follow the two documents in this
repository: `Ganapati Atharvashirsha.pdf` (Sanskrit with English translation) and
`atharva.pdf` (the sanskritdocuments.org edition), cross-checked against each
other. Verse numbering follows the first.

Recensions of this Upaniṣad differ in small ways — whether `त्वमवस्थात्रयातीतः`
is present, whether `वच्मि` or `वदामि` is read, how the closing Śānti is worded.
Where they differed, the reading in `Ganapati Atharvashirsha.pdf` was kept. The
word-by-word notes are a study aid rather than a scholarly gloss: where a phrase
can be read more than one way, the note gives the reading that fits the verse.

If any of it should read differently, it is all in one file and plainly
formatted — correct it, run the validator, and push.
