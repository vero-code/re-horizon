"use client";

import React, { useEffect, useRef } from "react";
import {
  GrassBlade,
  PollenMote,
  SwayingGrassBackgroundProps,
} from "@/types/grass";
import {
  GLOW_STOPS,
  GRASS_PALETTE,
  GRASS_SETTINGS,
  SKY_STOPS,
} from "@/constants/grass";

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

export const SwayingGrassBackground: React.FC<SwayingGrassBackgroundProps> = ({
  intensity = 1,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    vx: 0,
    lastX: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let blades: GrassBlade[] = [];
    const pollenMotes: PollenMote[] = [];

    const initBlades = () => {
      blades = [];
      const density = Math.floor(width / GRASS_SETTINGS.DENSITY_DIVIDER);

      for (let i = 0; i < density; i++) {
        const layer = Math.random() < 0.35 ? 0 : Math.random() < 0.7 ? 1 : 2;
        const x = (i / density) * width + (Math.random() - 0.5) * 8;
        const heightFactor = layer === 0 ? 0.65 : layer === 1 ? 0.85 : 1.05;
        const baseHeight =
          (height * 0.28 + Math.random() * (height * 0.22)) * heightFactor;

        const color =
          layer === 0
            ? pick(GRASS_PALETTE.bg)
            : layer === 1
              ? pick(GRASS_PALETTE.mid)
              : pick(GRASS_PALETTE.fg);

        blades.push({
          x,
          height: baseHeight,
          baseWidth: layer === 0 ? 2 : layer === 1 ? 3 : 4.5,
          curve: (Math.random() - 0.5) * 20,
          speed: 0.015 + Math.random() * 0.018,
          phase: Math.random() * Math.PI * 2,
          stiffness: 0.85 + Math.random() * 0.4,
          hasSpike: false,
          spikeLength: 0,
          layer,
          color,
          tipColor: pick(GRASS_PALETTE.tips),
        });
      }

      blades.sort((a, b) => a.layer - b.layer);

      pollenMotes.length = 0;
      for (let p = 0; p < GRASS_SETTINGS.POLLEN_COUNT; p++) {
        pollenMotes.push({
          x: Math.random() * width,
          y: height - Math.random() * (height * 0.45),
          size: Math.random() * 2 + 0.8,
          vy: -Math.random() * 0.4 - 0.15,
          vx: Math.random() * 0.4 - 0.1,
          alpha: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const vx = clientX - mouseRef.current.lastX;
      mouseRef.current = {
        x: clientX,
        y: clientY,
        vx: Math.max(-25, Math.min(25, vx)),
        lastX: clientX,
        active: true,
      };
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBlades();
    };

    const handleMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", handleResize);
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    const drawSky = () => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      SKY_STOPS.forEach(([stop, color]) => sky.addColorStop(stop, color));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(
        width / 2,
        height * 0.7,
        0,
        width / 2,
        height * 0.7,
        width * 0.6
      );
      GLOW_STOPS.forEach(([stop, color]) => glow.addColorStop(stop, color));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const floor = ctx.createLinearGradient(0, height * 0.65, 0, height);
      floor.addColorStop(0, "rgba(8, 18, 11, 0)");
      floor.addColorStop(0.5, "rgba(10, 24, 14, 0.45)");
      floor.addColorStop(1, "rgba(5, 12, 7, 0.9)");
      ctx.fillStyle = floor;
      ctx.fillRect(0, height * 0.65, width, height * 0.35);
    };

    const getMousePush = (bladeX: number) => {
      if (!mouseRef.current.active) return 0;
      const dx = bladeX - mouseRef.current.x;
      const dy = height - mouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= GRASS_SETTINGS.MOUSE_RADIUS) return 0;
      const push =
        (1 - dist / GRASS_SETTINGS.MOUSE_RADIUS) * GRASS_SETTINGS.MOUSE_PUSH;
      return (dx > 0 ? push : -push) + mouseRef.current.vx * 0.4;
    };

    const drawBlade = (blade: GrassBlade, time: number, globalWind: number) => {
      const layerWind =
        blade.layer === 0 ? 0.4 : blade.layer === 1 ? 0.75 : 1.1;
      const windWave =
        Math.sin(time * blade.speed * 40 + blade.phase + blade.x * 0.003) * 18 +
        Math.cos(time * 0.8 + blade.x * 0.0015) * 12 +
        globalWind * layerWind;

      const sway = (windWave + getMousePush(blade.x)) * blade.stiffness;
      const tipX = blade.x + blade.curve + sway;
      const tipY = height - blade.height;
      const ctrlX = blade.x + (blade.curve + sway) * 0.45;
      const ctrlY = height - blade.height * 0.55;
      const half = blade.baseWidth * 0.5;

      ctx.beginPath();
      ctx.moveTo(blade.x - half, height);
      ctx.quadraticCurveTo(ctrlX - half * 0.5, ctrlY, tipX, tipY);
      ctx.quadraticCurveTo(ctrlX + half * 0.5, ctrlY, blade.x + half, height);
      ctx.closePath();

      const grad = ctx.createLinearGradient(blade.x, height, tipX, tipY);
      grad.addColorStop(0, blade.color);
      grad.addColorStop(0.7, blade.color);
      grad.addColorStop(1, blade.tipColor);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const drawPollen = (time: number) => {
      pollenMotes.forEach((mote) => {
        mote.y += mote.vy;
        mote.x += mote.vx + Math.sin(time + mote.pulse) * 0.4;
        mote.pulse += 0.03;

        if (mote.y < height * 0.45) {
          mote.y = height;
          mote.x = Math.random() * width;
        }

        const alpha = mote.alpha * (0.5 + Math.sin(mote.pulse) * 0.5);
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 229, 163, ${alpha})`;
        ctx.shadowColor = "#c4e5a3";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    initBlades();
    let time = 0;

    const render = () => {
      time += GRASS_SETTINGS.TIME_STEP;
      ctx.clearRect(0, 0, width, height);
      drawSky();

      const globalWind = Math.sin(time * 0.7) * 14 + Math.sin(time * 1.4) * 8;
      blades.forEach((blade) => drawBlade(blade, time, globalWind));
      drawPollen(time);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [interactive]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ opacity: intensity }}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
};