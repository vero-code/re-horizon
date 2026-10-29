"use client";

import { useState } from "react";
import { HORIZON_PRESETS } from "@/constants/horizon";
import {
  EnergyLevel,
  HorizonPreset,
  HorizonRequest,
  HorizonSession,
} from "@/types/horizon";
import { InputPanel } from "@/components/InputPanel";
import { HorizonCanvas } from "@/components/HorizonCanvas";
import { RecommendationsGrid } from "@/components/RecommendationsGrid";
import { TraceLogPanel } from "@/components/TraceLogPanel";

export default function HomePage() {
  const [yearning, setYearning] = useState<string>(HORIZON_PRESETS[0].yearning);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(
    HORIZON_PRESETS[0].defaultEnergy
  );
  const [session, setSession] = useState<HorizonSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (preset: HorizonPreset) => {
    setYearning(preset.yearning);
    setEnergyLevel(preset.defaultEnergy);
    setError(null);
  };

  const handleSubmit = async (req: HorizonRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/horizon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      setSession(data as HorizonSession);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineSignals = (
    activeTagIds: string[],
    activeEntityIds: string[]
  ) => {
    if (!session) return;
    handleSubmit({
      yearning: session.request.yearning,
      energyLevel: session.request.energyLevel,
      activeTagIds,
      activeEntityIds,
      previousSignals: {
        extracted: session.signals.extracted,
        resolvedTags: session.signals.resolvedTags,
        resolvedEntities: session.signals.resolvedEntities,
      },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-2 border-b border-zinc-800 pb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Qloo Agentic Hackathon
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Re:Horizon
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Sensory decompression and cultural sanctuary agent for individuals
            experiencing physical, medical, or spatial confinement. Powered by
            Qloo Taste Graph v2 and Google Gemini.
          </p>
        </header>

        <InputPanel
          yearning={yearning}
          energyLevel={energyLevel}
          isLoading={isLoading}
          onYearningChange={setYearning}
          onEnergyChange={setEnergyLevel}
          onSelectPreset={handleSelectPreset}
          onSubmit={handleSubmit}
        />

        {error && (
          <div className="rounded-xl border border-red-900/70 bg-red-950/40 p-4 text-sm text-red-200">
            <div className="font-semibold">Unable to build Horizon Session</div>
            <p className="mt-1 text-xs text-red-300">{error}</p>
          </div>
        )}

        {session && (
          <div className="space-y-8">
            <HorizonCanvas
              key={`canvas-${session.narrative.title}`}
              session={session}
            />
            <RecommendationsGrid recommendations={session.recommendations} />
            <TraceLogPanel
              key={`trace-${session.signals.activeTagIds.join(",")}-${session.signals.activeEntityIds.join(",")}`}
              session={session}
              isLoading={isLoading}
              onRefineSignals={handleRefineSignals}
            />
          </div>
        )}
      </main>
    </div>
  );
}