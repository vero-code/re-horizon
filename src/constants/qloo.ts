export const QLOO_ENDPOINTS = {
  TAGS: "/v2/tags",
  SEARCH: "/search",
  INSIGHTS: "/v2/insights",
} as const;

export const QLOO_DEFAULTS = {
  TAGS_LIMIT: 5,
  SEARCH_LIMIT: 3,
  INSIGHTS_LIMIT: 4,
  MAX_SIGNAL_ITEMS: 5,
  DESCRIPTION_MAX_LENGTH: 300,
  CACHE_REVALIDATE_SECONDS: 3600,
} as const;