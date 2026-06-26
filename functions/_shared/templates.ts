// ─────────────────────────────────────────────
// functions/_shared/templates.ts
// 主题包数据规范化
// ─────────────────────────────────────────────

export function parseJson(v: any, fallback: any) {
  if (!v) return fallback;
  try { return JSON.parse(v as string); } catch { return fallback; }
}

export function normalizeTemplateRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji || '🎨',
    audience: row.audience || '男女皆宜',
    colors: parseJson(row.colors, []),
    tokens: parseJson(row.tokens, {}),
    layout: parseJson(row.layout, {}),
    assets: parseJson(row.assets, {}),
    type: row.type || 'custom',
    sourcePrompt: row.source_prompt || '',
    createdBy: row.created_by || '',
    usageCount: row.usage_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
