-- ─────────────────────────────────────────────
-- 时光纪念册 · 0007 班级共享配置
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0007_class_config.sql --remote
-- ─────────────────────────────────────────────

-- 班级级共享配置（大合照 URL、班级口号、毕业日期等）
-- key-value 形式，便于扩展
CREATE TABLE IF NOT EXISTS class_config (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  INTEGER DEFAULT (unixepoch())
);

-- 默认占位（空字符串 = 尚未上传大合照）
INSERT OR IGNORE INTO class_config (key, value) VALUES ('class_photo_url', '');