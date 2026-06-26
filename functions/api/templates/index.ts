// ─────────────────────────────────────────────
// functions/api/templates/index.ts
// GET  /api/templates     全班共享主题包
// POST /api/templates     发布共享主题包（管理员）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { isAdminPassword, type Env } from '../../_shared/auth';
import { normalizeTemplateRow } from '../../_shared/templates';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const { results } = await context.env.DB.prepare(
    `SELECT id, name, emoji, audience, colors, tokens, layout, assets, type,
            source_prompt, created_by, usage_count, created_at, updated_at
     FROM templates
     WHERE is_public = 1
     ORDER BY updated_at DESC, created_at DESC`
  ).all();

  return jsonResponse({ templates: (results || []).map(normalizeTemplateRow) });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const body = (await context.request.json()) as any;
    const password = String(body.password || '');
    if (!(await isAdminPassword(password, context.env))) {
      return errorResponse('管理员密码错误', 403);
    }

    const tpl = sanitizeTemplate(body.template || body);
    if (!tpl.id || !tpl.name) return errorResponse('缺少主题 id 或 name', 400);

    await context.env.DB.prepare(
      `INSERT INTO templates
       (id, name, emoji, audience, colors, tokens, layout, assets, type, source_prompt,
        created_by, is_public, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, unixepoch())
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         emoji = excluded.emoji,
         audience = excluded.audience,
         colors = excluded.colors,
         tokens = excluded.tokens,
         layout = excluded.layout,
         assets = excluded.assets,
         type = excluded.type,
         source_prompt = excluded.source_prompt,
         created_by = excluded.created_by,
         is_public = 1,
         updated_at = unixepoch()`
    )
      .bind(
        tpl.id,
        tpl.name,
        tpl.emoji,
        tpl.audience,
        JSON.stringify(tpl.colors),
        JSON.stringify(tpl.tokens),
        JSON.stringify(tpl.layout),
        JSON.stringify(tpl.assets),
        tpl.type,
        tpl.sourcePrompt,
        tpl.createdBy
      )
      .run();

    return jsonResponse({ saved: true, template: tpl }, { status: 201 });
  } catch (e: any) {
    return errorResponse('保存主题包失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};

function sanitizeTemplate(raw: any) {
  const id = String(raw.id || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 80);
  const colors = Array.isArray(raw.colors) ? raw.colors.map((v: any) => String(v).trim()).filter(Boolean).slice(0, 8) : [];
  return {
    id,
    name: String(raw.name || '').trim().slice(0, 60),
    emoji: String(raw.emoji || '🎨').trim().slice(0, 8),
    audience: String(raw.audience || '男女皆宜').trim().slice(0, 40),
    colors: colors.length ? colors : ['#FFB6C1', '#87CEEB', '#FFFACD', '#2C2C2C'],
    tokens: raw.tokens && typeof raw.tokens === 'object' ? raw.tokens : {},
    layout: raw.layout && typeof raw.layout === 'object' ? raw.layout : {},
    assets: sanitizeAssets(raw.assets),
    type: raw.type === 'ai' ? 'ai' : 'custom',
    sourcePrompt: String(raw.sourcePrompt || raw.source_prompt || '').trim().slice(0, 500),
    createdBy: String(raw.createdBy || raw.created_by || 'admin').trim().slice(0, 40),
  };
}

const ASSET_SLOTS = new Set([
  'heroBg', 'profileFrame', 'timelineMarker',
  'abilityBarBg', 'abilityBarFill',
  'envelopeClosed', 'envelopeOpen', 'stamp',
]);

function sanitizeAssets(raw: any) {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!ASSET_SLOTS.has(k)) continue;
    const s = String(v || '').trim().slice(0, 500);
    if (s) out[k] = s;
  }
  return out;
}
