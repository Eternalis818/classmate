-- ─────────────────────────────────────────────────────
-- 时光纪念册 · 0006 主题素材字段
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0006_template_assets.sql --remote
-- ─────────────────────────────────────────────────────

-- 主题包附带图片素材（卷轴/印章/边框/HUD/信封等）
-- 存 JSON 字符串，键名固定 8 个槽位：
--   heroBg, profileFrame, timelineMarker,
--   abilityBarBg, abilityBarFill,
--   envelopeClosed, envelopeOpen, stamp
ALTER TABLE templates ADD COLUMN assets TEXT;
