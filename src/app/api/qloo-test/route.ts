import { NextResponse } from "next/server";
import {
  findQlooTags,
  searchQlooEntities,
  getQlooInsights,
} from "@/lib/qloo";
import { QlooTraceStep } from "@/types/qloo";

export async function GET() {
  const traceLog: QlooTraceStep[] = [];

  try {
    // 1. Search for a tag based on the concept "ambient"
    const tags = await findQlooTags("ambient", 3, traceLog);
    // 2. Look for a foundational entity (for example, the composer Max Richter)
    const entities = await searchQlooEntities("Max Richter", 2, traceLog);

    const tagIds = tags.map((t) => t.id).slice(0, 2);
    const entityIds = entities.map((e) => e.entity_id).slice(0, 1);

    // 3. Make a test cross-domain request to /v2/insights (music + books)
    const [artists, books] = await Promise.all([
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
    ]);

    return NextResponse.json({
      ok: true,
      resolvedTags: tags,
      resolvedEntities: entities,
      recommendations: {
        artists: artists.map((a) => ({ name: a.name, tags: a.tags })),
        books: books.map((b) => ({ name: b.name, description: b.description })),
      },
      traceLog,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: message, traceLog },
      { status: 500 }
    );
  }
}