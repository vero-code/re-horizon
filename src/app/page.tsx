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
import { SwayingGrassBackground } from "@/components/SwayingGrassBackground";
import Image from "next/image";

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
    <div className="relative text-zinc-100">
      <SwayingGrassBackground intensity={0.85} interactive={true} />
      <main className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                <header className="flex flex-col items-center text-center space-y-2 pb-4">
          <div className="flex items-center justify-center gap-3">
            {/* <Image
              src="/logo.png"
              alt="Re:Horizon logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
            /> */}
            <h1 className="flex items-center gap-2.5 text-3xl font-light tracking-wider text-zinc-100">
              <span>Re</span>
              <span
                className="inline-block h-7 w-[2px] bg-gradient-to-b from-transparent via-amber-300 to-transparent shadow-[0_0_12px_#fbbf24]"
                aria-hidden="true"
              />
              <span className="font-semibold text-white">Horizon</span>
            </h1>
          </div>

          <p className="tracking-[0.24em] uppercase text-xs text-amber-200/80">
            Sensory Recovery Beyond 4 Walls · Powered by Qloo
          </p>

          <div className="w-full max-w-2xl pt-2">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          </div>
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