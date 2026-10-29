"use client";

import { useEffect, useRef, useState } from "react";
import { HorizonSession, SoundscapeType } from "@/types/horizon";
import { SoundscapeEngine } from "@/lib/soundscape-engine";
import { SpeechNarrator, VoiceOption } from "@/lib/speech-narrator";
import { HorizonToolbar } from "@/components/HorizonToolbar";

interface HorizonCanvasProps {
  session: HorizonSession;
}

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

  const [c1, c2, c3] = palette.map(normalizeHex) as [string, string, string];
  const [activeSoundscape, setActiveSoundscape] =
    useState<SoundscapeType>(initialSoundscape);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const engineRef = useRef<SoundscapeEngine | null>(null);
  const narratorRef = useRef<SpeechNarrator | null>(null);

  useEffect(() => {
    setActiveSoundscape(initialSoundscape);
  }, [initialSoundscape]);

  useEffect(() => {
    const engine = new SoundscapeEngine();
    const narrator = new SpeechNarrator(
      (speaking) => {
        setIsSpeaking(speaking);
        engine.setDucking(speaking);
      },
      (loadedVoices, defaultUri) => {
        setVoices(loadedVoices);
        setSelectedVoiceUri((prev) => prev || defaultUri);
      }
    );

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

  const handleVoiceChange = (nextUri: string) => {
    setSelectedVoiceUri(nextUri);
    if (isSpeaking && narratorRef.current) {
      narratorRef.current.speakNarrative(narrative, nextUri);
    }
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
      narratorRef.current.speakNarrative(narrative, selectedVoiceUri);
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
      <HorizonToolbar
        lightKelvin={lightKelvin}
        colors={[c1, c2, c3]}
        activeSoundscape={activeSoundscape}
        isAudioActive={isAudioActive}
        volume={volume}
        voices={voices}
        selectedVoiceUri={selectedVoiceUri}
        isSpeaking={isSpeaking}
        isExpanded={isExpanded}
        onTextureChange={handleTextureChange}
        onToggleAudio={toggleAudio}
        onVolumeChange={handleVolumeChange}
        onVoiceChange={handleVoiceChange}
        onToggleNarration={toggleNarration}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
      />

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