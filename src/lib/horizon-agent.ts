import { GoogleGenAI } from "@google/genai";
import {
  NARRATIVE_SYNTHESIS_PROMPT,
  NARRATIVE_SYNTHESIS_SCHEMA,
  SIGNAL_EXTRACTION_PROMPT,
  SIGNAL_EXTRACTION_SCHEMA,
} from "@/constants/horizon";
import {
  findQlooTags,
  getQlooInsights,
  searchQlooEntities,
} from "@/lib/qloo";
import {
  HorizonNarrative,
  HorizonRequest,
  HorizonSession,
  ExtractedSignals,
} from "@/types/horizon";
import { QlooEntity, QlooTag, QlooTraceStep } from "@/types/qloo";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

function getModelName(): string {
  const model = process.env.GEMINI_MODEL;
  if (!model) {
    throw new Error("Missing GEMINI_MODEL in environment variables");
  }
  return model;
}

// Step 1: Translate user yearning into Qloo search signals
async function extractCulturalSignals(
  ai: GoogleGenAI,
  request: HorizonRequest
): Promise<ExtractedSignals> {
  const response = await ai.models.generateContent({
    model: getModelName(),
    contents: `${SIGNAL_EXTRACTION_PROMPT}\n\nUser yearning: "${request.yearning}"\nCognitive energy level: "${request.energyLevel}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: SIGNAL_EXTRACTION_SCHEMA,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response during signal extraction");
  }

  return JSON.parse(response.text) as ExtractedSignals;
}

// Step 2: Synthesize restorative narrative from Qloo entities
async function synthesizeNarrative(
  ai: GoogleGenAI,
  request: HorizonRequest,
  artists: QlooEntity[],
  books: QlooEntity[],
  movies: QlooEntity[],
  destinations: QlooEntity[]
): Promise<HorizonNarrative> {
  const qlooSummary = JSON.stringify({
    artists: artists.map((a) => ({ name: a.name, tags: a.tags })),
    books: books.map((b) => ({ name: b.name, description: b.description })),
    movies: movies.map((m) => ({ name: m.name, description: m.description })),
    destinations: destinations.map((d) => ({ name: d.name })),
  });

  const response = await ai.models.generateContent({
    model: getModelName(),
    contents: `${NARRATIVE_SYNTHESIS_PROMPT}\n\nUser yearning: "${request.yearning}"\nEnergy level: "${request.energyLevel}"\nQloo Taste Graph matches: ${qlooSummary}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: NARRATIVE_SYNTHESIS_SCHEMA,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response during narrative synthesis");
  }

  return JSON.parse(response.text) as HorizonNarrative;
}

export async function buildHorizonSession(
  request: HorizonRequest
): Promise<HorizonSession> {
  const ai = getGeminiClient();
  const traceLog: QlooTraceStep[] = [];

  // 1. Extract search signals via Gemini
  const extracted = await extractCulturalSignals(ai, request);

  // 2. Resolve tags and anchor entities in Qloo
  const tagResults = await Promise.all(
    extracted.tagQueries.slice(0, 3).map((q) => findQlooTags(q, 2, traceLog))
  );
  const entityResults = await Promise.all(
    extracted.anchorEntityQueries
      .slice(0, 3)
      .map((q) => searchQlooEntities(q, 1, traceLog))
  );

  const resolvedTags: QlooTag[] = tagResults.flat();
  const resolvedEntities: QlooEntity[] = entityResults.flat();

  const defaultTagIds = Array.from(new Set(resolvedTags.map((t) => t.id))).slice(
    0,
    5
  );
  const defaultEntityIds = Array.from(
    new Set(resolvedEntities.map((e) => e.entity_id))
  ).slice(0, 5);

  const hasCustomSelection =
    Array.isArray(request.activeTagIds) ||
    Array.isArray(request.activeEntityIds);

  const tagIds = hasCustomSelection
    ? (request.activeTagIds || []).slice(0, 5)
    : defaultTagIds;
  const entityIds = hasCustomSelection
    ? (request.activeEntityIds || []).slice(0, 5)
    : defaultEntityIds;

  if (tagIds.length === 0 && entityIds.length === 0) {
    throw new Error(
      "At least one Qloo tag or anchor entity must be active to query insights."
    );
  }

  // 3. Query Qloo cross-domain insights
  const [artists, books, movies, destinations] = await Promise.all([
    getQlooInsights({
      filterType: "urn:entity:artist",
      tagIds,
      entityIds,
      take: 3,
      traceLog,
    }),
    getQlooInsights({
      filterType: "urn:entity:book",
      tagIds,
      entityIds,
      take: 3,
      traceLog,
    }),
    getQlooInsights({
      filterType: "urn:entity:movie",
      tagIds,
      entityIds,
      take: 3,
      traceLog,
    }),
    getQlooInsights({
      filterType: "urn:entity:destination",
      tagIds,
      entityIds,
      take: 3,
      traceLog,
    }),
  ]);

  // 4. Synthesize session narrative grounded in Qloo results
  const narrative = await synthesizeNarrative(
    ai,
    request,
    artists,
    books,
    movies,
    destinations
  );

  return {
    request,
    signals: {
      extracted,
      resolvedTags,
      resolvedEntities,
      activeTagIds: tagIds,
      activeEntityIds: entityIds,
    },
    narrative,
    recommendations: {
      artists,
      books,
      movies,
      destinations,
    },
    traceLog,
  };
}