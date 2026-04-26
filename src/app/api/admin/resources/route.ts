import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users";

const ALLOWED_CATEGORIES = ["Video", "Article", "Exercise"] as const;
type Category = (typeof ALLOWED_CATEGORIES)[number];

async function requireAdmin() {
  const cookieStore = await cookies();
  const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student";
  const user = DEMO_USERS[role];
  if (!user || role !== "admin") return null;
  return user;
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ resources: [] });

  const { data, error } = await supabase
    .from("resources")
    .select("id, title, url, category, duration, source, description, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resources: data || [] });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const url = String(body.url || "").trim();
  const category = String(body.category || "").trim() as Category;
  const duration = body.duration ? String(body.duration).trim() : null;
  const source = body.source ? String(body.source).trim() : null;
  const description = body.description ? String(body.description).trim() : null;

  if (!title || !url || !category) {
    return NextResponse.json({ error: "title, url and category are required" }, { status: 400 });
  }
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `category must be one of ${ALLOWED_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "url must be a valid URL" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("resources")
    .insert({ title, url, category, duration, source, description, created_by: admin.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resource: data }, { status: 201 });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
