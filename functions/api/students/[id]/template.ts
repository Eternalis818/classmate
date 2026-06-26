// ─────────────────────────────────────────────
// functions/api/students/[id]/template.ts
// PUT /api/students/:id/template  保存学生主题选择（需本人/管理员密码）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../../_shared/cors';
import { authenticate, type Env } from '../../../_shared/auth';

const BUILTIN_TEMPLATES = new Set([
  'starlight-admission',
  'sakura-macaron',
  'cosmic-exam',
  'martial-legend',
  'mint-journal',
  'cute-hamster',
  'ancient-classic',
  'energy-pop',
  'crayon-style',
  'imperial-scroll',
  'delta-force',
]);

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const id = context.params.id as string;
    const body = (await context.request.json()) as {
      password?: string;
      template?: string;
    };

    if (!body.password) return errorResponse('缺少密码', 401);
    if (!body.template) return errorResponse('缺少 template', 400);
    if (!(await templateExists(body.template, context.env.DB))) {
      return errorResponse('未知主题', 400);
    }

    const auth = await authenticate(body.password, id, context.env);
    if (!auth.valid) return errorResponse('密码错误', 403);

    const result = await context.env.DB.prepare(
      'UPDATE students SET template = ?, updated_at = unixepoch() WHERE id = ?'
    )
      .bind(body.template, id)
      .run();

    if (!result.meta?.changes) return errorResponse('学生不存在', 404);

    return jsonResponse({ updated: true, id, template: body.template });
  } catch (e: any) {
    return errorResponse('保存主题失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};

async function templateExists(templateId: string, db: D1Database): Promise<boolean> {
  if (BUILTIN_TEMPLATES.has(templateId)) return true;
  const row = await db.prepare('SELECT id FROM templates WHERE id = ? AND is_public = 1')
    .bind(templateId)
    .first<{ id: string }>();
  return !!row;
}
