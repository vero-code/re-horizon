"use client";

import { useState } from "react";
import { HorizonSession } from "@/types/horizon";
import { TraceIcon } from "@/components/icons/HorizonIcons";

interface TraceLogPanelProps {
  session: HorizonSession;
}

export function TraceLogPanel({ session }: TraceLogPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { signals, traceLog } = session;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TraceIcon className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">
            Qloo Request-to-Result Provenance ({traceLog.length} API Calls)
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
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5">
              <div className="text-xs font-medium text-zinc-400">
                Resolved Qloo Tag Signals (/v2/tags)
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {signals.resolvedTags.map((t) => (
                  <span
                    key={t.id}
                    className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-200"
                  >
                    {t.name}: {t.id}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5">
              <div className="text-xs font-medium text-zinc-400">
                Resolved Qloo Entity Signals (/search)
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {signals.resolvedEntities.map((e) => (
                  <span
                    key={e.entity_id}
                    className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-200"
                  >
                    {e.name} ({e.entity_id.slice(0, 8)}...)
                  </span>
                ))}
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