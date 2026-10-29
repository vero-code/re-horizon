export interface SwayingGrassBackgroundProps {
  tintHex?: string;
  intensity?: number;
  interactive?: boolean;
}

export interface GrassBlade {
  x: number;
  height: number;
  baseWidth: number;
  curve: number;
  speed: number;
  phase: number;
  stiffness: number;
  hasSpike: boolean;
  spikeLength: number;
  layer: number;
  color: string;
  tipColor: string;
}

export interface PollenMote {
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  alpha: number;
  pulse: number;
}