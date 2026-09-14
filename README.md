# Gaṇapati Atharvaśīrṣa — recite along

An interactive page for the **Gaṇapati Atharvaśīrṣa** (the Gaṇapati Upaniṣad).
Umajayanthi's recitation plays; the Sanskrit lights up line by line on the left and
scrolls itself, with the English meaning alongside on the right. Tap any Sanskrit
word to see what it means.

Everything is plain HTML, CSS and JavaScript — no build step, no framework, no
dependencies. Open `index.html` and it works.

## What is in it

- **The complete text** — the Śānti Pāṭha, all seventeen verses, and the
  Phalaśruti: 110 lines in Devanagari.
- **A simple phonetic reading** under each line, for anyone who does not read
  Devanagari. Press <kbd>P</kbd> or the *Phonetics* button.
- **The English meaning** beside every line.
- **Word-by-word meanings** — 339 of them. Hover a word on a computer, tap it on
  a phone.
- **Recite-along audio** with repeat-this-line, speed control from 0.7× to 1.3×,
  and tap-a-line-to-jump-there.
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
| `tools/tune.html` | Corrects the timings by ear. |
| `tools/export-lines.mjs` | Feeds the line list to the aligner. |

## About the timings — please read

**The line timings are a machine estimate and have not been checked by ear.**

`tools/align.py` decodes the recording, finds where the pauses are, and runs a
Viterbi search for the line boundaries that best fit both the pauses and each
line's syllable count. The recording has about 60 pauses of 0.3 s or longer, but
the text is divided into 110 lines, so most line breaks fall inside a
continuously chanted phrase and are placed by syllable count rather than by an
audible pause. Expect the verse-level sync to be good and individual lines inside
a flowing phrase to be off by a few tenths of a second here and there.

To fix that in one pass:

```sh
python3 -m http.server 8000
# open http://localhost:8000/tools/tune.html
```

Play it through and press <kbd>S</kbd> whenever a line actually begins. Press
Export, and paste the result over `assets/data/timings.js`. Lines you correct are
marked in green, and the rest are left alone.

To regenerate the estimate from scratch — after replacing the audio, say, or
re-splitting the text:

```sh
pip install numpy imageio-ffmpeg
node tools/export-lines.mjs > lines.json
python3 tools/align.py lines.json
```

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
