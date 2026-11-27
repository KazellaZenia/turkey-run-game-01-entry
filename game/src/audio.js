// Synthesized sound for Gobble Dash: every effect is built from oscillators
// and filtered noise, so the game ships no audio files and needs no network.
// The audio context is created lazily on the first player gesture, because
// browsers block sound before the player interacts with the page.
export class SoundBank {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
  }

  // Create (or reuse) the audio context after a user gesture.
  unlock() {
    if (this.context) {
      if (this.context.state === 'suspended') this.context.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      this.context = new Ctor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.context.destination);
    } catch (err) {
      this.context = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.22;
    return this.muted;
  }

  // One short oscillator blip with a pitch slide.
  blip(type, fromHz, toHz, seconds, delay = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + delay;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(fromHz, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, toHz), t0 + seconds);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.9, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  // A burst of filtered noise, for flaps, whooshes and thuds.
  noise(seconds, filterHz, delay = 0, volume = 0.6) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + delay;
    const len = Math.max(1, Math.floor(this.context.sampleRate * seconds));
    const buffer = this.context.createBuffer(1, len, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.context.createBufferSource();
    src.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterHz;
    const gain = this.context.createGain();
    gain.gain.value = volume;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  // The turkey's gobble: five fast descending clucks.
  gobble() {
    for (let i = 0; i < 5; i++) {
      this.blip('square', 520 - i * 70, 240 - i * 30, 0.07, i * 0.075);
    }
  }

  // Wings beating on a jump.
  flap() {
    this.noise(0.14, 900, 0, 0.5);
    this.blip('sine', 300, 520, 0.12);
  }

  // Corn picked up: a bright two-note pop.
  pop() {
    this.blip('sine', 660, 990, 0.09);
    this.blip('sine', 990, 1320, 0.1, 0.07);
  }

  // Golden corn: a little arpeggio.
  goldenPop() {
    [523, 659, 784, 1047].forEach((hz, i) => this.blip('triangle', hz, hz, 0.12, i * 0.06));
  }

  // The farmer spots the turkey: a two-tone alarm.
  alarm() {
    this.blip('sawtooth', 392, 392, 0.16);
    this.blip('sawtooth', 523, 523, 0.16, 0.18);
  }

  // A carving knife swoops down: a fast falling whistle plus a whoosh.
  knifeWhoosh() {
    this.blip('sine', 1400, 220, 0.35);
    this.noise(0.3, 2400, 0.05, 0.55);
  }

  // The oven roars: low rumble.
  ovenRoar() {
    this.blip('sawtooth', 90, 55, 0.4);
    this.noise(0.35, 300, 0, 0.5);
  }

  // The farmer stumbles: a comic tumble.
  stumble() {
    this.blip('square', 300, 90, 0.3);
    this.noise(0.2, 500, 0.1, 0.6);
  }

  // A hit: a dull thud and a low buzz.
  thud() {
    this.blip('sawtooth', 180, 60, 0.25);
    this.noise(0.18, 240, 0, 0.7);
  }

  // Escaped: a rising victory fanfare.
  winStinger() {
    [523, 659, 784, 1047, 1319].forEach((hz, i) => this.blip('triangle', hz, hz, 0.22, i * 0.11));
    this.gobble();
  }

  // Caught: a sad descending line.
  loseStinger() {
    [392, 330, 262, 196].forEach((hz, i) => this.blip('sawtooth', hz, hz * 0.94, 0.3, i * 0.16));
  }
}
