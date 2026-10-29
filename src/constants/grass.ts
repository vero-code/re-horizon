// Grass blade colors per depth layer
export const GRASS_PALETTE = {
  bg: ["#122316", "#162c1d", "#1b3423"],
  mid: ["#22432c", "#2c5438", "#386644"],
  fg: ["#3e734c", "#4b8b5c", "#5fa873"],
  tips: ["#88c273", "#a7d489", "#c4e5a3", "#d9e08d"],
};

// Sky gradient stops drawn behind the grass
export const SKY_STOPS: [number, string][] = [
  [0, "#0c1428"],
  [0.4, "#1e2a4a"],
  [0.65, "#3b3550"],
  [1, "#0d1a12"],
];

// Horizon glow color stops
export const GLOW_STOPS: [number, string][] = [
  [0, "rgba(251, 146, 60, 0.30)"],
  [0.45, "rgba(244, 114, 182, 0.12)"],
  [1, "rgba(0, 0, 0, 0)"],
];

// Simulation settings
export const GRASS_SETTINGS = {
  DENSITY_DIVIDER: 3.5,
  POLLEN_COUNT: 36,
  MOUSE_RADIUS: 180,
  MOUSE_PUSH: 35,
  TIME_STEP: 0.022,
};