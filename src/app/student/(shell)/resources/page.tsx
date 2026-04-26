"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, Text } from "@/components/ui";
import { cn } from "@/lib/utils";

type Category = "Video" | "Article" | "Exercise";

interface Resource {
  id?: string;
  title: string;
  url: string;
  category: Category;
  duration?: string | null;
  source?: string | null;
  description?: string | null;
}

const FILTERS: Array<{ label: string; value: "All" | Category; icon: string }> = [
  { label: "All", value: "All", icon: "tabler:layout-grid" },
  { label: "Videos", value: "Video", icon: "tabler:video" },
  { label: "Articles", value: "Article", icon: "tabler:article" },
  { label: "Exercises", value: "Exercise", icon: "tabler:run" },
];

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function categoryStyles(c: Category) {
  switch (c) {
    case "Video":
      return { badge: "bg-secondary/10 text-secondary border-secondary/20", icon: "tabler:video" };
    case "Article":
      return { badge: "bg-warning/10 text-warning border-warning/20", icon: "tabler:article" };
    case "Exercise":
      return { badge: "bg-primary/10 text-primary border-primary/20", icon: "tabler:run" };
  }
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | Category>("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/resources", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setResources(json.resources || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesCategory = activeCategory === "All" || r.category === activeCategory;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        (r.source?.toLowerCase().includes(q) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [resources, searchQuery, activeCategory]);

  const featured = resources.find((r) => r.category === "Video") || resources[0];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
        <div className="relative w-full md:w-[320px]">
          <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            className="w-full h-10 bg-surface border border-border rounded-md pl-10 pr-4 typo-base text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none"
            placeholder="Search resources, topics, articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <div className="group relative rounded-lg bg-primary/10 border border-primary/20 p-8 sm:p-10 overflow-hidden flex flex-col sm:flex-row items-center gap-10">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none transform rotate-12">
            <Icon icon="tabler:yoga" className="h-48 w-48 text-primary" />
          </div>
          <div className="relative z-10 flex-1">
            <div className="typo-ui font-medium text-primary mb-4 uppercase">Featured Resource</div>
            <Text as="h3" variant="h3" weight="semibold" className="mb-4 leading-tight">
              {featured.title}
            </Text>
            {featured.description && (
              <Text color="secondary" className="max-w-[50ch] typo-subtitle leading-relaxed mb-8">
                {featured.description}
              </Text>
            )}
            <div className="flex flex-wrap gap-3">
              <a href={featured.url} target="_blank" rel="noopener noreferrer">
                <Button size="md" className="gap-2">
                  <Icon icon={categoryStyles(featured.category).icon} className="text-lg" />
                  Open now
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={cn(
              "flex-shrink-0 h-8 px-4 rounded-md typo-ui font-medium transition-all flex items-center gap-2",
              activeCategory === f.value
                ? "bg-white text-black shadow-sm"
                : "text-text-muted hover:text-white hover:bg-white/5"
            )}
            onClick={() => setActiveCategory(f.value)}
          >
            <Icon icon={f.icon} className="text-base" />
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-text-dim">
          <Icon icon="tabler:loader-2" className="text-3xl mx-auto mb-3 animate-spin" />
          Loading resources...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, i) => {
            const styles = categoryStyles(resource.category);
            const ytId = resource.category === "Video" ? getYouTubeId(resource.url) : null;
            const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
            return (
              <a
                key={resource.id || i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg bg-surface border border-border overflow-hidden transition-all duration-150 hover:border-white/20 hover:bg-surface-hover hover:shadow-xl"
              >
                <div className="h-40 bg-white/[0.02] border-b border-border flex items-center justify-center relative overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={resource.title} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                  ) : (
                    <Icon icon={styles.icon} className="text-primary typo-metric opacity-10" />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={cn("px-2 py-0.5 rounded typo-ui font-medium border", styles.badge)}>
                      {resource.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <Text as="h4" weight="semibold" className="typo-subtitle mb-3 leading-snug group-hover:text-primary transition-colors">
                    {resource.title}
                  </Text>
                  {resource.description && (
                    <Text variant="small" color="secondary" className="line-clamp-2 leading-relaxed mb-4">
                      {resource.description}
                    </Text>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 typo-ui font-medium text-text-dim tabular-nums">
                      {resource.duration && (
                        <span className="flex items-center gap-1.5">
                          <Icon icon="tabler:clock" /> {resource.duration}
                        </span>
                      )}
                      {resource.source && (
                        <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                          <Icon icon="tabler:link" /> {resource.source}
                        </span>
                      )}
                    </div>
                    <Icon icon="tabler:external-link" className="text-text-dim group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {!loading && filteredResources.length === 0 && (
        <div className="py-20 text-center text-text-dim border border-dashed border-border rounded-lg bg-white/[0.01]">
          <Icon icon="tabler:search-off" className="typo-metric mx-auto mb-4 opacity-10" />
          <p className="typo-base font-medium italic opacity-60">No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
