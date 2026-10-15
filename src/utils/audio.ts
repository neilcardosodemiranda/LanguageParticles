/**
 * Web Audio API Synthesizer for Neuromorphic Particle Collider
 * Generates quantum pings, synaptic axon spikes, relativistic hums, and word fusion resonances.
 */

class NeuromorphicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.25;
  private synchrotronOsc: OscillatorNode | null = null;
  private synchrotronGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * Collision ping based on letter character frequency & mass
   */
  public playLetterCollision(char: string, velocity: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch mapped from letter ASCII code (A=65 -> 220Hz, Z=90 -> 880Hz)
      const baseCode = char.toUpperCase().charCodeAt(0) || 65;
      const normalized = Math.max(0, Math.min(1, (baseCode - 65) / 25));
      const freq = 220 + normalized * 660;

      osc.type = char.match(/[AEIOUYaeiouy]/) ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.08);

      const amp = Math.min(0.2, 0.04 + velocity * 0.02);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Neuromorphic LIF Neuron Spike (bio-electrical discharge click)
   */
  public playNeuronSpike(core: 'alpha' | 'beta' | 'gamma' | 'delta') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreqs = { alpha: 800, beta: 1200, gamma: 1600, delta: 500 };
      const f = baseFreqs[core] || 900;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Silence
    }
  }

  /**
   * Word / Hadron synthesis chord (Harmonic lock)
   */
  public playWordFusion(word: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Synthesize a major chord (Root, Major 3rd, 5th, Octave)
      const rootFreq = 261.63; // Middle C
      const intervals = [1, 1.25, 1.5, 2.0];

      intervals.forEach((ratio, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(rootFreq * ratio, now);

        const startDelay = idx * 0.03;
        gain.gain.setValueAtTime(0.001, now + startDelay);
        gain.gain.linearRampToValueAtTime(0.07, now + startDelay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + startDelay);
        osc.stop(now + 0.6);
      });
    } catch {
      // Silence
    }
  }

  /**
   * Antimatter Annihilation Explosion
   */
  public playAnnihilation() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Sub bass boom
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.4);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.48);
    } catch {
      // Silence
    }
  }

  /**
   * Continuous Relativistic Synchrotron Hum
   */
  public updateSynchrotronHum(active: boolean, beamSpeedFraction: number) {
    if (this.isMuted || !active) {
      if (this.synchrotronGain && this.ctx) {
        this.synchrotronGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      }
      return;
    }
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      if (!this.synchrotronOsc) {
        this.synchrotronOsc = this.ctx.createOscillator();
        this.synchrotronGain = this.ctx.createGain();
        this.synchrotronOsc.type = 'triangle';
        this.synchrotronOsc.frequency.setValueAtTime(60, now);
        this.synchrotronGain.gain.setValueAtTime(0.001, now);
        this.synchrotronOsc.connect(this.synchrotronGain);
        this.synchrotronGain.connect(this.masterGain);
        this.synchrotronOsc.start();
      }

      if (this.synchrotronOsc && this.synchrotronGain) {
        const targetFreq = 70 + beamSpeedFraction * 180;
        this.synchrotronOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
        this.synchrotronGain.gain.setTargetAtTime(0.04 * beamSpeedFraction, now, 0.05);
      }
    } catch {
      // Silence
    }
  }
}

export const soundEngine = new NeuromorphicAudioEngine();
