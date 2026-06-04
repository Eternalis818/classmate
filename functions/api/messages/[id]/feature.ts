// ─────────────────────────────────────────────
// functions/api/messages/[id]/feature.ts
// POST /api/messages/:id/feature  切换精选（仅收件人）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../../_shared/cors';
import { authenticate, type Env } from '../../../_shared/auth';

const MAX_FEATURED = 5;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const messageId = context.params.id as string;
    const body = (await context.request.json()) as {
      student_id: string;
      password: string;
      featured: boolean;
    };

    if (!body.student_id || !body.password) {
      return errorResponse('缺少 student_id 或 password', 400);
    }

    const auth = await authenticate(body.password, body.student_id, context.env);
    if (!auth.valid) return errorResponse('密码错误', 403);

    const msg = await context.env.DB.prepare(
      'SELECT to_student_id FROM messages WHERE id = ?'
    )
      .bind(messageId)
      .first<{ to_student_id: string }>();
    if (!msg) return errorResponse('留言不存在', 404);
    if (msg.to_student_id !== body.student_id) {
      return errorResponse('只有收件人能设置精选', 403);
    }

    if (body.featured) {
      const { results: featured } = await context.env.DB.prepare(
        'SELECT id FROM messages WHERE to_student_id = ? AND is_featured = 1 AND id != ?'
      )
        .bind(body.student_id, messageId)
        .all();
      if ((featured || []).length >= MAX_FEATURED) {
        return errorResponse(`最多精选 ${MAX_FEATURED} 条`, 403, { limit: MAX_FEATURED });
      }
    }

    await context.env.DB.prepare(
      'UPDATE messages SET is_featured = ? WHERE id = ?'
    )
      .bind(body.featured ? 1 : 0, messageId)
      .run();

    return jsonResponse({ id: messageId, is_featured: body.featured });
  } catch (e: any) {
    return errorResponse('操作失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
