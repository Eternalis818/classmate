-- ─────────────────────────────────────────────
-- 时光纪念册 · 0009 能力值扩展（创造力/暖心值/学习力）
-- 前端有 6 个能力滑块，0001 只建了 swim/tech/resp 3 列，补齐后 3 列
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0009_abilities_extra.sql --remote
-- ─────────────────────────────────────────────

ALTER TABLE students ADD COLUMN abilities_creativity INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN abilities_warmth INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN abilities_learning INTEGER DEFAULT 0;
