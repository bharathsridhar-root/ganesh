/* Original SVG artwork for the Gaṇapati Atharvaśīrṣa site.
 * Everything here is drawn from scratch with paths, so it scales to any screen,
 * animates cheaply, and carries no licence of its own.
 * Colours come from CSS custom properties, so the art follows the theme. */
(function (root) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* Petals arranged around a centre, the base of every mandala here. */
  function petalRing(count, rInner, rOuter, width, cls) {
    var out = '';
    for (var i = 0; i < count; i++) {
      var a = (360 / count) * i;
      out += '<path class="' + cls + '" transform="rotate(' + a + ' 120 120)" d="' +
        'M120 ' + (120 - rInner) +
        ' C' + (120 + width) + ' ' + (120 - rInner - (rOuter - rInner) * 0.35) +
        ' ' + (120 + width) + ' ' + (120 - rOuter + (rOuter - rInner) * 0.25) +
        ' 120 ' + (120 - rOuter) +
        ' C' + (120 - width) + ' ' + (120 - rOuter + (rOuter - rInner) * 0.25) +
        ' ' + (120 - width) + ' ' + (120 - rInner - (rOuter - rInner) * 0.35) +
        ' 120 ' + (120 - rInner) + 'Z"/>';
    }
    return out;
  }

  /* Small repeated teardrops used as a decorative border. */
  function beadRing(count, r, size, cls) {
    var out = '';
    for (var i = 0; i < count; i++) {
      var a = ((360 / count) * i) * Math.PI / 180;
      out += '<circle class="' + cls + '" cx="' + (120 + Math.sin(a) * r).toFixed(2) +
        '" cy="' + (120 - Math.cos(a) * r).toFixed(2) + '" r="' + size + '"/>';
    }
    return out;
  }

  /* The figure: crown, ears, trunk curling to his right, one whole tusk. */
  function ganeshaFigure() {
    return [
      /* halo behind the head */
      '<circle class="g-halo" cx="120" cy="116" r="60"/>',

      /* crown (mukuṭa) with its finial */
      '<path class="g-fill" d="M97 74 C97 52 104 34 120 20 C136 34 143 52 143 74 Z"/>',
      '<circle class="g-fill" cx="120" cy="16" r="4.6"/>',
      '<path class="g-line" d="M106 66 C109 54 114 44 120 36 C126 44 131 54 134 66"/>',
      '<rect class="g-fill" x="93" y="70" width="54" height="10" rx="5"/>',
      '<circle class="g-jewel" cx="120" cy="75" r="3.2"/>',

      /* ears, wide as winnowing fans */
      '<path class="g-fill" transform="rotate(-8 74 112)" d="M78 80 C54 80 42 96 42 116 C42 136 54 150 76 150 C88 150 93 138 93 114 C93 92 90 80 78 80Z"/>',
      '<path class="g-fill" transform="rotate(8 166 112)" d="M162 80 C186 80 198 96 198 116 C198 136 186 150 164 150 C152 150 147 138 147 114 C147 92 150 80 162 80Z"/>',
      '<path class="g-line" transform="rotate(-8 74 112)" d="M80 92 C63 96 55 106 55 118 C55 131 63 139 76 141"/>',
      '<path class="g-line" transform="rotate(8 166 112)" d="M160 92 C177 96 185 106 185 118 C185 131 177 139 164 141"/>',

      /* head */
      '<path class="g-fill" d="M120 76 C145 76 158 92 158 114 C158 137 142 154 120 154 C98 154 82 137 82 114 C82 92 95 76 120 76Z"/>',

      /* brow, third eye, eyes */
      '<path class="g-line" d="M97 103 C103 97 111 96 117 99"/>',
      '<path class="g-line" d="M143 103 C137 97 129 96 123 99"/>',
      '<path class="g-jewel-s" d="M120 88 l3.6 6.4 -3.6 6.4 -3.6 -6.4Z"/>',
      '<path class="g-eye" d="M97 110 C102 105 110 105 114 110 C110 115 102 115 97 110Z"/>',
      '<path class="g-eye" d="M126 110 C130 105 138 105 143 110 C138 115 130 115 126 110Z"/>',

      /* tusks flanking the trunk, his right one whole, the left one broken */
      '<path class="g-tusk" d="M101 133 C97 146 96 158 98 170 C102 158 104 145 106 134Z"/>',
      '<path class="g-tusk" d="M139 133 C143 142 144 149 143 155 C139 148 137 141 134 134Z"/>',

      /* trunk: down the centre, then sweeping to his right into a curl */
      '<path class="g-trunk" d="M120 126 C124 150 121 170 108 181 C96 191 82 186 83 175 C84 166 94 163 100 170"/>',
      '<circle class="g-jewel" cx="101" cy="172" r="2.6"/>'
    ].join('');
  }

  /* Full hero emblem: mandala rings around the figure. */
  function heroEmblem() {
    return '<svg class="art art-hero" viewBox="0 0 240 240" role="img" aria-label="Lord Gaṇeśa">' +
      '<g class="ring-outer">' + petalRing(24, 96, 118, 9, 'p-outer') + '</g>' +
      '<g class="ring-mid">' + petalRing(16, 74, 98, 11, 'p-mid') + '</g>' +
      '<g class="ring-beads">' + beadRing(32, 68, 1.8, 'bead') + '</g>' +
      '<circle class="disc" cx="120" cy="120" r="70"/>' +
      ganeshaFigure() +
      '</svg>';
  }

  /* Compact mark for the header. */
  function mark() {
    return '<svg class="art art-mark" viewBox="0 0 240 240" role="img" aria-label="Gaṇeśa">' +
      '<g class="ring-mid">' + petalRing(12, 78, 112, 13, 'p-mid') + '</g>' +
      '<circle class="disc" cx="120" cy="120" r="72"/>' +
      ganeshaFigure() +
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

  /* A single marigold blossom, used in the garland and as a falling petal. */
  function marigold(size) {
    var s = size || 26;
    return '<svg class="art art-flower" viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true">' +
      '<g class="mg">' +
      (function () {
        var o = '';
        for (var i = 0; i < 12; i++) {
          o += '<ellipse class="mg-p" cx="20" cy="10" rx="4.6" ry="8.4" transform="rotate(' + (i * 30) + ' 20 20)"/>';
        }
        return o;
      })() +
      '<circle class="mg-c" cx="20" cy="20" r="5.2"/>' +
      '</g></svg>';
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

  /* A lotus for the foot of the page. */
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
    heroEmblem: heroEmblem,
    mark: mark,
    diya: diya,
    marigold: marigold,
    torana: torana,
    lotus: lotus
  };
})(typeof window !== 'undefined' ? window : globalThis);
