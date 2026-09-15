/* A quiet drone under the recitation.
 *
 * Generated live with Web Audio rather than shipped as a file, so it costs
 * nothing to download and can be tuned, muted or retuned while listening.
 *
 * It is deliberately kept out of the way of the voice:
 *   - It never touches the <audio> element. The recitation plays natively and
 *     is not routed through Web Audio at all, so nothing here can mute it,
 *     colour it, or fail in a way that silences it.
 *   - It sounds only while the recitation is playing, fading in and out, so it
 *     is always an under-layer and never a drone on its own.
 *   - Each pitch carries its own trim. 136.1 Hz sits below a speaking voice and
 *     can be held at full level; 432 Hz lands in the first formant region and
 *     741 Hz in the presence band where consonants live, so both are pulled
 *     well down to stay clear of her articulation.
 */
(function (root) {
  'use strict';

  var PITCHES = {
    '136.1': { hz: 136.1, trim: 1.00, name: 'Om, 136.1 Hz',
               note: 'The earth-year tone, traditional for Gaṇeśa. Sits below the voice.' },
    '432':   { hz: 432,   trim: 0.50, name: '432 Hz',
               note: 'Warmer and more present. Held lower, it shares range with the voice.' },
    '741':   { hz: 741,   trim: 0.30, name: '741 Hz',
               note: 'Bright and bell-like. Held lowest of the three.' }
  };

  var PEAK = 0.05;       // ceiling for the mixed drone, well under the recitation
  var FADE_IN = 2.5;
  var FADE_OUT = 1.2;

  var ctx = null, master = null, voices = [], sounding = false;
  var pitch = '136.1', level = 0.45, enabled = true;

  function build() {
    if (ctx) return true;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }

    master = ctx.createGain();
    master.gain.value = 0;

    // Keep the drone warm and away from the consonant band.
    var tame = ctx.createBiquadFilter();
    tame.type = 'lowpass';
    tame.frequency.value = 1400;
    tame.Q.value = 0.6;
    master.connect(tame).connect(ctx.destination);

    // Two voices a beat apart, plus a soft octave, give it body without
    // adding anything sharp enough to compete with speech.
    [[1, 0, 0.60], [1, 0.3, 0.45], [2, 0, 0.16]].forEach(function (spec) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      var g = ctx.createGain();
      g.gain.value = spec[2];
      osc.connect(g).connect(master);
      osc.start();
      voices.push({ osc: osc, mult: spec[0], offset: spec[1] });
    });

    // A very slow swell, so it breathes instead of sitting flat.
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    var depth = ctx.createGain();
    depth.gain.value = 0.18;
    lfo.connect(depth).connect(master.gain);
    lfo.start();

    retune();
    return true;
  }

  function retune() {
    if (!ctx) return;
    var base = PITCHES[pitch].hz;
    voices.forEach(function (v) {
      v.osc.frequency.setTargetAtTime(base * v.mult + v.offset, ctx.currentTime, 0.25);
    });
  }

  function target() {
    return enabled ? PEAK * level * PITCHES[pitch].trim : 0;
  }

  function ramp(to, seconds) {
    if (!ctx) return;
    var g = master.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(Math.max(g.value, 0.0001), ctx.currentTime);
    g.linearRampToValueAtTime(Math.max(to, 0.0001), ctx.currentTime + seconds);
  }

  var API = {
    pitches: PITCHES,

    /* Called from a click or key press, so the audio context is allowed to start. */
    start: function () {
      sounding = true;
      if (!enabled || !build()) return;
      if (ctx.state === 'suspended') ctx.resume();
      ramp(target(), FADE_IN);
    },

    stop: function () {
      sounding = false;
      if (ctx) ramp(0, FADE_OUT);
    },

    setEnabled: function (on) {
      enabled = !!on;
      if (!enabled) { if (ctx) ramp(0, 0.4); return; }
      if (sounding) { if (build() && ctx.state === 'suspended') ctx.resume(); ramp(target(), 1.0); }
    },

    setPitch: function (key) {
      if (!PITCHES[key]) return;
      pitch = key;
      retune();
      if (sounding && enabled) ramp(target(), 0.8);
    },

    setLevel: function (v) {
      level = Math.max(0, Math.min(1, v));
      if (sounding && enabled) ramp(target(), 0.3);
    },

    state: function () { return { enabled: enabled, pitch: pitch, level: level }; }
  };

  root.GA_TONE = API;
})(typeof window !== 'undefined' ? window : globalThis);
