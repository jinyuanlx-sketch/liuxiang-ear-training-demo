"use client";

import { ExternalLink, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTrainingResourceLinks } from "@/lib/training-resource-demo-store";
import { platformLabels, resourceTypeLabels } from "@/lib/training-resource-links";
import type { TrainingResourceLink, TrainingResourceQuery } from "@/types/training-resource";

export function TrainingResourceList({
  title = "训练资源",
  helper,
  resources,
  resourceQuery
}: {
  title?: string;
  helper?: string;
  resources: TrainingResourceLink[];
  resourceQuery?: TrainingResourceQuery;
}) {
  const visibleResources = useTrainingResourceLinks(resourceQuery, resources);

  if (visibleResources.length === 0) {
    return null;
  }

  function openResource(resource: TrainingResourceLink) {
    const confirmed = window.confirm("即将打开外部平台，观看后可返回继续练习。");

    if (!confirmed) {
      return;
    }

    window.open(resource.url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="liuxiang-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ivory">{title}</h2>
          {helper ? <p className="mt-1 text-xs leading-5 text-muted">{helper}</p> : null}
        </div>
        <Film className="h-4 w-4 shrink-0 text-brass" />
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {visibleResources.map((resource) => (
          <button
            key={resource.id}
            type="button"
            onClick={() => openResource(resource)}
            className="w-full rounded-md border border-ivory/10 bg-ink-950/40 px-3 py-2.5 text-left transition hover:border-brass/35 hover:bg-ivory/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{resourceTypeLabels[resource.resourceType]}</Badge>
                  <span className="text-xs text-muted">{platformLabels[resource.platform]}</span>
                </div>
                <div className="mt-2 truncate text-sm font-medium text-ivory">{resource.title}</div>
                {resource.description ? (
                  <p className="mt-1 truncate text-xs text-muted" title={resource.description}>{resource.description}</p>
                ) : null}
              </div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
