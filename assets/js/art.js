/* Original SVG artwork for the Gaṇapati Atharvaśīrṣa site.
 * Drawn from scratch with paths and gradients, so it scales to any screen and
 * carries no licence of its own.
 *
 * The emblem is a seated murti: crossed legs on a lotus pedestal, four arms
 * bearing the goad, the noose, the boon-giving palm and a modak, the trunk
 * turned to his right. Volume comes from radial gradients and soft shading
 * rather than outlines, so it reads as a carved figure rather than a diagram.
 * The figure keeps its own warm stone colouring in both themes, the way a
 * murti would; only the halo behind it follows the page. */
(function (root) {
  'use strict';

  /* Petals arranged around a centre, for the halo behind the figure. */
  function petalRing(count, cx, cy, rInner, rOuter, width, cls) {
    var out = '';
    for (var i = 0; i < count; i++) {
      var a = (360 / count) * i;
      out += '<path class="' + cls + '" transform="rotate(' + a + ' ' + cx + ' ' + cy + ')" d="' +
        'M' + cx + ' ' + (cy - rInner) +
        ' C' + (cx + width) + ' ' + (cy - rInner - (rOuter - rInner) * 0.35) +
        ' ' + (cx + width) + ' ' + (cy - rOuter + (rOuter - rInner) * 0.25) +
        ' ' + cx + ' ' + (cy - rOuter) +
        ' C' + (cx - width) + ' ' + (cy - rOuter + (rOuter - rInner) * 0.25) +
        ' ' + (cx - width) + ' ' + (cy - rInner - (rOuter - rInner) * 0.35) +
        ' ' + cx + ' ' + (cy - rInner) + 'Z"/>';
    }
    return out;
  }

  function beadRing(count, cx, cy, r, size, cls) {
    var out = '';
    for (var i = 0; i < count; i++) {
      var a = ((360 / count) * i) * Math.PI / 180;
      out += '<circle class="' + cls + '" cx="' + (cx + Math.sin(a) * r).toFixed(2) +
        '" cy="' + (cy - Math.cos(a) * r).toFixed(2) + '" r="' + size + '"/>';
    }
    return out;
  }

  /* Gradients give the figure its roundness. Ids are namespaced so several
     copies of the emblem can sit on one page without colliding. */
  function defs(id) {
    return '<defs>' +
      '<radialGradient id="' + id + '-skin" cx="38%" cy="28%" r="78%">' +
        '<stop offset="0%" stop-color="#F8E3CA"/>' +
        '<stop offset="52%" stop-color="#E7C29C"/>' +
        '<stop offset="100%" stop-color="#C08F63"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + id + '-skinL" cx="40%" cy="30%" r="75%">' +
        '<stop offset="0%" stop-color="#FCEDD9"/>' +
        '<stop offset="100%" stop-color="#DDB58C"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + id + '-ear" cx="60%" cy="32%" r="80%">' +
        '<stop offset="0%" stop-color="#F3D2B4"/>' +
        '<stop offset="60%" stop-color="#DCA982"/>' +
        '<stop offset="100%" stop-color="#B07A52"/>' +
      '</radialGradient>' +
      '<linearGradient id="' + id + '-gold" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#F7D98A"/>' +
        '<stop offset="48%" stop-color="#D9A741"/>' +
        '<stop offset="100%" stop-color="#A8761F"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + id + '-cloth" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#E08A3C"/>' +
        '<stop offset="100%" stop-color="#A4501F"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + id + '-stone" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#F0DCBE"/>' +
        '<stop offset="100%" stop-color="#C4A379"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + id + '-halo" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="rgba(255,236,196,.95)"/>' +
        '<stop offset="62%" stop-color="rgba(255,226,170,.42)"/>' +
        '<stop offset="100%" stop-color="rgba(255,220,160,0)"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + id + '-shade" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="rgba(74,38,12,.34)"/>' +
        '<stop offset="100%" stop-color="rgba(74,38,12,0)"/>' +
      '</radialGradient>' +
      '</defs>';
  }

  /* The lotus pedestal: a slab with a row of petals falling from its rim. */
  function pedestal(id) {
    var petals = '';
    for (var x = 62; x <= 238; x += 22) {
      petals += '<path fill="url(#' + id + '-stone)" opacity=".92" d="M' + x + ' 340 C' +
        (x - 14) + ' 342 ' + (x - 15) + ' 356 ' + x + ' 367 C' +
        (x + 15) + ' 356 ' + (x + 14) + ' 342 ' + x + ' 340Z"/>';
    }
    return '<ellipse cx="150" cy="374" rx="112" ry="12" fill="url(#' + id + '-shade)"/>' +
      petals +
      '<path fill="url(#' + id + '-stone)" d="M46 334 C46 327 82 321 150 321 C218 321 254 327 254 334 ' +
      'L254 340 C254 350 216 357 150 357 C84 357 46 350 46 340Z"/>' +
      '<path fill="rgba(120,80,40,.16)" d="M46 338 C80 345 220 345 254 338 L254 341 C216 349 84 349 46 341Z"/>';
  }

  /* The seated figure, in a 300 x 390 field.
     Vertically: crown 4-68, head 46-162, shoulders about 188, belly to 310,
     crossed legs 268-342, pedestal below. That spacing is what lets the four
     arms leave the shoulders without crossing the face. Drawn back to front,
     with the arms last so they pass in front of the ears as on a carved murti. */
  function murti(id) {
    var g = 'url(#' + id + '-gold)';
    var skin = 'url(#' + id + '-skin)';
    var light = 'url(#' + id + '-skinL)';

    function arm(d, width) {
      return '<path d="' + d + '" fill="none" stroke="' + skin + '" stroke-width="' + width +
        '" stroke-linecap="round" stroke-linejoin="round"/>';
    }

    return [
      pedestal(id),

      /* crossed legs, the dhoti over them, the soles turned up */
      '<path fill="' + skin + '" d="M72 324 C70 294 96 272 134 268 L166 268 C204 272 230 294 228 324 C228 334 192 342 150 342 C108 342 72 334 72 324Z"/>',
      '<path fill="' + light + '" d="M128 320 C117 316 111 305 116 296 C126 292 139 298 142 308 C144 316 138 323 128 320Z"/>',
      '<path fill="' + light + '" d="M172 320 C183 316 189 305 184 296 C174 292 161 298 158 308 C156 316 162 323 172 320Z"/>',
      '<path fill="url(#' + id + '-cloth)" d="M84 320 C88 294 112 278 150 278 C188 278 212 294 216 320 C196 330 172 334 150 334 C128 334 104 330 84 320Z"/>',
      '<path fill="url(#' + id + '-cloth)" d="M137 284 C134 302 133 320 136 336 C143 342 157 342 164 336 C167 320 166 302 163 284Z"/>',
      '<path fill="rgba(255,230,190,.20)" d="M146 288 C145 306 145 322 147 336 L153 336 C151 322 151 306 152 288Z"/>',

      /* belly and chest as one pear-shaped mass */
      '<path fill="' + skin + '" d="M150 162 C194 162 218 196 220 240 C222 284 190 312 150 312 C110 312 78 284 80 240 C82 196 106 162 150 162Z"/>',
      '<ellipse cx="150" cy="276" rx="5.5" ry="4.5" fill="rgba(110,66,28,.28)"/>',

      /* belt and necklaces */
      '<path fill="none" stroke="' + g + '" stroke-width="7" stroke-linecap="round" d="M90 270 C112 286 188 286 210 270"/>',
      '<circle cx="150" cy="282" r="7" fill="' + g + '"/>',
      '<path fill="none" stroke="' + g + '" stroke-width="4.5" stroke-linecap="round" d="M110 206 C126 232 174 232 190 206"/>',
      '<circle cx="150" cy="226" r="5" fill="' + g + '"/>',
      '<ellipse cx="150" cy="188" rx="76" ry="28" fill="' + skin + '"/>',

      /* ears, then the head over them */
      '<path fill="url(#' + id + '-ear)" d="M112 52 C78 52 58 78 58 110 C58 140 78 160 112 157 C128 155 132 136 132 100 C132 66 126 52 112 52Z"/>',
      '<path fill="url(#' + id + '-ear)" d="M188 52 C222 52 242 78 242 110 C242 140 222 160 188 157 C172 155 168 136 168 100 C168 66 174 52 188 52Z"/>',
      '<path fill="none" stroke="rgba(120,74,40,.26)" stroke-width="3" stroke-linecap="round" d="M114 70 C90 78 76 94 78 114 C80 130 91 140 109 143"/>',
      '<path fill="none" stroke="rgba(120,74,40,.26)" stroke-width="3" stroke-linecap="round" d="M186 70 C210 78 224 94 222 114 C220 130 209 140 191 143"/>',
      '<path fill="' + skin + '" d="M150 46 C186 46 202 72 202 106 C202 140 180 162 150 162 C120 162 98 140 98 106 C98 72 114 46 150 46Z"/>',

      /* crown */
      '<path fill="' + g + '" d="M117 58 C117 34 130 12 150 2 C170 12 183 34 183 58 C171 51 129 51 117 58Z"/>',
      '<path fill="none" stroke="rgba(255,240,200,.55)" stroke-width="2.4" stroke-linecap="round" d="M138 50 C140 36 144 24 150 16 C156 24 160 36 162 50"/>',
      '<circle cx="150" cy="6" r="5.6" fill="' + g + '"/>',
      '<path fill="' + g + '" d="M111 55 C127 46 173 46 189 55 L189 67 C173 59 127 59 111 67Z"/>',
      '<circle cx="150" cy="61" r="4.4" fill="#F7E3A8"/>',

      /* brows, third eye, eyes */
      '<path fill="none" stroke="rgba(120,74,40,.42)" stroke-width="3" stroke-linecap="round" d="M116 116 C126 108 137 107 144 112"/>',
      '<path fill="none" stroke="rgba(120,74,40,.42)" stroke-width="3" stroke-linecap="round" d="M184 116 C174 108 163 107 156 112"/>',
      '<path fill="#C0392B" d="M150 88 l4.5 8.5 -4.5 9 -4.5 -9Z"/>',
      '<path fill="#FFFDF7" d="M117 126 C124 119 135 119 142 126 C135 133 124 133 117 126Z"/>',
      '<path fill="#FFFDF7" d="M158 126 C165 119 176 119 183 126 C176 133 165 133 158 126Z"/>',
      '<circle cx="129" cy="126" r="4.2" fill="#4A2A14"/>',
      '<circle cx="171" cy="126" r="4.2" fill="#4A2A14"/>',

      /* tusks: his right one whole, the left one broken */
      '<path fill="#FFFAF0" stroke="rgba(150,110,70,.32)" stroke-width="1.2" d="M124 174 C117 192 117 210 124 224 C135 210 136 190 136 174Z"/>',
      '<path fill="#FFFAF0" stroke="rgba(150,110,70,.32)" stroke-width="1.2" d="M176 174 C183 186 185 196 182 205 C174 193 169 183 166 174Z"/>',

      /* trunk, descending and curling to his right */
      '<path fill="none" stroke="' + skin + '" stroke-width="30" stroke-linecap="round" d="M150 164 C153 194 149 218 141 236"/>',
      '<path fill="none" stroke="' + skin + '" stroke-width="22" stroke-linecap="round" d="M141 236 C134 252 123 261 111 259"/>',
      '<path fill="none" stroke="' + skin + '" stroke-width="15" stroke-linecap="round" d="M111 259 C100 257 96 247 104 241"/>',
      '<path fill="none" stroke="rgba(120,74,40,.20)" stroke-width="2.4" stroke-linecap="round" d="M139 184 C147 187 155 186 160 182"/>',
      '<path fill="none" stroke="rgba(120,74,40,.20)" stroke-width="2.4" stroke-linecap="round" d="M136 208 C144 211 151 210 156 206"/>',
      '<path fill="none" stroke="rgba(120,74,40,.20)" stroke-width="2.2" stroke-linecap="round" d="M131 230 C138 234 144 233 148 230"/>',

      /* the four arms, clear of the face and in front of the ears */
      arm('M116 194 C92 184 68 168 54 144', 19),
      arm('M184 194 C208 184 232 168 246 144', 19),
      arm('M114 224 C92 232 76 248 70 266', 17),
      arm('M186 224 C208 232 224 248 230 266', 17),
      '<ellipse cx="88" cy="178" rx="12" ry="7.5" fill="' + g + '" transform="rotate(-38 88 178)"/>',
      '<ellipse cx="212" cy="178" rx="12" ry="7.5" fill="' + g + '" transform="rotate(38 212 178)"/>',

      /* the goad and the noose are drawn first, so the hands close over them */
      '<path stroke="' + g + '" stroke-width="4.2" stroke-linecap="round" fill="none" d="M54 150 L54 98"/>',
      '<path fill="' + g + '" d="M54 98 C46 91 45 80 52 73 C60 78 62 89 57 98Z"/>',
      '<path fill="none" stroke="' + g + '" stroke-width="3.6" stroke-linecap="round" d="M56 90 C67 88 73 95 71 104"/>',
      '<path stroke="' + g + '" stroke-width="4.2" stroke-linecap="round" fill="none" d="M246 150 L246 116"/>',
      '<ellipse cx="246" cy="100" rx="14" ry="16" fill="none" stroke="' + g + '" stroke-width="4.2"/>',

      /* the two upper hands, gripping */
      '<ellipse cx="54" cy="145" rx="13.5" ry="11" fill="' + light + '" transform="rotate(-36 54 145)"/>',
      '<path fill="none" stroke="rgba(120,80,44,.26)" stroke-width="2.2" stroke-linecap="round" d="M46 140 C52 137 60 139 63 144"/>',
      '<ellipse cx="246" cy="145" rx="13.5" ry="11" fill="' + light + '" transform="rotate(36 246 145)"/>',
      '<path fill="none" stroke="rgba(120,80,44,.26)" stroke-width="2.2" stroke-linecap="round" d="M254 140 C248 137 240 139 237 144"/>',

      /* lower right hand: the boon-giving palm, turned to the viewer */
      '<path fill="' + light + '" d="M58 272 C55 257 61 246 72 245 C83 244 90 253 90 266 C90 279 82 289 72 289 C63 289 60 282 58 272Z"/>',
      '<path fill="none" stroke="rgba(120,80,44,.28)" stroke-width="2.4" stroke-linecap="round" d="M66 254 L66 272 M74 251 L74 272 M82 254 L82 272"/>',

      /* lower left hand: a modak */
      '<ellipse cx="232" cy="270" rx="13" ry="11" fill="' + light + '" transform="rotate(34 232 270)"/>',
      '<path fill="#F2C86E" stroke="#C99435" stroke-width="1.6" d="M240 262 C250 268 254 279 252 285 C243 288 233 286 229 281 C229 272 233 265 240 262Z"/>'
    ].join('');
  }

  function heroEmblem() {
    var id = 'ga';
    return '<svg class="art art-hero" viewBox="0 0 300 390" role="img" aria-label="Lord Gaṇeśa, seated">' +
      defs(id) +
      '<g class="ring-outer">' + petalRing(24, 150, 172, 132, 154, 11, 'p-outer') + '</g>' +
      '<g class="ring-mid">' + petalRing(16, 150, 172, 108, 132, 13, 'p-mid') + '</g>' +
      '<g class="ring-beads">' + beadRing(30, 150, 172, 102, 2.1, 'bead') + '</g>' +
      '<circle cx="150" cy="172" r="132" fill="url(#ga-halo)"/>' +
      murti(id) +
      '</svg>';
  }

  /* A simplified head for the header, where the full figure would turn to mush. */
  function mark() {
    var id = 'gm';
    return '<svg class="art art-mark" viewBox="0 0 200 200" role="img" aria-label="Gaṇeśa">' +
      defs(id) +
      '<circle cx="100" cy="100" r="96" fill="url(#gm-halo)"/>' +
      '<g class="ring-mid">' + petalRing(12, 100, 100, 74, 96, 12, 'p-mid') + '</g>' +
      '<path fill="url(#' + id + '-ear)" d="M66 58 C36 58 20 80 20 108 C20 134 38 150 66 148 C80 147 84 130 84 100 C84 72 78 58 66 58Z"/>' +
      '<path fill="url(#' + id + '-ear)" d="M134 58 C164 58 180 80 180 108 C180 134 162 150 134 148 C120 147 116 130 116 100 C116 72 122 58 134 58Z"/>' +
      '<path fill="url(#' + id + '-skin)" d="M100 48 C136 48 156 74 156 106 C156 138 132 158 100 158 C68 158 44 138 44 106 C44 74 64 48 100 48Z"/>' +
      '<path fill="url(#' + id + '-gold)" d="M72 60 C72 36 84 14 100 4 C116 14 128 36 128 60 C117 53 83 53 72 60Z"/>' +
      '<path fill="url(#' + id + '-gold)" d="M68 58 C82 50 118 50 132 58 L132 70 C118 62 82 62 68 70Z"/>' +
      '<path fill="#C0392B" d="M100 74 l4 7.5 -4 8 -4 -8Z"/>' +
      '<path fill="#FFFDF7" d="M70 104 C76 98 87 98 93 104 C87 110 76 110 70 104Z"/>' +
      '<path fill="#FFFDF7" d="M107 104 C113 98 124 98 130 104 C124 110 113 110 107 104Z"/>' +
      '<circle cx="81" cy="104" r="3.4" fill="#4A2A14"/>' +
      '<circle cx="119" cy="104" r="3.4" fill="#4A2A14"/>' +
      '<path fill="#FFFAF0" d="M80 132 C76 143 76 152 80 160 C86 152 86 140 86 132Z"/>' +
      '<path fill="#FFFAF0" d="M120 132 C123 139 124 144 122 149 C118 142 116 137 114 132Z"/>' +
      '<path fill="none" stroke="url(#' + id + '-skin)" stroke-width="24" stroke-linecap="round" d="M101 114 C103 134 100 150 93 161"/>' +
      '<path fill="none" stroke="url(#' + id + '-skin)" stroke-width="17" stroke-linecap="round" d="M93 161 C87 172 78 178 69 176"/>' +
      '<path fill="none" stroke="url(#' + id + '-skin)" stroke-width="12" stroke-linecap="round" d="M69 176 C61 175 58 167 64 162"/>' +
      '</svg>';
  }

  /* An oil lamp with a flame that breathes. */
  function diya(flip) {
    return '<svg class="art art-diya' + (flip ? ' flip' : '') + '" viewBox="0 0 120 120" aria-hidden="true">' +
      '<g class="flame">' +
        '<path class="flame-outer" d="M60 30 C70 44 76 54 76 64 C76 76 69 84 60 84 C51 84 44 76 44 64 C44 54 50 44 60 30Z"/>' +
        '<path class="flame-inner" d="M60 50 C65 58 68 64 68 70 C68 77 64 81 60 81 C56 81 52 77 52 70 C52 64 55 58 60 50Z"/>' +
      '</g>' +
      '<path class="lamp" d="M26 86 C26 86 38 84 60 84 C82 84 94 86 94 86 C92 100 80 108 60 108 C40 108 28 100 26 86Z"/>' +
      '<path class="lamp-rim" d="M24 86 C40 82 80 82 96 86"/>' +
      '<ellipse class="lamp-glow" cx="60" cy="66" rx="42" ry="40"/>' +
      '</svg>';
  }

  function marigold(size) {
    var s = size || 26;
    var petals = '';
    for (var i = 0; i < 12; i++) {
      petals += '<ellipse class="mg-p" cx="20" cy="10" rx="4.6" ry="8.4" transform="rotate(' + (i * 30) + ' 20 20)"/>';
    }
    return '<svg class="art art-flower" viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true">' +
      '<g class="mg">' + petals + '<circle class="mg-c" cx="20" cy="20" r="5.2"/></g></svg>';
  }

  function leafPair() {
    return '<svg class="art art-leaf" viewBox="0 0 40 30" width="22" height="17" aria-hidden="true">' +
      '<path class="lf" d="M20 26 C8 24 2 16 3 5 C14 5 20 12 20 26Z"/>' +
      '<path class="lf" d="M20 26 C32 24 38 16 37 5 C26 5 20 12 20 26Z"/>' +
      '</svg>';
  }

  /* Torana: the garland of marigolds and mango leaves strung across a doorway. */
  function torana(count) {
    var out = '<div class="torana-rope"></div><div class="torana-row">';
    for (var i = 0; i < count; i++) {
      var drop = 6 + Math.round(Math.abs(Math.sin(i * 1.1)) * 16);
      out += '<span class="hang" style="--drop:' + drop + 'px;--i:' + i + '">' +
        '<span class="thread"></span>' +
        (i % 3 === 1 ? leafPair() : marigold(i % 2 ? 20 : 26)) +
        '</span>';
    }
    return out + '</div>';
  }

  function lotus() {
    return '<svg class="art art-lotus" viewBox="0 0 240 120" aria-hidden="true">' +
      '<path class="lt lt-b" d="M120 112 C70 112 30 94 14 66 C44 54 84 62 120 92Z"/>' +
      '<path class="lt lt-b" d="M120 112 C170 112 210 94 226 66 C196 54 156 62 120 92Z"/>' +
      '<path class="lt lt-m" d="M120 112 C86 112 58 92 50 62 C78 52 106 68 120 96Z"/>' +
      '<path class="lt lt-m" d="M120 112 C154 112 182 92 190 62 C162 52 134 68 120 96Z"/>' +
      '<path class="lt lt-t" d="M120 110 C104 96 96 74 100 48 C110 34 130 34 140 48 C144 74 136 96 120 110Z"/>' +
      '</svg>';
  }

  root.GA_ART = {
    heroEmblem: heroEmblem, mark: mark, diya: diya,
    marigold: marigold, torana: torana, lotus: lotus
  };
})(typeof window !== 'undefined' ? window : globalThis);
