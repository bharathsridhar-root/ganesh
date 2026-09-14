#!/usr/bin/env node
/* Re-wraps a full HTML page as an Artifact page.
 *
 * The Artifact host supplies <!doctype>, <html>, <head> and <body>, so this
 * emits the head's own contents (title, font link, styles) followed by the body
 * content. A <link> to a stylesheet inside this repository is inlined; the
 * Google Fonts link is kept as-is, since that host is allowed. Scripts, data and
 * audio ship alongside as published files at their existing relative paths, so
 * nothing in the markup has to change.
 *
 * Usage: node tools/build-artifact.mjs <input.html> <output.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node tools/build-artifact.mjs <input.html> <output.html>');
  process.exit(1);
}

const html = readFileSync(input, 'utf8');
const base = dirname(resolve(input));

const between = (open, close) => {
  const a = html.indexOf(open);
  const b = html.lastIndexOf(close);
  if (a < 0 || b < 0) throw new Error(`${input}: no ${open} … ${close}`);
  return html.slice(a + open.length, b);
};

/* The host's own skeleton already carries charset and viewport. */
let head = between('<head>', '</head>')
  .split('\n')
  .filter((l) => !/<meta\s+charset|name="viewport"|rel="preconnect"/.test(l))
  .join('\n');

/* Inline any stylesheet that lives in this repository. */
head = head.replace(/<link rel="stylesheet" href="([^"]+)"\s*>/g, (m, href) =>
  /^https?:/.test(href) ? m : `<style>\n${readFileSync(resolve(base, href), 'utf8')}</style>`);

const body = between('<body>', '</body>').replace(/^\s*\n/, '');

/* The site's own toggle writes data-theme="day" / "night". The Artifact viewer
 * writes data-theme="dark" / "light", or nothing at all when the viewer is left
 * on "system". Map those states onto the night palette so a dark viewer is in
 * the right one before any script runs. Skipped for pages that are dark-only. */
const NIGHT_TOKENS = `
    --bg:        #1E0614;
    --bg-2:      #3A0D28;
    --paper:     #2C0A1E;
    --paper-2:   #3A0F29;
    --ink:       #FCEBD2;
    --ink-soft:  #DCAF9F;
    --ink-faint: #A97F77;
    --magenta:   #FF6BA8;
    --magenta-d: #FF9CC5;
    --marigold:  #FFC24D;
    --gold:      #FFD98A;
    --saffron:   #FF8A3D;
    --leaf:      #5FCF95;
    --line:      rgba(255, 194, 77, .20);
    --line-soft: rgba(255, 194, 77, .10);
    --glow:      rgba(255, 194, 77, .26);
    --active:    rgba(255, 194, 77, .11);
    --shadow:    0 14px 40px -20px rgba(0, 0, 0, .85);
    --halo:      rgba(255, 190, 90, .30);
    color-scheme: dark;`;

let bridge = '';
if (head.includes('[data-theme="night"]')) {
  const selectors = head
    .split('\n')
    .filter((l) => l.startsWith('[data-theme="night"]'))
    .map((l) => l.replace(/\[data-theme="night"\]/g, ':root[data-theme="dark"]'))
    .join('\n');
  bridge = `<style>
/* --- Artifact viewer theme states --------------------------------------- */
/* "system" stamps nothing on the root, so only prefers-color-scheme separates
   the two; an explicit light choice, and the page's own day setting, must win. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="day"]) {${NIGHT_TOKENS}
  }
}
:root[data-theme="dark"] {${NIGHT_TOKENS}
}
${selectors}
</style>`;
}

writeFileSync(output, `${head.trim()}\n${bridge}\n\n${body}`);
console.log(`wrote ${output} from ${input}`);
