import { QLOO_DEFAULTS, QLOO_ENDPOINTS } from "@/constants/qloo";
import {
  QlooEntity,
  QlooInsightsOptions,
  QlooTag,
  QlooTraceStep,
} from "@/types/qloo";

function getBaseUrl(): string {
  const baseUrl = process.env.QLOO_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing QLOO_BASE_URL in environment variables");
  }
  return baseUrl.replace(/\/$/, "");
}

function getApiKey(): string {
  const key = process.env.QLOO_API_KEY;
  if (!key) {
    throw new Error("Missing QLOO_API_KEY in environment variables");
  }
  return key;
}

async function qlooFetch(
  path: string,
  params: Record<string, string | number | undefined>
) {
  const url = new URL(`${getBaseUrl()}${path}`);
  const cleanParams: Record<string, string> = {};

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") {
      const strVal = String(v);
      url.searchParams.set(k, strVal);
      cleanParams[k] = strVal;
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Api-Key": getApiKey(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Qloo API error (${response.status}) on ${path}: ${JSON.stringify(data)}`
    );
  }

  return { data, status: response.status, cleanParams };
}

// Search for valid Qloo tag IDs by keyword
export async function findQlooTags(
  query: string,
  take: number = QLOO_DEFAULTS.TAGS_LIMIT,
  traceLog?: QlooTraceStep[]
): Promise<QlooTag[]> {
  const { data, status, cleanParams } = await qlooFetch(QLOO_ENDPOINTS.TAGS, {
    "filter.query": query,
    take,
  });

  const rawTags: Record<string, unknown>[] =
    data?.results?.tags || data?.results || data?.tags || [];

  const parsed: QlooTag[] = (Array.isArray(rawTags) ? rawTags : [])
    .map((t) => ({
      id: String(t.tag_id || t.id || ""),
      name: String(t.name || t.value || query),
      type: t.type ? String(t.type) : undefined,
    }))
    .filter((t) => t.id.length > 0);

  if (traceLog) {
    traceLog.push({
      step: `Resolve Tag: "${query}"`,
      endpoint: `GET ${QLOO_ENDPOINTS.TAGS}`,
      params: cleanParams,
      status,
      resultCount: parsed.length,
      sampleMatches: parsed.slice(0, 3).map((t) => `${t.name} (${t.id})`),
    });
  }

  return parsed;
}

// Search for Qloo entities by name
export async function searchQlooEntities(
  query: string,
  take: number = QLOO_DEFAULTS.SEARCH_LIMIT,
  traceLog?: QlooTraceStep[]
): Promise<QlooEntity[]> {
  const { data, status, cleanParams } = await qlooFetch(QLOO_ENDPOINTS.SEARCH, {
    query,
    take,
  });

  const rawEntities: Record<string, unknown>[] =
    data?.results || data?.entities || [];

  const parsed = (Array.isArray(rawEntities) ? rawEntities : [])
    .map(normalizeEntity)
    .filter((e) => e.entity_id.length > 0);

  if (traceLog) {
    traceLog.push({
      step: `Search Anchor Entity: "${query}"`,
      endpoint: `GET ${QLOO_ENDPOINTS.SEARCH}`,
      params: cleanParams,
      status,
      resultCount: parsed.length,
      sampleMatches: parsed.slice(0, 3).map((e) => `${e.name} (${e.entity_id})`),
    });
  }

  return parsed;
}

// Obtain recommendations and cultural connections
export async function getQlooInsights(
  options: QlooInsightsOptions
): Promise<QlooEntity[]> {
  const {
    filterType,
    tagIds = [],
    entityIds = [],
    take = QLOO_DEFAULTS.INSIGHTS_LIMIT,
    traceLog,
  } = options;

  const params: Record<string, string | number | undefined> = {
    "filter.type": filterType,
    take,
  };

  if (tagIds.length > 0) {
    params["signal.interests.tags"] = tagIds
      .slice(0, QLOO_DEFAULTS.MAX_SIGNAL_ITEMS)
      .join(",");
  }
  if (entityIds.length > 0) {
    params["signal.interests.entities"] = entityIds
      .slice(0, QLOO_DEFAULTS.MAX_SIGNAL_ITEMS)
      .join(",");
  }

  const { data, status, cleanParams } = await qlooFetch(
    QLOO_ENDPOINTS.INSIGHTS,
    params
  );

  const rawEntities: Record<string, unknown>[] =
    data?.results?.entities || data?.results || data?.entities || [];

  const parsed = (Array.isArray(rawEntities) ? rawEntities : []).map(
    normalizeEntity
  );

  if (traceLog) {
    traceLog.push({
      step: `Cross-Domain Insights (${filterType.replace("urn:entity:", "")})`,
      endpoint: `GET ${QLOO_ENDPOINTS.INSIGHTS}`,
      params: cleanParams,
      status,
      resultCount: parsed.length,
      sampleMatches: parsed.slice(0, 3).map((e) => e.name),
    });
  }

  return parsed;
}

function normalizeEntity(raw: Record<string, unknown>): QlooEntity {
  const props = (raw.properties as Record<string, unknown>) || {};
  const imageObj = (props.image as Record<string, unknown>) || {};
  const queryObj = (raw.query as Record<string, unknown>) || {};
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];

  const affinity =
    typeof raw.popularity === "number"
      ? raw.popularity
      : typeof queryObj.affinity === "number"
      ? queryObj.affinity
      : undefined;

  return {
    entity_id: String(raw.entity_id || raw.id || ""),
    name: String(raw.name || "Unknown"),
    type: raw.type ? String(raw.type) : undefined,
    subtype: raw.subtype ? String(raw.subtype) : undefined,
    description: String(
      props.short_description || props.description || raw.description || ""
    ).slice(0, QLOO_DEFAULTS.DESCRIPTION_MAX_LENGTH),
    imageUrl: String(imageObj.url || raw.image_url || ""),
    affinity,
    tags: rawTags
      .slice(0, QLOO_DEFAULTS.MAX_SIGNAL_ITEMS)
      .map((t: Record<string, unknown>) => String(t?.name || ""))
      .filter(Boolean),
  };
}