-- ─────────────────────────────────────────────
-- 时光纪念册 · 0008 注册 martial-legend 主题
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0008_register_martial_legend.sql --remote
-- ─────────────────────────────────────────────

INSERT OR IGNORE INTO templates (
  id, name, emoji, audience,
  colors, tokens, assets, is_public, type, created_at
) VALUES (
  'martial-legend',
  '江湖风云榜',
  '⚔️',
  '中性偏男',
  '["#1F1410","#C84032","#D4C5A9","#8FA3B0"]',
  NULL,
  NULL,
  1,
  'custom',
  unixepoch()
);