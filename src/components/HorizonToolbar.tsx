"use client";

import { SOUNDSCAPE_LABELS } from "@/constants/horizon";
import { SoundscapeType } from "@/types/horizon";
import { VoiceOption } from "@/lib/speech-narrator";
import {
  CollapseIcon,
  ExpandIcon,
  SunIcon,
  VoiceStartIcon,
  VoiceStopIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from "@/components/icons/HorizonIcons";

interface HorizonToolbarProps {
  lightKelvin: number;
  colors: [string, string, string];
  activeSoundscape: SoundscapeType;
  isAudioActive: boolean;
  volume: number;
  voices: VoiceOption[];
  selectedVoiceUri: string;
  isSpeaking: boolean;
  isExpanded: boolean;
  onTextureChange: (type: SoundscapeType) => void;
  onToggleAudio: () => void;
  onVolumeChange: (volume: number) => void;
  onVoiceChange: (uri: string) => void;
  onToggleNarration: () => void;
  onToggleExpand: () => void;
}

export function HorizonToolbar({
  lightKelvin,
  colors,
  activeSoundscape,
  isAudioActive,
  volume,
  voices,
  selectedVoiceUri,
  isSpeaking,
  isExpanded,
  onTextureChange,
  onToggleAudio,
  onVolumeChange,
  onVoiceChange,
  onToggleNarration,
  onToggleExpand,
}: HorizonToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-zinc-200">
          <SunIcon className="w-3.5 h-3.5" />
          <span>Room Light Target: {lightKelvin}K</span>
        </span>
        <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-zinc-200">
          <span>Palette:</span>
          {colors.map((hex, idx) => (
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
          onChange={(e) => onTextureChange(e.target.value as SoundscapeType)}
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
          onClick={onToggleAudio}
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
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-20 cursor-pointer accent-zinc-200"
          />
        </div>

        {voices.length > 0 && (
          <select
            aria-label="Narrator Voice"
            value={selectedVoiceUri}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="max-w-[180px] truncate rounded-xl border border-white/15 bg-black/60 px-2.5 py-2 text-xs text-zinc-200 focus:outline-none"
          >
            {voices.map((v) => (
              <option
                key={v.voiceURI}
                value={v.voiceURI}
                className="bg-zinc-900"
              >
                Voice: {v.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={onToggleNarration}
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
          onClick={onToggleExpand}
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
  );
}