"use client";

import { motion } from "framer-motion";
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
 whileHover={{ y: -4 }}
 whileTap={{ scale: 0.99 }}
 className={cn(
 "group block p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]",
 "transition-all duration-300 hover:border-[var(--color-border-strong)] hover:shadow-xl",
 className
 )}
 >
 {thumbnail && (
 <div className="relative aspect-video rounded-md overflow-hidden mb-4 bg-[var(--color-gray-100)] shadow-inner">
 <img
 src={thumbnail}
 alt={resource.title}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 />
 <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-colors duration-300">
 <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
 <svg className="w-5 h-5 text-[var(--color-text-primary)] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8 5v14l11-7z" />
 </svg>
 </div>
 </div>
 <div className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
 {resource.duration}
 </div>
 </div>
 )}

 <div className="flex items-center gap-2.5 mb-2.5">
 <span className={cn(
 "text-xs font-semibold px-2.5 py-0.5 rounded-full tracking-wide",
 isYouTube 
 ? "bg-red-50 text-red-600" 
 : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
 )}>
 {resource.type}
 </span>
 {!isYouTube && (
 <span className="text-xs text-[var(--color-text-muted)]">
 {resource.duration}
 </span>
 )}
 </div>

 <Text as="h3" variant="h6" weight="semibold" className="text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors duration-200 line-clamp-2 leading-snug">
 {resource.title}
 </Text>
 
 <Text as="p" variant="small" color="muted" className="mt-1.5 line-clamp-2 leading-relaxed">
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
 <div className="flex items-center gap-4 mb-6">
 {icon && <div className="text-[var(--color-primary)]">{icon}</div>}
 <div>
 <Text as="h2" variant="h4" weight="bold" className="text-[var(--color-text-primary)]">
 {title}
 </Text>
 {description && (
 <Text as="p" variant="body" color="secondary" className="mt-1">
 {description}
 </Text>
 )}
 </div>
 </div>
 
 <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
