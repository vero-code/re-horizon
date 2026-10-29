"use client";

import React, { useEffect, useRef } from "react";
import {
  GrassBlade,
  PollenMote,
  SwayingGrassBackgroundProps,
} from "@/types/grass";

const GRASS_PALETTE = {
  bg: ["#122316", "#162c1d", "#1b3423"],
  mid: ["#22432c", "#2c5438", "#386644"],
  fg: ["#3e734c", "#4b8b5c", "#5fa873"],
  tips: ["#88c273", "#a7d489", "#c4e5a3", "#d9e08d"],
};

export const SwayingGrassBackground: React.FC<SwayingGrassBackgroundProps> = ({
  intensity = 0.85,
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
      const density = Math.floor(width / 3.5);

      for (let i = 0; i < density; i++) {
        const layer = Math.random() < 0.35 ? 0 : Math.random() < 0.7 ? 1 : 2;
        const x = (i / density) * width + (Math.random() - 0.5) * 8;
        const layerHeightFactor =
          layer === 0 ? 0.65 : layer === 1 ? 0.85 : 1.05;
        const baseHeight =
          (height * 0.28 + Math.random() * (height * 0.22)) * layerHeightFactor;

        let col =
          GRASS_PALETTE.fg[Math.floor(Math.random() * GRASS_PALETTE.fg.length)];
        if (layer === 0) {
          col =
            GRASS_PALETTE.bg[
              Math.floor(Math.random() * GRASS_PALETTE.bg.length)
            ];
        } else if (layer === 1) {
          col =
            GRASS_PALETTE.mid[
              Math.floor(Math.random() * GRASS_PALETTE.mid.length)
            ];
        }

        const tipCol =
          GRASS_PALETTE.tips[
            Math.floor(Math.random() * GRASS_PALETTE.tips.length)
          ];

        blades.push({
          x,
          height: baseHeight,
          baseWidth: layer === 0 ? 2 : layer === 1 ? 3 : 4.5,
          curve: (Math.random() - 0.5) * 20,
          speed: 0.015 + Math.random() * 0.018,
          phase: Math.random() * Math.PI * 2,
          stiffness: 0.85 + Math.random() * 0.4,
          hasSpike: false,
          spikeLength: 14 + Math.random() * 18,
          layer,
          color: col,
          tipColor: tipCol,
        });
      }

      blades.sort((a, b) => a.layer - b.layer);

      pollenMotes.length = 0;
      for (let p = 0; p < 36; p++) {
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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBlades();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const vx = e.clientX - mouseRef.current.lastX;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        vx: Math.max(-25, Math.min(25, vx)),
        lastX: e.clientX,
        active: true,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const vx = touch.clientX - mouseRef.current.lastX;
        mouseRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          vx: Math.max(-25, Math.min(25, vx)),
          lastX: touch.clientX,
          active: true,
        };
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

    initBlades();
    let time = 0;

    const render = () => {
      time += 0.022;
      ctx.clearRect(0, 0, width, height);

      const globalWind = Math.sin(time * 0.7) * 14 + Math.sin(time * 1.4) * 8;

      const floorGrad = ctx.createLinearGradient(
        0,
        height - height * 0.35,
        0,
        height
      );
      floorGrad.addColorStop(0, "rgba(8, 18, 11, 0)");
      floorGrad.addColorStop(0.5, "rgba(10, 24, 14, 0.45)");
      floorGrad.addColorStop(1, "rgba(5, 12, 7, 0.9)");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, height - height * 0.35, width, height * 0.35);

      blades.forEach((blade) => {
        const windWave =
          Math.sin(time * blade.speed * 40 + blade.phase + blade.x * 0.003) *
            18 +
          Math.cos(time * 0.8 + blade.x * 0.0015) * 12 +
          globalWind *
            (blade.layer === 0 ? 0.4 : blade.layer === 1 ? 0.75 : 1.1);

        let mouseDisturbance = 0;
        if (mouseRef.current.active) {
          const dx = blade.x - mouseRef.current.x;
          const dy = height - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;
          if (dist < maxDist) {
            const push = (1 - dist / maxDist) * 35;
            mouseDisturbance =
              (dx > 0 ? push : -push) + mouseRef.current.vx * 0.4;
          }
        }

        const sway = (windWave + mouseDisturbance) * blade.stiffness;
        const tipX = blade.x + blade.curve + sway;
        const tipY = height - blade.height;
        const ctrlX = blade.x + (blade.curve + sway) * 0.45;
        const ctrlY = height - blade.height * 0.55;

        ctx.beginPath();
        ctx.moveTo(blade.x - blade.baseWidth * 0.5, height);
        ctx.quadraticCurveTo(
          ctrlX - blade.baseWidth * 0.25,
          ctrlY,
          tipX,
          tipY
        );
        ctx.quadraticCurveTo(
          ctrlX + blade.baseWidth * 0.25,
          ctrlY,
          blade.x + blade.baseWidth * 0.5,
          height
        );
        ctx.closePath();

        const bladeGrad = ctx.createLinearGradient(
          blade.x,
          height,
          tipX,
          tipY
        );
        bladeGrad.addColorStop(0, blade.color);
        bladeGrad.addColorStop(0.7, blade.color);
        bladeGrad.addColorStop(1, blade.tipColor);

        ctx.fillStyle = bladeGrad;
        ctx.fill();

        if (blade.hasSpike) {
          ctx.save();
          ctx.translate(tipX, tipY);
          const angle = Math.atan2(tipY - ctrlY, tipX - ctrlX);
          ctx.rotate(angle);

          const spikeGrad = ctx.createLinearGradient(0, 0, blade.spikeLength, 0);
          spikeGrad.addColorStop(0, blade.tipColor);
          spikeGrad.addColorStop(1, "#e5efa0");

          ctx.fillStyle = spikeGrad;
          ctx.beginPath();
          ctx.ellipse(
            blade.spikeLength * 0.5,
            0,
            blade.spikeLength * 0.5,
            blade.baseWidth * 0.8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.strokeStyle = "rgba(229, 239, 160, 0.45)";
          ctx.lineWidth = 0.8;
          for (let h = 4; h < blade.spikeLength; h += 4) {
            ctx.beginPath();
            ctx.moveTo(h, 0);
            ctx.lineTo(h + 6, -5);
            ctx.moveTo(h, 0);
            ctx.lineTo(h + 6, 5);
            ctx.stroke();
          }

          ctx.restore();
        }
      });

      pollenMotes.forEach((mote) => {
        mote.y += mote.vy;
        mote.x += mote.vx + Math.sin(time + mote.pulse) * 0.4;
        mote.pulse += 0.03;

        if (mote.y < height - height * 0.55) {
          mote.y = height;
          mote.x = Math.random() * width;
        }

        const currentAlpha = mote.alpha * (0.5 + Math.sin(mote.pulse) * 0.5);
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 229, 163, ${currentAlpha})`;
        ctx.shadowColor = "#c4e5a3";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

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
      style={{ opacity: intensity }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
};