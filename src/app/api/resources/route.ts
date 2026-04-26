import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from("resources")
        .select("id, title, url, category, duration, source, description, created_at")
        .order("created_at", { ascending: false });
      if (!error && data) {
        dbItems = data as ResourceItem[];
      }
    }
  } catch (err) {
    console.warn("Resources API: DB fetch skipped", err);
  }

  // DB items first (newest admin additions on top), static curated items after.
  return NextResponse.json({ resources: [...dbItems, ...staticItems] });
}
