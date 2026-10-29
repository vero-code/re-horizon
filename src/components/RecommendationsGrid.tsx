import { ReactNode } from "react";
import { HorizonRecommendations } from "@/types/horizon";
import { QlooEntity } from "@/types/qloo";
import {
  ArtistIcon,
  BookIcon,
  DestinationIcon,
  MovieIcon,
} from "@/components/icons/HorizonIcons";

interface RecommendationsGridProps {
  recommendations: HorizonRecommendations;
}

interface DomainColumnProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  items: QlooEntity[];
}

function DomainColumn({ title, subtitle, icon, items }: DomainColumnProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4 flex items-center gap-2.5 border-b border-zinc-800 pb-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-200">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-400">{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-zinc-500">
          No entities returned by Qloo for this domain.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.entity_id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5"
            >
              <div className="flex items-start gap-3">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-lg border border-zinc-800 object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      {item.name}
                    </span>
                    {typeof item.affinity === "number" && (
                      <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] text-zinc-300">
                        {Math.round(item.affinity * 100)}% match
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-400">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {item.tags.slice(0, 4).map((tag, idx) => (
                    <span
                      key={`${item.entity_id}-tag-${idx}`}
                      className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RecommendationsGrid({
  recommendations,
}: RecommendationsGridProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Cross-Domain Cultural Anchors (Qloo Taste Graph)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DomainColumn
          title="Acoustic Anchors"
          subtitle="urn:entity:artist"
          icon={<ArtistIcon className="w-4 h-4" />}
          items={recommendations.artists}
        />
        <DomainColumn
          title="Literary Companions"
          subtitle="urn:entity:book"
          icon={<BookIcon className="w-4 h-4" />}
          items={recommendations.books}
        />
        <DomainColumn
          title="Visual Atmospheres"
          subtitle="urn:entity:movie"
          icon={<MovieIcon className="w-4 h-4" />}
          items={recommendations.movies}
        />
        <DomainColumn
          title="Geographic Horizons"
          subtitle="urn:entity:destination"
          icon={<DestinationIcon className="w-4 h-4" />}
          items={recommendations.destinations}
        />
      </div>
    </section>
  );
}