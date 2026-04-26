-- ============================================
-- USER CORE MEMORIES
-- Compressed long-term memory snapshot per user.
-- Updated periodically by the Compression Agent
-- after a threshold of new chat messages is reached.
-- ============================================

CREATE TABLE IF NOT EXISTS user_core_memories (
  user_id                    UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  summary_text               TEXT NOT NULL DEFAULT '',
  message_count              INTEGER NOT NULL DEFAULT 0,        -- total messages compressed so far
  last_compressed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_compressed_message_at TIMESTAMPTZ                        -- sent_at of newest message included
);

CREATE INDEX IF NOT EXISTS user_core_memories_last_compressed_idx
  ON user_core_memories(last_compressed_at);

ALTER TABLE user_core_memories ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS for writes; reads are open since profile data is non-sensitive demo content.
CREATE POLICY "user_core_memories_owner_read"
  ON user_core_memories FOR SELECT USING (true);
