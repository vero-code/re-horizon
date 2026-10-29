"use client";

import { useEffect, useRef, useState } from "react";
import { ENERGY_OPTIONS, HORIZON_PRESETS } from "@/constants/horizon";
import { EnergyLevel, HorizonPreset, HorizonRequest } from "@/types/horizon";
import { VoiceInputRecognizer } from "@/lib/voice-input";
import {
  MicOffIcon,
  MicOnIcon,
  SparklesIcon,
} from "@/components/icons/HorizonIcons";

interface InputPanelProps {
  yearning: string;
  energyLevel: EnergyLevel;
  isLoading: boolean;
  onYearningChange: (value: string) => void;
  onEnergyChange: (level: EnergyLevel) => void;
  onSelectPreset: (preset: HorizonPreset) => void;
  onSubmit: (req: HorizonRequest) => void;
}

export function InputPanel({
  yearning,
  energyLevel,
  isLoading,
  onYearningChange,
  onEnergyChange,
  onSelectPreset,
  onSubmit,
}: InputPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognizerRef = useRef<VoiceInputRecognizer | null>(null);

  const currentEnergyIndex = Math.max(
    0,
    ENERGY_OPTIONS.findIndex((o) => o.value === energyLevel)
  );

  useEffect(() => {
    const recognizer = new VoiceInputRecognizer({
      onTranscript: (text) => {
        onYearningChange(text);
      },
      onStateChange: (listening) => {
        setIsListening(listening);
      },
      onError: (msg) => {
        setMicError(msg);
      },
    });
    recognizerRef.current = recognizer;

    return () => {
      recognizer.stop();
    };
  }, [onYearningChange]);

  const toggleMicrophone = () => {
    setMicError(null);
    if (!recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
    } else {
      recognizerRef.current.start();
    }
  };

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
          {HORIZON_PRESETS.map((preset) => {
            const isSelected = yearning === preset.yearning;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(preset)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition disabled:opacity-50 ${
                  isSelected
                    ? "border-amber-400/70 bg-amber-500/10 text-zinc-100"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/60"
                }`}
              >
                <div className="font-medium text-zinc-100">{preset.label}</div>
                <div className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {preset.yearning}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="yearning-input"
              className="block text-sm font-medium text-zinc-300"
            >
              2. Describe the outside world or sensation you miss
            </label>

            <button
              type="button"
              disabled={isLoading}
              onClick={toggleMicrophone}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                isListening
                  ? "border-red-500/70 bg-red-500/15 text-red-200"
                  : "border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-zinc-500"
              }`}
            >
              {isListening ? (
                <MicOffIcon className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <MicOnIcon className="w-3.5 h-3.5" />
              )}
              <span>
                {isListening ? "Stop Listening..." : "Speak via Microphone"}
              </span>
            </button>
          </div>

          {micError && (
            <p className="mt-1.5 text-xs text-red-300">{micError}</p>
          )}

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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="energy-slider"
              className="block text-sm font-medium text-zinc-300"
            >
              3. Current Cognitive Energy Threshold
            </label>
            <span className="text-xs font-medium text-amber-400">
              {ENERGY_OPTIONS[currentEnergyIndex]?.label}
            </span>
          </div>

          <input
            id="energy-slider"
            type="range"
            min={0}
            max={ENERGY_OPTIONS.length - 1}
            step={1}
            disabled={isLoading}
            value={currentEnergyIndex}
            onChange={(e) => {
              const nextOpt = ENERGY_OPTIONS[Number(e.target.value)];
              if (nextOpt) onEnergyChange(nextOpt.value);
            }}
            className="w-full cursor-pointer accent-amber-400"
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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