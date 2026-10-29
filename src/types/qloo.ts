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
}

export interface QlooTraceStep {
  step: string;
  endpoint: string;
  params: Record<string, string>;
  status: number;
  resultCount: number;
  sampleMatches: string[];
}

export interface QlooInsightsOptions {
  filterType: QlooEntityType;
  tagIds?: string[];
  entityIds?: string[];
  take?: number;
  traceLog?: QlooTraceStep[];
}