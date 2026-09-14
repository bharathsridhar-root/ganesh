#!/usr/bin/env node
/* Re-wraps index.html as a single Artifact page.
 *
 * The Artifact host supplies <!doctype>, <html>, <head> and <body>, so the page
 * content is emitted directly, with the stylesheet inlined and the font link and
 * <title> moved to the top. Scripts, data and audio ship alongside as published
 * files at their existing relative paths, so nothing else has to change.
 *
 * Usage: node tools/build-artifact.mjs <output.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../assets/css/style.css', import.meta.url), 'utf8');

const body = html.slice(html.indexOf('<body>') + '<body>'.length, html.lastIndexOf('</body>'))
  .replace(/^\s*\n/, '');
const fontLink = html.match(/<link href="https:\/\/fonts\.googleapis[^>]*>/)[0];

/* The site's own toggle writes data-theme="day" / "night". The Artifact viewer
 * writes data-theme="dark" / "light", or nothing at all when the viewer is left
 * on "system". Map those three states onto the two palettes so the page is
 * already in the right one before the script runs. */
const themeBridge = `
/* --- Artifact viewer theme states --------------------------------------- */
/* "system" stamps nothing, so only prefers-color-scheme separates the two;
   an explicit light choice, and the page's own day setting, must both win. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="day"]) {
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
    color-scheme: dark;
  }
}
`.trim();

/* Everything the night palette restyles by selector, not by token. */
const nightSelectors = css
  .split('\n')
  .filter((l) => l.startsWith('[data-theme="night"]'))
  .map((l) => l.replace(/\[data-theme="night"\]/g, ':root[data-theme="dark"]'))
  .join('\n');

const page = `<title>Gaṇapati Atharvaśīrṣa</title>
${fontLink}
<style>
${css}
${themeBridge}
${nightSelectors}
</style>

${body}`;

writeFileSync(process.argv[2], page);
console.log(`wrote ${process.argv[2]} (${page.length} bytes)`);
