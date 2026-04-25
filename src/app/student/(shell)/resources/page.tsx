"use client";

import { useState } from "react";
import { Button, Card, Text } from "@/components/ui";
import staticResources from "@/content/static-resources.json";
import { cn } from "@/lib/utils";

interface Resource {
  title: string;
  type: string;
  duration?: string;
  rating?: string;
  tags?: string[];
  thumbnail?: string;
}

import { Icon } from "@iconify/react";

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All", "Anxiety", "Depression", "Academic Stress", "Sleep", "Career", "Hostel Life", "Mindfulness", "Relationships"
  ];

  const filteredResources = staticResources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const resTags = (r as Resource).tags || [];
    const matchesCategory = activeCategory === "All" || resTags.includes(activeCategory) || r.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="tracking-tight">Wellness Library</Text>
          <p className="text-text-dim text-xs font-medium tracking-[0.15em] mt-1">Curated knowledge hub</p>
        </div>
        <div className="relative w-full md:w-[320px]">
          <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input 
            className="w-full h-10 bg-surface border border-border rounded-md pl-10 pr-4 text-sm text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none" 
            placeholder="Search resources, topics, articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Featured */}
      <div className="group relative rounded-lg bg-primary/10 border border-primary/20 p-8 sm:p-10 overflow-hidden flex flex-col sm:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none transform rotate-12 transition-transform duration-700">
          <Icon icon="tabler:yoga" className="h-48 w-48 text-primary" />
        </div>
        
        <div className="relative z-10 flex-1">
          <div className="text-[10px] font-medium text-primary tracking-[0.2em] mb-4">Featured Resource</div>
          <Text as="h3" variant="h3" weight="semibold" className="mb-4 leading-tight">5-Minute Breathing Meditation for Exam Week</Text>
          <Text color="secondary" className="max-w-[50ch] text-sm leading-relaxed mb-8">A guided audio meditation specifically designed for Indian students during exam season. Available in Hindi and English.</Text>
          <div className="flex flex-wrap gap-3">
            <Button size="md" className="gap-2">
              <Icon icon="tabler:headphones" className="text-lg" />
              Listen Now
            </Button>
            <Button variant="warm" size="md" className="gap-2">
              <Icon icon="tabler:bookmark" className="text-lg" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`flex-shrink-0 h-8 px-4 rounded-md text-[11px] font-medium transition-all ${
              activeCategory === cat 
                ? "bg-white text-black shadow-sm" 
                : "text-text-muted hover:text-white hover:bg-white/5"
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, i) => (
          <div key={i} className="group flex flex-col rounded-lg bg-surface border border-border overflow-hidden transition-all duration-150 hover:border-white/20 hover:bg-surface-hover hover:shadow-xl">
            <div className="h-40 bg-white/[0.02] border-b border-border flex items-center justify-center relative overflow-hidden">
              <Icon 
                icon={resource.type === "YouTube" ? "tabler:video" : resource.type === "Audio" ? "tabler:headphones" : "tabler:book"} 
                className="text-primary text-5xl opacity-5 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-medium border",
                  resource.type === "YouTube" ? "bg-secondary/10 text-secondary border-secondary/20" : 
                  resource.type === "Audio" ? "bg-primary/10 text-primary border-primary/20" : 
                  "bg-warning/10 text-warning border-warning/20"
                )}>
                  {resource.type}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <Text as="h4" weight="semibold" className="text-sm mb-4 leading-snug group-hover:text-primary transition-colors flex-1">{resource.title}</Text>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-3 text-[10px] font-medium text-text-dim tabular-nums">
                  {resource.duration && (
                    <span className="flex items-center gap-1.5"><Icon icon="tabler:clock" /> {resource.duration}</span>
                  )} 
                  <span className="flex items-center gap-1.5"><Icon icon="tabler:star" className="text-warning" /> {(resource as Resource).rating || '4.8'}</span>
                </div>
                <button className="text-text-dim hover:text-white transition-colors">
                  <Icon icon="tabler:bookmark" className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="py-20 text-center text-text-dim border border-dashed border-border rounded-lg bg-white/[0.01]">
          <Icon icon="tabler:search-off" className="text-4xl mx-auto mb-4 opacity-10" />
          <p className="text-sm font-medium italic opacity-60">No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
