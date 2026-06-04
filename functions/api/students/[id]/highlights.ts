// ─────────────────────────────────────────────
// functions/api/students/[id]/highlights.ts
// GET  /api/students/:id/highlights           公开读取（无需 auth）
// PUT  /api/students/:id/highlights           更新（需本人密码）
// Body: { password, highlights: [...] }
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../../_shared/cors';
import { authenticate, type Env } from '../../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;
  const id = context.params.id as string;
  const row = await context.env.DB.prepare(
    'SELECT highlights FROM students WHERE id = ?'
  )
    .bind(id)
    .first<{ highlights: string | null }>();
  if (!row) return errorResponse('学生不存在', 404);
  let highlights: any = null;
  try { highlights = row.highlights ? JSON.parse(row.highlights) : []; }
  catch { highlights = []; }
  return jsonResponse({ highlights });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const id = context.params.id as string;
    const body = (await context.request.json()) as {
      password: string;
      highlights: any[];
    };

    if (!body.password) return errorResponse('缺少密码', 401);
    if (!Array.isArray(body.highlights)) return errorResponse('highlights 必须是数组', 400);

    const auth = await authenticate(body.password, id, context.env);
    if (!auth.valid) return errorResponse('密码错误', 403);

    /* 校验每个 highlight 结构（防止恶意数据） */
    const safe = body.highlights.map(h => ({
      year: typeof h.year === 'string' ? h.year.slice(0, 20) : '',
      title: typeof h.title === 'string' ? h.title.slice(0, 100) : '',
      desc: typeof h.desc === 'string' ? h.desc.slice(0, 500) : '',
      detail: typeof h.detail === 'string' ? h.detail.slice(0, 2000) : '',
      reflection: typeof h.reflection === 'string' ? h.reflection.slice(0, 1000) : '',
      emoji: typeof h.emoji === 'string' ? h.emoji.slice(0, 8) : ''
    }));

    await context.env.DB.prepare(
      'UPDATE students SET highlights = ?, updated_at = unixepoch() WHERE id = ?'
    )
      .bind(JSON.stringify(safe), id)
      .run();

    return jsonResponse({ updated: true, count: safe.length });
  } catch (e: any) {
    return errorResponse('更新失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
