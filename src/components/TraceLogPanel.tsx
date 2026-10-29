"use client";

import { useEffect, useState } from "react";
import { HorizonSession } from "@/types/horizon";
import { SparklesIcon, TraceIcon } from "@/components/icons/HorizonIcons";

interface TraceLogPanelProps {
  session: HorizonSession;
  isLoading: boolean;
  onRefineSignals: (tagIds: string[], entityIds: string[]) => void;
}

export function TraceLogPanel({
  session,
  isLoading,
  onRefineSignals,
}: TraceLogPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { signals, traceLog, recommendations } = session;

  const [selectedTags, setSelectedTags] = useState<string[]>(
    signals.activeTagIds
  );
  const [selectedEntities, setSelectedEntities] = useState<string[]>(
    signals.activeEntityIds
  );

  useEffect(() => {
    setSelectedTags(signals.activeTagIds);
    setSelectedEntities(signals.activeEntityIds);
  }, [signals.activeTagIds, signals.activeEntityIds]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleEntity = (id: string) => {
    setSelectedEntities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const canRefine =
    !isLoading && (selectedTags.length > 0 || selectedEntities.length > 0);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TraceIcon className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">
            Qloo Taste Graph & Provenance ({traceLog.length} API Calls)
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-xs font-medium text-zinc-400 underline hover:text-zinc-200"
        >
          {isOpen ? "Hide Trace" : "Show Trace"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-[11px] uppercase text-zinc-500">
                1. User Input
              </div>
              <div className="mt-1 text-xs font-medium text-zinc-200">
                Energy: {session.request.energyLevel}
              </div>
              <div className="mt-0.5 line-clamp-2 text-[11px] text-zinc-400">
                {session.request.yearning}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-[11px] uppercase text-zinc-500">
                2. Extracted Concepts
              </div>
              <div className="mt-1 text-xs font-medium text-zinc-200">
                {signals.extracted.tagQueries.join(", ")}
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400">
                Anchors: {signals.extracted.anchorEntityQueries.join(", ")}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-[11px] uppercase text-zinc-500">
                3. Active Qloo Signals
              </div>
              <div className="mt-1 text-xs font-medium text-emerald-400">
                {selectedTags.length} Tags, {selectedEntities.length} Entities
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400">
                Validated via /v2/tags and /search
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-[11px] uppercase text-zinc-500">
                4. Cross-Domain Output
              </div>
              <div className="mt-1 text-xs font-medium text-zinc-200">
                {recommendations.artists.length +
                  recommendations.books.length +
                  recommendations.movies.length +
                  recommendations.destinations.length}{" "}
                Matched Entities
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400">
                Artists, Books, Movies, Destinations
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Interactive Signal Refinement
                </h3>
                <p className="text-xs text-zinc-400">
                  Toggle resolved Qloo tags or anchor entities below to test how
                  specific signals shape the cross-domain insights.
                </p>
              </div>
              <button
                type="button"
                disabled={!canRefine}
                onClick={() => onRefineSignals(selectedTags, selectedEntities)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-40"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Re-synthesize with Selected Signals</span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-zinc-400">
                  Resolved Qloo Tag Signals (/v2/tags)
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {signals.resolvedTags.map((t) => {
                    const active = selectedTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`rounded border px-2.5 py-1 font-mono text-xs transition ${
                          active
                            ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-200"
                            : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        {t.name} ({t.id})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-zinc-400">
                  Resolved Qloo Entity Signals (/search)
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {signals.resolvedEntities.map((e) => {
                    const active = selectedEntities.includes(e.entity_id);
                    return (
                      <button
                        key={e.entity_id}
                        type="button"
                        onClick={() => toggleEntity(e.entity_id)}
                        className={`rounded border px-2.5 py-1 font-mono text-xs transition ${
                          active
                            ? "border-amber-500/70 bg-amber-500/15 text-amber-200"
                            : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        {e.name} ({e.entity_id.slice(0, 8)}...)
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-3 py-2">Step</th>
                  <th className="px-3 py-2">Endpoint</th>
                  <th className="px-3 py-2">Query Parameters</th>
                  <th className="px-3 py-2">Matches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {traceLog.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 font-medium text-zinc-200">
                      {entry.step}
                    </td>
                    <td className="px-3 py-2 font-mono text-emerald-400">
                      {entry.endpoint} ({entry.status})
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-zinc-400">
                      {Object.entries(entry.params)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(" | ")}
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      {entry.sampleMatches.join(", ") || "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}