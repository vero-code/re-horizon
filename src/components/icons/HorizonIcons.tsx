import {
  BookOpen,
  Compass,
  Film,
  Headphones,
  Maximize2,
  Minimize2,
  Music,
  Sparkles,
  Square,
  Sun,
  Terminal,
  Volume2,
  VolumeX,
} from "lucide-react";

interface IconProps {
  className?: string;
}

export function SunIcon({ className = "w-4 h-4" }: IconProps) {
  return <Sun className={className} />;
}

export function SparklesIcon({ className = "w-4 h-4" }: IconProps) {
  return <Sparkles className={className} />;
}

export function VolumeOnIcon({ className = "w-4 h-4" }: IconProps) {
  return <Volume2 className={className} />;
}

export function VolumeOffIcon({ className = "w-4 h-4" }: IconProps) {
  return <VolumeX className={className} />;
}

export function ExpandIcon({ className = "w-4 h-4" }: IconProps) {
  return <Maximize2 className={className} />;
}

export function CollapseIcon({ className = "w-4 h-4" }: IconProps) {
  return <Minimize2 className={className} />;
}

export function ArtistIcon({ className = "w-4 h-4" }: IconProps) {
  return <Music className={className} />;
}

export function BookIcon({ className = "w-4 h-4" }: IconProps) {
  return <BookOpen className={className} />;
}

export function MovieIcon({ className = "w-4 h-4" }: IconProps) {
  return <Film className={className} />;
}

export function DestinationIcon({ className = "w-4 h-4" }: IconProps) {
  return <Compass className={className} />;
}

export function TraceIcon({ className = "w-4 h-4" }: IconProps) {
  return <Terminal className={className} />;
}

export function VoiceStartIcon({ className = "w-4 h-4" }: IconProps) {
  return <Headphones className={className} />;
}

export function VoiceStopIcon({ className = "w-4 h-4" }: IconProps) {
  return <Square className={className} />;
}