import { QlooEntity, QlooTag, QlooTraceStep } from "@/types/qloo";

export type EnergyLevel = "minimal" | "low" | "moderate";

export type SoundscapeType = "ocean" | "rain" | "wind" | "warm-drone";

export interface HorizonRequest {
  yearning: string;
  energyLevel: EnergyLevel;
  activeTagIds?: string[];
  activeEntityIds?: string[];
  previousSignals?: {
    extracted: ExtractedSignals;
    resolvedTags: QlooTag[];
    resolvedEntities: QlooEntity[];
  };
}

export interface ExtractedSignals {
  tagQueries: string[];
  anchorEntityQueries: string[];
  soundscape: SoundscapeType;
  lightKelvin: number;
  palette: [string, string, string];
}

export interface HorizonNarrative {
  title: string;
  paragraphs: string[];
  culturalBridge: string;
}

export interface HorizonRecommendations {
  artists: QlooEntity[];
  books: QlooEntity[];
  movies: QlooEntity[];
  destinations: QlooEntity[];
}

export interface HorizonSession {
  request: HorizonRequest;
  signals: {
    extracted: ExtractedSignals;
    resolvedTags: QlooTag[];
    resolvedEntities: QlooEntity[];
    activeTagIds: string[];
    activeEntityIds: string[];
  };
  narrative: HorizonNarrative;
  recommendations: HorizonRecommendations;
  traceLog: QlooTraceStep[];
}

export interface HorizonPreset {
  id: string;
  label: string;
  yearning: string;
  defaultEnergy: EnergyLevel;
}