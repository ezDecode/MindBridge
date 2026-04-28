import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import staticResources from "@/content/static-resources.json";

export type ResourceCategory = "Video" | "Article" | "Exercise";

export interface ResourceItem {
  id?: string;
  title: string;
  url: string;
  category: ResourceCategory;
  duration?: string;
  source?: string;
  description?: string;
  created_at?: string;
}

export async function GET() {
  const staticItems = (staticResources as ResourceItem[]).map((r) => ({
    ...r,
    id: `static:${r.url}`,
  }));

  let dbItems: ResourceItem[] = [];
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("resources")
      .select("id, title, url, category, duration, source, description, created_at")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Resources API DB error:", error);
    } else if (data) {
      dbItems = data as ResourceItem[];
    }
  } catch (err) {
    console.error("Resources API: fetch failed", err);
  }

  // DB items first (newest admin additions on top), static curated items after.
  return NextResponse.json({ resources: [...dbItems, ...staticItems] });
}
