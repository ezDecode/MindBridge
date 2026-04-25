"use client";

import { motion } from "motion/react";
import { Text } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface Resource {
 title: string;
 url: string;
 type: "YouTube" | "Audio";
 duration: string;
 description: string;
}

interface ResourceCardProps {
 resource: Resource;
 className?: string;
 style?: React.CSSProperties;
}

const cardReveal = {
 initial: { opacity: 0, y: 20 },
 animate: { 
 opacity: 1, 
 y: 0
 }
};

export function ResourceCard({ resource, className = "", style }: ResourceCardProps) {
 const isYouTube = resource.type === "YouTube";
 
 const getYouTubeId = (url: string): string | null => {
 const patterns = [
 /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
 /^([a-zA-Z0-9_-]{11})$/,
 ];
 for (const pattern of patterns) {
 const match = url.match(pattern);
 if (match) return match[1];
 }
 return null;
 };
 
 const videoId = isYouTube ? getYouTubeId(resource.url) : null;
 const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

 return (
 <motion.a
 variants={cardReveal}
 href={resource.url}
 target="_blank"
 rel="noopener noreferrer"
 style={style}
 
 
  className={cn(
    "group block p-4 rounded-lg border border-border bg-surface",
    "transition-all duration-150 hover:border-white/20 hover:bg-surface-hover active:scale-[0.98]",
    className
  )}
>
  {thumbnail && (
    <div className="relative aspect-video rounded-md overflow-hidden mb-4 bg-background border border-white/5">
      <img
        src={thumbnail}
        alt={resource.title}
        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-80"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform duration-300">
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] tabular-nums font-bold px-2 py-0.5 rounded-sm backdrop-blur-md tracking-wider">
        {resource.duration}
      </div>
    </div>
  )}

  <div className="flex items-center gap-2.5 mb-3">
    <span className={cn(
      "text-[9px] font-medium px-2 py-0.5 rounded border ",
      isYouTube 
        ? "bg-danger/10 text-danger border-danger/20" 
        : "bg-primary/10 text-primary border-primary/20"
    )}>
      {resource.type}
    </span>
    {!isYouTube && (
      <span className="text-[10px] font-medium text-text-dim tabular-nums">
        {resource.duration}
      </span>
    )}
  </div>

  <Text as="h3" variant="body" weight="semibold" className="text-white group-hover:text-primary transition-colors duration-150 line-clamp-2 leading-snug">
    {resource.title}
  </Text>
  
  <Text as="p" variant="small" color="secondary" className="mt-2 line-clamp-2 leading-relaxed">
    {resource.description}
  </Text>
 </motion.a>
 );
}

export function ResourceSection({ 
 title, 
 description, 
 resources, 
 icon,
 className = "" 
}: { 
 title: string; 
 description?: string;
 resources: Resource[];
 icon?: React.ReactNode;
 className?: string;
}) {
 return (
 <section className={className}>
 <div className="flex items-center gap-4 mb-8">
 {icon && <div className="h-10 w-10 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/20">{icon}</div>}
 <div>
 <Text as="h2" variant="h3" weight="semibold" className="text-white tracking-tight">
 {title}
 </Text>
 {description && (
 <Text as="p" color="secondary" className="mt-1 text-sm leading-relaxed max-w-[60ch]">
 {description}
 </Text>
 )}
 </div>
 </div>
 
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

 {resources.map((resource, index) => (
 <ResourceCard 
 key={index} 
 resource={resource}
 style={{ animationDelay: `${index * 80}ms` }}
 />
 ))}
 </div>
 </section>
 );
}
