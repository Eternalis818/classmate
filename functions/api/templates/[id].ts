// ─────────────────────────────────────────────
// functions/api/templates/[id].ts
// GET/DELETE 单个共享主题包
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { isAdminPassword, type Env } from '../../_shared/auth';
import { normalizeTemplateRow } from '../../_shared/templates';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const id = context.params.id as string;
  const row = await context.env.DB.prepare(
    `SELECT id, name, emoji, audience, colors, tokens, layout, assets, type,
            source_prompt, created_by, usage_count, created_at, updated_at
     FROM templates WHERE id = ? AND is_public = 1`
  )
    .bind(id)
    .first();

  if (!row) return errorResponse('主题不存在', 404);
  return jsonResponse({ template: normalizeTemplateRow(row) });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const id = context.params.id as string;
    const body = (await context.request.json().catch(() => ({}))) as { password?: string };
    if (!(await isAdminPassword(String(body.password || ''), context.env))) {
      return errorResponse('管理员密码错误', 403);
    }

    const result = await context.env.DB.prepare(
      'UPDATE templates SET is_public = 0, updated_at = unixepoch() WHERE id = ?'
    )
      .bind(id)
      .run();
    if (!result.meta?.changes) return errorResponse('主题不存在', 404);
    return jsonResponse({ deleted: true, id });
  } catch (e: any) {
    return errorResponse('删除主题失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
