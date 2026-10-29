import { Type, Schema } from "@google/genai";
import { HorizonPreset } from "@/types/horizon";

export const HORIZON_PRESETS: HorizonPreset[] = [
  {
    id: "open-sea",
    label: "Warm Open Sea",
    yearning:
      "I feel confined within four walls and want to sense warm coastal wind, open horizon, and slow ocean rhythm.",
    defaultEnergy: "minimal",
  },
  {
    id: "pine-rain",
    label: "Pine Forest After Rain",
    yearning:
      "I need quiet grounding, the scent of wet pine needles, cool air, and soft natural light through trees.",
    defaultEnergy: "low",
  },
  {
    id: "vivid-catharsis",
    label: "Catharsis in Color",
    yearning:
      "I want to transform physical exhaustion and confinement into vivid visual warmth, resilience, and folk-inspired beauty.",
    defaultEnergy: "moderate",
  },
  {
    id: "night-sanctuary",
    label: "Quiet Night Train",
    yearning:
      "I cannot sleep in the dark and want the calm feeling of looking out a warm window at distant city lights and stars.",
    defaultEnergy: "minimal",
  },
];

export const SIGNAL_EXTRACTION_PROMPT = `You are a cultural signal translator for an isolation recovery agent.
Convert the user's emotional yearning and cognitive energy threshold into concrete, public cultural search signals for the Qloo API.
Do not infer medical diagnoses or personal data.
Provide:
1. tagQueries: exactly 3 single-word or two-word aesthetic/genre tags (e.g., "ambient", "impressionism", "meditative", "folk", "coastal").
2. anchorEntityQueries: exactly 3 well-known cultural creators or works across different mediums (1 musician/composer, 1 author/poet/book, 1 film/director) that match the mood.
3. soundscape: one of "ocean", "rain", "wind", "warm-drone".
4. lightKelvin: integer between 2200 and 5000 representing comforting room light temperature.
5. palette: array of 3 hex color strings representing the visual horizon.`;

export const SIGNAL_EXTRACTION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    tagQueries: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    anchorEntityQueries: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    soundscape: {
      type: Type.STRING,
      enum: ["ocean", "rain", "wind", "warm-drone"],
    },
    lightKelvin: {
      type: Type.INTEGER,
    },
    palette: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "tagQueries",
    "anchorEntityQueries",
    "soundscape",
    "lightKelvin",
    "palette",
  ],
};

export const NARRATIVE_SYNTHESIS_PROMPT = `You are Re:Horizon, a sensory restoration agent for people experiencing spatial or physical confinement.
Always write in English.
Keep the tone calm, grounded, and clear, without exaggeration or cliches.
Adapt paragraph length to the user's energyLevel ("minimal" = very short, effortless sentences; "low" = gentle 2-3 sentence paragraphs; "moderate" = richer cultural detail).
Reference the specific artists, books, films, and destinations returned by Qloo so the user sees genuine cultural grounding.`;

export const NARRATIVE_SYNTHESIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    paragraphs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    culturalBridge: { type: Type.STRING },
  },
  required: ["title", "paragraphs", "culturalBridge"],
};