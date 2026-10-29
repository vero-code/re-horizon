import { SoundscapeType } from "@/types/horizon";

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private lfoTimer: number | null = null;
  private isPlaying = false;

  public start(type: SoundscapeType): void {
    this.stop();

    const AudioCtx = window.AudioContext;
    this.ctx = new AudioCtx();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(
      0.18,
      this.ctx.currentTime + 2.0
    );
    this.gainNode.connect(this.ctx.destination);

    if (type === "warm-drone") {
      this.setupWarmDrone(this.ctx, this.gainNode);
    } else {
      this.setupFilteredNoise(this.ctx, this.gainNode, type);
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
    this.gainNode = null;
    this.isPlaying = false;
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  private setupWarmDrone(ctx: AudioContext, destination: AudioNode): void {
    const frequencies = [110, 164.81, 220, 277.18];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(360, ctx.currentTime);
    filter.connect(destination);

    for (const freq of frequencies) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
    }
  }

  private setupFilteredNoise(
    ctx: AudioContext,
    destination: AudioNode,
    type: SoundscapeType
  ): void {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    // Generate pink-like soft noise
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.0;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = type === "rain" ? "bandpass" : "lowpass";

    const baseFreq = type === "rain" ? 900 : type === "wind" ? 450 : 280;
    filter.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    if (type === "ocean" || type === "wind") {
      let phase = 0;
      this.lfoTimer = window.setInterval(() => {
        if (!this.ctx) return;
        phase += 0.25;
        const mod = Math.sin(phase) * 140;
        filter.frequency.setTargetAtTime(
          baseFreq + mod,
          this.ctx.currentTime,
          0.8
        );
      }, 400);
    }
  }
}