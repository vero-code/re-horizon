import { HARMONIC_CHORDS } from "@/constants/horizon";
import { SoundscapeType } from "@/types/horizon";

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lfoTimer: number | null = null;
  private isPlaying = false;
  private baseVolume = 0.5;
  private isDucked = false;

  public start(type: SoundscapeType, initialVolume?: number): void {
    this.stop();

    if (typeof initialVolume === "number") {
      this.baseVolume = Math.max(0, Math.min(1, initialVolume));
    }

    const AudioCtx = window.AudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(
      this.getEffectiveGain(),
      this.ctx.currentTime
    );
    this.masterGain.connect(this.ctx.destination);

    this.setupHarmonicPad(this.ctx, this.masterGain, type);

    if (type !== "warm-drone") {
      this.setupNaturalTexture(this.ctx, this.masterGain, type);
    }

    this.isPlaying = true;
  }

  public stop(): void {
    if (this.lfoTimer !== null) {
      window.clearInterval(this.lfoTimer);
      this.lfoTimer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => undefined);
      this.ctx = null;
    }
    this.masterGain = null;
    this.isPlaying = false;
  }

  public setVolume(value: number): void {
    this.baseVolume = Math.max(0, Math.min(1, value));
    this.applyGainTransition();
  }

  public setDucking(ducked: boolean): void {
    this.isDucked = ducked;
    this.applyGainTransition();
  }

  private getEffectiveGain(): number {
    const scaled = this.baseVolume * 0.65;
    return this.isDucked ? scaled * 0.4 : scaled;
  }

  private applyGainTransition(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(
      this.getEffectiveGain(),
      now + 0.08
    );
  }

  private setupHarmonicPad(
    ctx: AudioContext,
    destination: AudioNode,
    type: SoundscapeType
  ): void {
    const frequencies = HARMONIC_CHORDS[type];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.connect(destination);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(
      type === "warm-drone" ? 0.35 : 0.14,
      ctx.currentTime
    );
    padGain.connect(filter);

    for (const freq of frequencies) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(padGain);
      osc.start();
    }
  }

  private setupNaturalTexture(
    ctx: AudioContext,
    destination: AudioNode,
    type: SoundscapeType
  ): void {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = type === "rain" ? "bandpass" : "lowpass";

    const baseFreq = type === "rain" ? 950 : type === "wind" ? 440 : 240;
    filter.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    const textureGain = ctx.createGain();
    textureGain.gain.setValueAtTime(0.75, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(textureGain);
    textureGain.connect(destination);
    noiseSource.start();

    let phase = 0;
    this.lfoTimer = window.setInterval(() => {
      if (!this.ctx) return;
      phase += type === "ocean" ? 0.2 : 0.3;
      const depth = type === "ocean" ? 160 : type === "wind" ? 130 : 70;
      const mod = Math.sin(phase) * depth;
      filter.frequency.setTargetAtTime(
        baseFreq + mod,
        this.ctx.currentTime,
        0.8
      );
    }, 400);
  }
}