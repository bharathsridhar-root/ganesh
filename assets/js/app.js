/* Gaṇapati Atharvaśīrṣa — recite-along page.
 * Builds the text, keeps it in step with the recording, and explains words on tap. */
(function () {
  'use strict';

  var TEXT = window.GA_TEXT;
  var TIME = window.GA_TIMINGS || { cues: {} };
  var $ = function (id) { return document.getElementById(id); };

  /* Tokens with no lexical content: dandas and verse numerals. */
  var SKIP = /^[।॥\s०-९]+$/;

  var lines = [];      // flat, in recitation order
  var byId = {};
  var cues = [];       // { t, index } sorted by time
  var active = -1;
  var audio = $('audio');
  var follow = true;
  var loopLine = false;
  var userScrolled = false;
  var autoScrollUntil = 0;

  /* ------------------------------------------------------------------ build */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* Render one Devanagari line, wrapping each real word so it can be tapped. */
  function renderDev(line) {
    var p = el('p', 'dev');
    var parts = line.dev.split(/(\s+)/);
    var w = 0;
    parts.forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part) || SKIP.test(part)) {
        p.appendChild(document.createTextNode(part));
        return;
      }
      var gloss = line.words[w++];
      if (!gloss) { p.appendChild(document.createTextNode(part)); return; }
      var s = el('span', 'w', part);
      s.dataset.line = line.id;
      s.dataset.w = String(w - 1);
      p.appendChild(s);
    });
    return p;
  }

  function build() {
    var main = $('text');
    var rail = $('rail');

    TEXT.sections.forEach(function (sec) {
      var head = el('div', 'sec-head');
      head.appendChild(el('h2', null, sec.dev));
      head.appendChild(el('p', null, sec.name + ' · ' + sec.sub));
      head.appendChild(el('div', 'sec-rule'));
      head.id = 'sec-' + sec.id;
      main.appendChild(head);

      rail.appendChild(el('span', 'rail-group', sec.name));

      sec.verses.forEach(function (verse) {
        var card = el('article', 'verse');
        card.id = 'verse-' + verse.id;

        var vh = el('div', 'verse-head');
        vh.appendChild(el('span', 'verse-num', verse.num || ''));
        vh.appendChild(el('h3', 'verse-title', verse.title));
        card.appendChild(vh);

        verse.lines.forEach(function (line) {
          line.verseId = verse.id;
          var row = el('div', 'line');
          row.id = 'line-' + line.id;
          row.dataset.id = line.id;

          var left = el('div', 'san');
          left.appendChild(renderDev(line));
          left.appendChild(el('p', 'phon', line.phon));
          row.appendChild(left);
          row.appendChild(el('p', 'eng', line.en));

          card.appendChild(row);
          line.node = row;
          line.card = card;
          line.index = lines.length;
          lines.push(line);
          byId[line.id] = line;
        });

        main.appendChild(card);

        if (verse.num) {
          var pill = el('button', 'pill', verse.num);
          pill.title = verse.title;
          pill.dataset.verse = verse.id;
          pill.addEventListener('click', function () { jumpToVerse(verse); });
          verse.pill = pill;
          rail.appendChild(pill);
        }
      });
    });

    // cue table
    lines.forEach(function (line, i) {
      var t = TIME.cues[line.id];
      if (typeof t === 'number') cues.push({ t: t, i: i });
    });
    cues.sort(function (a, b) { return a.t - b.t; });
  }

  /* --------------------------------------------------------------- artwork */

  function art() {
    $('heroArt').innerHTML = window.GA_ART.heroEmblem();
    $('brandMark').innerHTML = window.GA_ART.mark();
    $('torana').innerHTML = window.GA_ART.torana(window.innerWidth < 620 ? 9 : 17);
    $('footArt').innerHTML =
      window.GA_ART.diya() + window.GA_ART.lotus() + window.GA_ART.diya(true);
  }

  function petals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var n = window.innerWidth < 620 ? 7 : 13;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('div');
      d.className = 'petal';
      d.innerHTML = window.GA_ART.marigold(9 + Math.random() * 13);
      d.style.left = (Math.random() * 100) + 'vw';
      d.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      d.style.setProperty('--spin', (260 + Math.random() * 500) + 'deg');
      d.style.animationDuration = (14 + Math.random() * 16) + 's';
      d.style.animationDelay = (-Math.random() * 24) + 's';
      d.style.opacity = (0.35 + Math.random() * 0.4).toFixed(2);
      document.body.appendChild(d);
    }
  }

  /* ---------------------------------------------------------------- timing */

  function lineStart(i) {
    for (var k = 0; k < cues.length; k++) if (cues[k].i === i) return cues[k].t;
    return null;
  }

  function lineEnd(i) {
    for (var k = 0; k < cues.length; k++) {
      if (cues[k].i === i) return k + 1 < cues.length ? cues[k + 1].t : (audio.duration || Infinity);
    }
    return Infinity;
  }

  /* Index of the line being recited at time t (binary search over cues). */
  function at(t) {
    if (!cues.length) return -1;
    var lo = 0, hi = cues.length - 1, ans = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (cues[mid].t <= t) { ans = cues[mid].i; lo = mid + 1; } else { hi = mid - 1; }
    }
    return ans;
  }

  function setActive(i, opts) {
    if (i === active) return;
    if (active >= 0 && lines[active]) {
      lines[active].node.classList.remove('on');
      lines[active].card.classList.remove('has-active');
    }
    active = i;
    if (i < 0 || !lines[i]) { $('nowDev').textContent = ''; $('nowEn').textContent = ''; return; }

    var line = lines[i];
    line.node.classList.add('on');
    line.card.classList.add('has-active');
    $('nowDev').textContent = line.dev.replace(/[।॥०-९]/g, '').trim();
    $('nowEn').textContent = line.en;

    // highlight the matching verse pill
    document.querySelectorAll('.pill.on').forEach(function (p) { p.classList.remove('on'); });
    var pill = document.querySelector('.pill[data-verse="' + line.verseId + '"]');
    if (pill) {
      pill.classList.add('on');
      pill.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }

    if (follow && !userScrolled && !(opts && opts.noScroll)) scrollToLine(line);
  }

  function scrollToLine(line) {
    var r = line.node.getBoundingClientRect();
    var target = window.scrollY + r.top - window.innerHeight * 0.38;
    autoScrollUntil = Date.now() + 900;
    window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }

  /* ---------------------------------------------------------------- player */

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60);
    var r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function heroMeta(d) {
    var total = Math.round(d);
    return Math.floor(total / 60) + ' min ' + (total % 60) + ' s · 17 verses · ' + lines.length + ' lines';
  }

  function showPlayer() { $('player').hidden = false; }

  function play() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked; the button still works */ });
  }

  function seekTo(t) {
    audio.currentTime = Math.max(0, Math.min(t, audio.duration || t));
    setActive(at(audio.currentTime));
  }

  function jumpToLine(i, alsoPlay) {
    var t = lineStart(i);
    userScrolled = false;
    $('btnResume').hidden = true;
    if (t == null) {
      lines[i].node.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    seekTo(t + 0.02);
    scrollToLine(lines[i]);
    if (alsoPlay) play();
  }

  function jumpToVerse(verse) {
    var first = verse.lines[0];
    if (byId[first.id]) jumpToLine(byId[first.id].index, !audio.paused);
    else first.node.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function tick() {
    var t = audio.currentTime;

    if (loopLine && active >= 0) {
      var end = lineEnd(active);
      if (t >= end - 0.03) { seekTo(lineStart(active) + 0.02); return; }
    }

    var i = at(t);
    if (i !== active) setActive(i);

    var d = audio.duration || TIME.duration || 0;
    var pct = d ? (t / d) * 100 : 0;
    $('seekFill').style.width = pct + '%';
    $('seekHead').style.left = 'calc(' + pct + '% )';
    $('tNow').textContent = fmt(t);
    $('seek').setAttribute('aria-valuenow', Math.round(t));
    $('seek').setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(d));
  }

  function buildMarks() {
    var d = audio.duration || TIME.duration;
    if (!d) return;
    var box = $('seekMarks');
    box.innerHTML = '';
    TEXT.sections.forEach(function (sec) {
      sec.verses.forEach(function (verse) {
        var first = verse.lines[0];
        var t = TIME.cues[first.id];
        if (typeof t !== 'number') return;
        var m = document.createElement('i');
        m.style.left = (t / d * 100) + '%';
        box.appendChild(m);
      });
    });
  }

  /* ------------------------------------------------------------ preferences */

  var PREF = {
    get: function (k, d) { try { var v = localStorage.getItem('ga.' + k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('ga.' + k, v); } catch (e) { /* private mode */ } }
  };

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    PREF.set('theme', t);
    $('btnTheme').setAttribute('aria-label',
      t === 'night' ? 'Switch to daytime colours' : 'Switch to evening colours');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'night' ? '#1E0614' : '#7B1341');
  }

  function setPhon(on) {
    document.body.classList.toggle('show-phon', on);
    $('btnPhon').setAttribute('aria-pressed', String(on));
    PREF.set('phon', on ? '1' : '0');
  }

  function setEng(on) {
    document.body.classList.toggle('no-en', !on);
    $('btnEng').setAttribute('aria-pressed', String(on));
    PREF.set('eng', on ? '1' : '0');
  }

  var fs = 1;
  function setFs(v) {
    fs = Math.max(0.85, Math.min(1.6, Math.round(v * 20) / 20));
    document.documentElement.style.setProperty('--fs', String(fs));
    PREF.set('fs', String(fs));
  }

  /* ----------------------------------------------------------------- gloss */

  var glossFor = null;

  function showGloss(span) {
    var line = byId[span.dataset.line];
    var word = line && line.words[+span.dataset.w];
    if (!word) return;
    var g = $('gloss');
    $('glossDev').textContent = word.s;
    $('glossPhon').textContent = word.p;
    $('glossMean').textContent = word.m;
    g.hidden = false;

    var r = span.getBoundingClientRect();
    var gw = g.offsetWidth, gh = g.offsetHeight;
    var left = window.scrollX + r.left + r.width / 2 - gw / 2;
    left = Math.max(window.scrollX + 10, Math.min(left, window.scrollX + window.innerWidth - gw - 10));
    var top = window.scrollY + r.bottom + 10;
    if (r.bottom + gh + 20 > window.innerHeight) top = window.scrollY + r.top - gh - 10;
    g.style.left = left + 'px';
    g.style.top = top + 'px';

    if (glossFor) glossFor.classList.remove('lit');
    span.classList.add('lit');
    glossFor = span;
  }

  function hideGloss() {
    $('gloss').hidden = true;
    if (glossFor) glossFor.classList.remove('lit');
    glossFor = null;
  }

  /* ----------------------------------------------------------------- wiring */

  function wire() {
    // text interactions
    $('text').addEventListener('click', function (e) {
      var w = e.target.closest('.w');
      if (w) { e.stopPropagation(); showGloss(w); return; }
      var row = e.target.closest('.line');
      if (row) { hideGloss(); jumpToLine(byId[row.dataset.id].index, !audio.paused); }
    });
    $('text').addEventListener('mouseover', function (e) {
      var w = e.target.closest('.w');
      if (w && window.matchMedia('(hover: hover)').matches) showGloss(w);
    });
    $('text').addEventListener('mouseout', function (e) {
      if (e.target.closest('.w') && window.matchMedia('(hover: hover)').matches) hideGloss();
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.gloss') && !e.target.closest('.w')) hideGloss();
    });

    // transport
    $('btnPlay').addEventListener('click', function () { audio.paused ? play() : audio.pause(); });
    $('btnPrev').addEventListener('click', function () { jumpToLine(Math.max(0, active - 1), !audio.paused); });
    $('btnNext').addEventListener('click', function () { jumpToLine(Math.min(lines.length - 1, active + 1), !audio.paused); });
    $('btnBegin').addEventListener('click', function () {
      showPlayer();
      userScrolled = false;
      if (active < 0) setActive(0, { noScroll: true });
      play();
      scrollToLine(lines[Math.max(0, active)]);
    });
    $('btnRead').addEventListener('click', function () {
      $('text').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('btnLoop').addEventListener('click', function () {
      loopLine = !loopLine;
      this.setAttribute('aria-pressed', String(loopLine));
    });
    $('btnFollow').addEventListener('click', function () {
      follow = !follow;
      this.setAttribute('aria-pressed', String(follow));
      if (follow) {
        userScrolled = false;
        $('btnResume').hidden = true;
        if (active >= 0) scrollToLine(lines[active]);
      }
    });
    $('btnResume').addEventListener('click', function () {
      userScrolled = false;
      this.hidden = true;
      if (active >= 0) scrollToLine(lines[active]);
    });
    $('rate').addEventListener('change', function () { audio.playbackRate = parseFloat(this.value); });

    // seek bar
    var dragging = false;
    function seekFromEvent(e) {
      var r = $('seek').getBoundingClientRect();
      var x = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width;
      seekTo(Math.max(0, Math.min(1, x)) * (audio.duration || TIME.duration || 0));
    }
    $('seek').addEventListener('pointerdown', function (e) {
      dragging = true; this.setPointerCapture(e.pointerId); seekFromEvent(e);
    });
    $('seek').addEventListener('pointermove', function (e) { if (dragging) seekFromEvent(e); });
    $('seek').addEventListener('pointerup', function () { dragging = false; });
    $('seek').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { seekTo(audio.currentTime - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { seekTo(audio.currentTime + 5); e.preventDefault(); }
    });

    // audio events
    audio.addEventListener('timeupdate', tick);
    audio.addEventListener('loadedmetadata', function () {
      $('tAll').textContent = fmt(audio.duration);
      $('heroMeta').textContent = heroMeta(audio.duration);
      $('seek').setAttribute('aria-valuemax', Math.round(audio.duration));
      buildMarks();
    });
    audio.addEventListener('play', function () {
      $('btnPlay').textContent = '❚❚';
      $('btnPlay').setAttribute('aria-label', 'Pause');
      showPlayer();
    });
    audio.addEventListener('pause', function () {
      $('btnPlay').textContent = '▶';
      $('btnPlay').setAttribute('aria-label', 'Play');
    });
    audio.addEventListener('ended', function () { setActive(-1); });
    audio.addEventListener('error', function () {
      $('nowDev').textContent = 'Recording not found';
      $('nowEn').textContent = 'Expected ' + (TIME.audio || 'the audio file') + ' beside index.html';
    });

    // let the reader take over scrolling
    ['wheel', 'touchmove'].forEach(function (ev) {
      window.addEventListener(ev, function () {
        if (Date.now() > autoScrollUntil && !audio.paused && follow) {
          userScrolled = true;
          $('btnResume').hidden = false;
        }
      }, { passive: true });
    });

    // header controls
    $('btnPhon').addEventListener('click', function () { setPhon(this.getAttribute('aria-pressed') !== 'true'); });
    $('btnEng').addEventListener('click', function () { setEng(this.getAttribute('aria-pressed') !== 'true'); });
    $('btnBigger').addEventListener('click', function () { setFs(fs + 0.1); });
    $('btnSmaller').addEventListener('click', function () { setFs(fs - 0.1); });
    $('btnTheme').addEventListener('click', function () {
      setTheme(document.documentElement.dataset.theme === 'night' ? 'day' : 'night');
    });
    $('btnHelp').addEventListener('click', function () { $('sheet').hidden = false; });
    $('btnCloseSheet').addEventListener('click', function () { $('sheet').hidden = true; });
    $('sheet').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });

    // keyboard
    document.addEventListener('keydown', function (e) {
      if (e.target.matches('input, select, textarea')) return;
      var k = e.key.toLowerCase();
      if (e.key === 'Escape') { hideGloss(); $('sheet').hidden = true; return; }
      if (e.key === ' ') { e.preventDefault(); showPlayer(); audio.paused ? play() : audio.pause(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); jumpToLine(Math.max(0, active - 1), !audio.paused); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); jumpToLine(Math.min(lines.length - 1, active + 1), !audio.paused); }
      else if (k === 'l') $('btnLoop').click();
      else if (k === 'f') $('btnFollow').click();
      else if (k === 'p') $('btnPhon').click();
      else if (k === 'e') $('btnEng').click();
      else if (k === 't') $('btnTheme').click();
      else if (e.key === '+' || e.key === '=') setFs(fs + 0.1);
      else if (e.key === '-') setFs(fs - 0.1);
      else if (e.key === '?') $('sheet').hidden = false;
    });

    window.addEventListener('resize', function () {
      $('torana').innerHTML = window.GA_ART.torana(window.innerWidth < 620 ? 9 : 17);
      hideGloss();
    });
  }

  /* ------------------------------------------------------------------- init */

  function init() {
    build();
    art();
    petals();
    wire();

    setTheme(PREF.get('theme', 'day'));
    setPhon(PREF.get('phon', '0') === '1');
    setEng(PREF.get('eng', '1') === '1');
    setFs(parseFloat(PREF.get('fs', '1')) || 1);

    audio.src = TIME.audio || 'Ganapatyatarvasheersam.mp3';
    if (TIME.duration) $('tAll').textContent = fmt(TIME.duration);
    $('heroMeta').textContent = heroMeta(TIME.duration || 0);
    showPlayer();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
