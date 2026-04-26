-- Resources table for admin-added wellness resources.
-- Static / curated entries continue to live in src/content/static-resources.json;
-- this table holds anything an admin adds at runtime via /admin/resources.

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Video', 'Article', 'Exercise')),
  duration TEXT,
  source TEXT,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resources_category_idx ON resources(category);
CREATE INDEX IF NOT EXISTS resources_created_at_idx ON resources(created_at DESC);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read; writes go through the service role from the
-- admin API so we don't need an explicit insert policy.
DROP POLICY IF EXISTS "resources_read_all" ON resources;
CREATE POLICY "resources_read_all" ON resources
  FOR SELECT USING (true);
