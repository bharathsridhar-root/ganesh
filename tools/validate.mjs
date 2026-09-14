#!/usr/bin/env node
/* Validates assets/data/text.js:
 *  - every line id is unique
 *  - words[].s exactly reproduces the Devanagari tokens of the line, in order
 * Usage: node tools/validate.mjs
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DATA = require('../assets/data/text.js');

// Tokens that carry no lexical content: dandas and verse numerals like ॥१२॥
const SKIP = /^[।॥\s०-९]+$/;

export function tokens(dev) {
  return dev.split(/\s+/).filter(t => t && !SKIP.test(t));
}

let errors = 0, lines = 0, words = 0;
const ids = new Set();

for (const sec of DATA.sections) {
  for (const verse of sec.verses) {
    for (const line of verse.lines) {
      lines++;
      if (ids.has(line.id)) { console.error(`duplicate id: ${line.id}`); errors++; }
      ids.add(line.id);

      const tok = tokens(line.dev);
      const got = line.words.map(w => w.s);
      words += got.length;

      if (tok.length !== got.length) {
        console.error(`${line.id}: ${tok.length} devanagari tokens but ${got.length} glosses`);
        console.error(`   dev : ${tok.join(' | ')}`);
        console.error(`   gloss: ${got.join(' | ')}`);
        errors++;
        continue;
      }
      tok.forEach((t, i) => {
        if (t !== got[i]) {
          console.error(`${line.id}: token ${i + 1} mismatch\n   dev  : ${t}\n   gloss: ${got[i]}`);
          errors++;
        }
      });
      for (const w of line.words) {
        if (!w.m || !w.m.trim()) { console.error(`${line.id}: empty meaning for "${w.s}"`); errors++; }
      }
      if (!line.phon || !line.phon.trim()) { console.error(`${line.id}: missing phonetic`); errors++; }
      if (!line.en || !line.en.trim()) { console.error(`${line.id}: missing translation`); errors++; }
    }
  }
}

console.log(`${lines} lines, ${words} word glosses, ${errors} error(s)`);
process.exit(errors ? 1 : 0);
