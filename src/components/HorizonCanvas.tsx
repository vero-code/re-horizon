"use client";

import { useEffect, useRef, useState } from "react";
import { HorizonSession, SoundscapeType } from "@/types/horizon";
import { SoundscapeEngine } from "@/lib/soundscape-engine";
import { SpeechNarrator } from "@/lib/speech-narrator";
import {
  CollapseIcon,
  ExpandIcon,
  SunIcon,
  VoiceStartIcon,
  VoiceStopIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from "@/components/icons/HorizonIcons";

interface HorizonCanvasProps {
  session: HorizonSession;
}

const SOUNDSCAPE_LABELS: { value: SoundscapeType; label: string }[] = [
  { value: "ocean", label: "Sound: Ocean Waves" },
  { value: "rain", label: "Sound: Forest Rain" },
  { value: "wind", label: "Sound: Open Wind" },
  { value: "warm-drone", label: "Sound: Warm Harmonic Pad" },
];

function normalizeHex(color: string): string {
  const clean = color.trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(clean) || /^[0-9A-Fa-f]{3}$/.test(clean)) {
    return `#${clean}`;
  }
  return "#38bdf8";
}

export function HorizonCanvas({ session }: HorizonCanvasProps) {
  const { narrative, signals } = session;
  const { palette, lightKelvin, soundscape: initialSoundscape } =
    signals.extracted;

  const [c1, c2, c3] = palette.map(normalizeHex);
  const [activeSoundscape, setActiveSoundscape] =
    useState<SoundscapeType>(initialSoundscape);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const engineRef = useRef<SoundscapeEngine | null>(null);
  const narratorRef = useRef<SpeechNarrator | null>(null);

  useEffect(() => {
    setActiveSoundscape(initialSoundscape);
  }, [initialSoundscape]);

  useEffect(() => {
    const engine = new SoundscapeEngine();
    const narrator = new SpeechNarrator((speaking) => {
      setIsSpeaking(speaking);
      engine.setDucking(speaking);
    });

    engineRef.current = engine;
    narratorRef.current = narrator;

    return () => {
      engine.stop();
      narrator.stop();
    };
  }, []);

  const handleTextureChange = (nextType: SoundscapeType) => {
    setActiveSoundscape(nextType);
    if (engineRef.current) {
      engineRef.current.start(nextType, volume);
      setIsAudioActive(true);
    }
  };

  const toggleAudio = () => {
    if (!engineRef.current) return;
    if (isAudioActive) {
      engineRef.current.stop();
      setIsAudioActive(false);
    } else {
      engineRef.current.start(activeSoundscape, volume);
      setIsAudioActive(true);
    }
  };

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    engineRef.current?.setVolume(nextVolume);
    narratorRef.current?.setVolume(nextVolume);
  };

  const toggleNarration = () => {
    if (!narratorRef.current) return;
    if (isSpeaking) {
      narratorRef.current.stop();
    } else {
      if (!isAudioActive && engineRef.current) {
        engineRef.current.start(activeSoundscape, volume);
        setIsAudioActive(true);
      }
      narratorRef.current.setVolume(volume);
      narratorRef.current.speakNarrative(narrative);
    }
  };

  return (
    <section
      className={
        isExpanded
          ? "fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-zinc-950 p-6 sm:p-12"
          : "relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-10"
      }
      style={{
        backgroundColor: "#09090b",
        backgroundImage: isExpanded
          ? `radial-gradient(circle at 20% 25%, ${c1}88 0%, transparent 60%), radial-gradient(circle at 80% 75%, ${c2}88 0%, transparent 65%), radial-gradient(circle at 50% 50%, ${c3}55 0%, #09090b 100%)`
          : `radial-gradient(circle at 20% 20%, ${c1}44 0%, transparent 55%), radial-gradient(circle at 80% 75%, ${c2}44 0%, transparent 60%), linear-gradient(135deg, #09090b 0%, ${c3}33 100%)`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-zinc-200">
            <SunIcon className="w-3.5 h-3.5" />
            <span>Room Light Target: {lightKelvin}K</span>
          </span>
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-zinc-200">
            <span>Palette:</span>
            {[c1, c2, c3].map((hex, idx) => (
              <span
                key={`${hex}-${idx}`}
                title={hex}
                className="inline-block h-3.5 w-3.5 rounded-full border border-white/30"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Soundscape Texture"
            value={activeSoundscape}
            onChange={(e) =>
              handleTextureChange(e.target.value as SoundscapeType)
            }
            className="rounded-xl border border-white/15 bg-black/60 px-2.5 py-2 text-xs text-zinc-200 focus:outline-none"
          >
            {SOUNDSCAPE_LABELS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900">
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={toggleAudio}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-xs font-medium text-zinc-100 transition hover:bg-black/70"
          >
            {isAudioActive ? (
              <VolumeOnIcon className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeOffIcon className="w-4 h-4" />
            )}
            <span>{isAudioActive ? "Stop Soundscape" : "Start Soundscape"}</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-3 py-1.5">
            <span className="text-[11px] text-zinc-300">
              Vol {Math.round(volume * 100)}%
            </span>
            <input
              type="range"
              aria-label="Audio Volume"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 cursor-pointer accent-zinc-200"
            />
          </div>

          <button
            type="button"
            onClick={toggleNarration}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-xs font-medium text-zinc-100 transition hover:bg-black/70"
          >
            {isSpeaking ? (
              <VoiceStopIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <VoiceStartIcon className="w-4 h-4" />
            )}
            <span>
              {isSpeaking ? "Stop Voice Guide" : "Eyes-Closed Voice Guide"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-xs font-medium text-zinc-100 transition hover:bg-black/70"
          >
            {isExpanded ? (
              <CollapseIcon className="w-4 h-4" />
            ) : (
              <ExpandIcon className="w-4 h-4" />
            )}
            <span>{isExpanded ? "Exit Full Window" : "Ambient Room Mode"}</span>
          </button>
        </div>
      </div>

      <div className="my-8 max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {narrative.title}
        </h2>

        <div className="space-y-3 text-base leading-relaxed text-zinc-100 sm:text-lg">
          {narrative.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/45 p-4 backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Qloo Cultural Bridge
        </div>
        <p className="mt-1 text-sm leading-relaxed text-zinc-200">
          {narrative.culturalBridge}
        </p>
      </div>
    </section>
  );
}