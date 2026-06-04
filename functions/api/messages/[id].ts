// ─────────────────────────────────────────────
// functions/api/messages/[id].ts
// DELETE /api/messages/:id  删除（仅发送人/收件人/管理员）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { authenticate, type Env } from '../../_shared/auth';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const messageId = context.params.id as string;
    const body = (await context.request.json()) as {
      student_id: string;
      password: string;
    };

    if (!body.student_id || !body.password) {
      return errorResponse('缺少 student_id 或 password', 400);
    }

    const auth = await authenticate(body.password, body.student_id, context.env);
    if (!auth.valid) return errorResponse('密码错误', 403);

    const msg = await context.env.DB.prepare(
      'SELECT from_student_id, to_student_id FROM messages WHERE id = ?'
    )
      .bind(messageId)
      .first<{ from_student_id: string; to_student_id: string }>();
    if (!msg) return errorResponse('留言不存在', 404);

    const isOwner = msg.from_student_id === body.student_id;
    const isRecipient = msg.to_student_id === body.student_id;
    if (!auth.isAdmin && !isOwner && !isRecipient) {
      return errorResponse('无权删除', 403);
    }

    await context.env.DB.prepare('DELETE FROM messages WHERE id = ?')
      .bind(messageId)
      .run();
    return jsonResponse({ deleted: true, id: messageId });
  } catch (e: any) {
    return errorResponse('删除失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
