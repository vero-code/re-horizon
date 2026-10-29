"use client";

import { HORIZON_PRESETS } from "@/constants/horizon";
import { EnergyLevel, HorizonPreset, HorizonRequest } from "@/types/horizon";
import { SparklesIcon } from "@/components/icons/HorizonIcons";

interface InputPanelProps {
  yearning: string;
  energyLevel: EnergyLevel;
  isLoading: boolean;
  onYearningChange: (value: string) => void;
  onEnergyChange: (level: EnergyLevel) => void;
  onSelectPreset: (preset: HorizonPreset) => void;
  onSubmit: (req: HorizonRequest) => void;
}

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; hint: string }[] = [
  {
    value: "minimal",
    label: "Minimal Energy",
    hint: "Short sentences, low sensory load",
  },
  {
    value: "low",
    label: "Low Energy",
    hint: "Gentle pacing, calm narrative",
  },
  {
    value: "moderate",
    label: "Moderate Energy",
    hint: "Deeper cultural context",
  },
];

export function InputPanel({
  yearning,
  energyLevel,
  isLoading,
  onYearningChange,
  onEnergyChange,
  onSelectPreset,
  onSubmit,
}: InputPanelProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearning.trim() || isLoading) return;
    onSubmit({ yearning, energyLevel });
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md">
      <div className="mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          1. Quick Sanctuary Presets (Low-Effort Input)
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {HORIZON_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectPreset(preset)}
              className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800/60 disabled:opacity-50"
            >
              <div className="font-medium text-zinc-100">{preset.label}</div>
              <div className="mt-1 line-clamp-2 text-xs text-zinc-400">
                {preset.yearning}
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="yearning-input"
            className="block text-sm font-medium text-zinc-300"
          >
            2. Describe the outside world or sensation you miss
          </label>
          <textarea
            id="yearning-input"
            rows={3}
            disabled={isLoading}
            value={yearning}
            onChange={(e) => onYearningChange(e.target.value)}
            placeholder="e.g., I am exhausted in a dark room and want to feel warm sea wind and open sky..."
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-zinc-300">
            3. Current Cognitive Energy Threshold
          </span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ENERGY_OPTIONS.map((opt) => {
              const active = energyLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onEnergyChange(opt.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-amber-400/70 bg-amber-500/10 text-zinc-100"
                      : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="mt-0.5 text-xs text-zinc-400">{opt.hint}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !yearning.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>
            {isLoading
              ? "Synthesizing Horizon via Qloo Taste Graph..."
              : "Open Horizon Sanctuary"}
          </span>
        </button>
      </form>
    </section>
  );
}