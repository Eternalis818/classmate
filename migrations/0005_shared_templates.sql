-- ─────────────────────────────────────────────────────
-- 时光纪念册 · 0005 全班共享主题包
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0005_shared_templates.sql --remote
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS templates (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  emoji         TEXT,
  audience      TEXT,
  colors        TEXT,                       -- JSON 数组
  tokens        TEXT,                       -- JSON 对象，CSS custom properties
  layout        TEXT,                       -- JSON 对象
  type          TEXT NOT NULL DEFAULT 'custom' CHECK(type IN ('custom','ai')),
  source_prompt TEXT,
  created_by    TEXT,
  is_public     INTEGER DEFAULT 1,
  usage_count   INTEGER DEFAULT 0,
  created_at    INTEGER DEFAULT (unixepoch()),
  updated_at    INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public, updated_at DESC);
