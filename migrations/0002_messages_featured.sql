-- ─────────────────────────────────────────────────────
-- 时光纪念册 · 0002 留言精选字段
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0002_messages_featured.sql --remote
-- ─────────────────────────────────────────────────────

-- 1) 留言精选标记（每个收件人最多 5 条）
ALTER TABLE messages ADD COLUMN is_featured INTEGER DEFAULT 0;

-- 2) 防止同一人对同一收件人留多条（公开墙 to_student_id=NULL 不受约束）
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_pair
  ON messages(from_student_id, to_student_id)
  WHERE to_student_id IS NOT NULL;

-- 3) 收件人按精选筛选
CREATE INDEX IF NOT EXISTS idx_messages_featured
  ON messages(to_student_id, is_featured, created_at DESC)
  WHERE to_student_id IS NOT NULL;
