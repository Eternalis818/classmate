// ─────────────────────────────────────────────
// functions/api/messages/index.ts
// GET  /api/messages?to=X     列出某同学收到的留言（含精选）
// POST /api/messages          留 / 更新一条留言（每对至多 1 条）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { authenticate, hashPassword, type Env } from '../../_shared/auth';

const MAX_FEATURED = 5;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const url = new URL(context.request.url);
  const toId = url.searchParams.get('to');
  const includeAll = url.searchParams.get('all') === 'true';

  if (!toId) return errorResponse('缺少 to 参数', 400);

  // 默认只显示已审核；带 all=true 时返回所有（仅本人）
  const baseWhere = includeAll ? 'WHERE to_student_id = ?' : 'WHERE to_student_id = ? AND is_approved = 1';
  const { results } = await context.env.DB.prepare(
    `SELECT id, from_student_id, from_name, avatar_url, text,
            handwritten_url, is_featured, created_at
     FROM messages ${baseWhere}
     ORDER BY is_featured DESC, created_at DESC`
  )
    .bind(toId)
    .all();

  return jsonResponse({ messages: results || [], featured_count: (results || []).filter((m: any) => m.is_featured).length });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const body = (await context.request.json()) as {
      from_student_id: string;
      from_password: string;
      to_student_id: string;
      text: string;
    };

    if (!body.from_student_id || !body.to_student_id || !body.text) {
      return errorResponse('缺少必要字段', 400);
    }
    if (body.from_student_id === body.to_student_id) {
      return errorResponse('不能给自己留言', 400);
    }

    // 空密码时自动视为首次设置（学生本人无密码）
    let auth = await authenticate(body.from_password || '', body.from_student_id, context.env);
    if (!auth.valid && !body.from_password) {
      const hash = await hashPassword('');
      await context.env.DB.prepare(
        'UPDATE students SET password_hash = ? WHERE id = ? AND password_hash IS NULL'
      )
        .bind(hash, body.from_student_id)
        .run();
      auth = { valid: true, isAdmin: false, studentId: body.from_student_id };
    } else if (!auth.valid) {
      return errorResponse('密码错误', 403);
    }

    // 收件人必须存在
    const toStu = await context.env.DB.prepare(
      'SELECT id, name, is_public FROM students WHERE id = ?'
    )
      .bind(body.to_student_id)
      .first<{ id: string; name: string; is_public: number }>();
    if (!toStu) return errorResponse('收件人不存在', 404);

    // 取发送人姓名（从 students 表或直接传）
    const fromStu = await context.env.DB.prepare(
      'SELECT name FROM students WHERE id = ?'
    )
      .bind(body.from_student_id)
      .first<{ name: string }>();

    const text = body.text.trim().slice(0, 500);
    if (!text) return errorResponse('留言内容不能为空', 400);

    // Upsert：同 (from, to) 已存在则更新
    const existing = await context.env.DB.prepare(
      'SELECT id, is_approved FROM messages WHERE from_student_id = ? AND to_student_id = ?'
    )
      .bind(body.from_student_id, body.to_student_id)
      .first<{ id: string; is_approved: number }>();

    if (existing) {
      await context.env.DB.prepare(
        'UPDATE messages SET text = ?, is_approved = 0, is_featured = 0 WHERE id = ?'
      )
        .bind(text, existing.id)
        .run();
      return jsonResponse({ id: existing.id, updated: true, needs_approval: true });
    }

    const id = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO messages (id, from_student_id, from_name, to_student_id, text, type, is_approved)
       VALUES (?, ?, ?, ?, ?, 'personal', 0)`
    )
      .bind(id, body.from_student_id, fromStu?.name || '匿名', body.to_student_id, text)
      .run();

    return jsonResponse({ id, created: true, needs_approval: true }, 201);
  } catch (e: any) {
    return errorResponse('留言失败', 500, e.message);
  }
};

// OPTIONS 预检
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
