#!/usr/bin/env node
/* Exports a flat line list (id, phonetic, syllable count) for the audio aligner.
 * Usage: node tools/export-lines.mjs > out.json
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DATA = require('../assets/data/text.js');

/* Syllables in the simple phonetic reading: every vowel nucleus counts once.
 * Doubled vowels (aa, ee, oo) and the diphthongs written as digraphs are one nucleus. */
export function syllables(phon) {
  const m = phon.toLowerCase().replace(/[^a-z\s]/g, '')
    .match(/(aa|ee|oo|ai|au|ay|[aeiou])/g);
  return m ? m.length : 1;
}

const out = [];
for (const sec of DATA.sections)
  for (const v of sec.verses)
    for (const l of v.lines)
      out.push({ id: l.id, section: sec.id, verse: v.id, phon: l.phon, syl: syllables(l.phon) });

console.log(JSON.stringify(out, null, 1));
