export type QlooEntityType =
  | "urn:entity:artist"
  | "urn:entity:book"
  | "urn:entity:movie"
  | "urn:entity:destination"
  | "urn:entity:place"
  | "urn:entity:podcast"
  | "urn:entity:tv_show";

export interface QlooTag {
  id: string;
  name: string;
  type?: string;
}

export interface QlooEntity {
  entity_id: string;
  name: string;
  type?: string;
  subtype?: string;
  description?: string;
  imageUrl?: string;
  affinity?: number;
  tags?: string[];
  properties?: Record<string, unknown>;
}

export interface QlooTraceStep {
  step: string;
  endpoint: string;
  params: Record<string, string>;
  status: number;
  resultCount: number;
  sampleMatches: string[];
}

const getBaseUrl = () =>
  (process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com").replace(/\/$/, "");

const getApiKey = () => {
  const key = process.env.QLOO_API_KEY;
  if (!key) {
    throw new Error("Missing QLOO_API_KEY in environment variables (.env or .env.local)");
  }
  return key;
};

async function qlooFetch(
  path: string,
  params: Record<string, string | number | undefined>,
  traceLog?: QlooTraceStep[],
  stepLabel?: string
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Qloo API error (${response.status}) on ${path}: ${JSON.stringify(data)}`
    );
  }

  return { data, status: response.status, cleanParams };
}

/**
 * 1. Search for valid Qloo tag IDs by keyword (/v2/tags)
 */
export async function findQlooTags(
  query: string,
  take = 5,
  traceLog?: QlooTraceStep[]
): Promise<QlooTag[]> {
  const { data, status, cleanParams } = await qlooFetch("/v2/tags", {
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
      endpoint: "GET /v2/tags",
      params: cleanParams,
      status,
      resultCount: parsed.length,
      sampleMatches: parsed.slice(0, 3).map((t) => `${t.name} (${t.id})`),
    });
  }

  return parsed;
}

/**
 * 2. Search for Qloo entities by name or image (/search)
 */
export async function searchQlooEntities(
  query: string,
  take = 3,
  traceLog?: QlooTraceStep[]
): Promise<QlooEntity[]> {
  const { data, status, cleanParams } = await qlooFetch("/search", {
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
      endpoint: "GET /search",
      params: cleanParams,
      status,
      resultCount: parsed.length,
      sampleMatches: parsed.slice(0, 3).map((e) => `${e.name} (${e.entity_id})`),
    });
  }

  return parsed;
}

/**
 * 3. Obtain recommendations and cultural connections (/v2/insights)
 */
export async function getQlooInsights(options: {
  filterType: QlooEntityType;
  tagIds?: string[];
  entityIds?: string[];
  take?: number;
  traceLog?: QlooTraceStep[];
}): Promise<QlooEntity[]> {
  const { filterType, tagIds = [], entityIds = [], take = 4, traceLog } = options;

  const params: Record<string, string | number | undefined> = {
    "filter.type": filterType,
    take,
  };

  if (tagIds.length > 0) {
    params["signal.interests.tags"] = tagIds.slice(0, 5).join(",");
  }
  if (entityIds.length > 0) {
    params["signal.interests.entities"] = entityIds.slice(0, 5).join(",");
  }

  const { data, status, cleanParams } = await qlooFetch("/v2/insights", params);

  const rawEntities: Record<string, unknown>[] =
    data?.results?.entities || data?.results || data?.entities || [];

  const parsed = (Array.isArray(rawEntities) ? rawEntities : []).map(normalizeEntity);

  if (traceLog) {
    traceLog.push({
      step: `Cross-Domain Insights (${filterType.replace("urn:entity:", "")})`,
      endpoint: "GET /v2/insights",
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
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];

  return {
    entity_id: String(raw.entity_id || raw.id || ""),
    name: String(raw.name || "Unknown"),
    type: raw.type ? String(raw.type) : undefined,
    subtype: raw.subtype ? String(raw.subtype) : undefined,
    description: String(
      props.short_description ||
        props.description ||
        raw.description ||
        ""
    ).slice(0, 300),
    imageUrl: String(imageObj.url || raw.image_url || ""),
    affinity:
      typeof raw.popularity === "number"
        ? raw.popularity
        : typeof raw.query?.affinity === "number"
        ? raw.query.affinity
        : undefined,
    tags: rawTags
      .slice(0, 5)
      .map((t: Record<string, unknown>) => String(t?.name || ""))
      .filter(Boolean),
    properties: props,
  };
}