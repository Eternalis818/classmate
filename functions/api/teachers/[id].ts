// ─────────────────────────────────────────────
// functions/api/teachers/[id].ts
// GET/PUT 单个老师资料（PUT 需管理员密码）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { isAdminPassword, type Env } from '../../_shared/auth';
import { normalizeTeacherRow } from '../../_shared/teachers';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const id = context.params.id as string;
  const row = await context.env.DB.prepare(
    `SELECT id, name, subject, subject_en, role, is_head_teacher,
            photo_url, quote, message, updated_at
     FROM teachers WHERE id = ?`
  )
    .bind(id)
    .first();
  if (!row) return errorResponse('老师不存在', 404);
  return jsonResponse({ teacher: normalizeTeacherRow(row) });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const id = context.params.id as string;
    const body = (await context.request.json()) as any;
    if (!(await isAdminPassword(String(body.password || ''), context.env))) {
      return errorResponse('管理员密码错误', 403);
    }

    const current = await context.env.DB.prepare(
      `SELECT id, name, subject, subject_en, role, is_head_teacher,
              photo_url, quote, message
       FROM teachers WHERE id = ?`
    )
      .bind(id)
      .first<any>();
    if (!current) return errorResponse('老师不存在', 404);

    await context.env.DB.prepare(
      `UPDATE teachers
       SET name = ?,
           subject = ?,
           subject_en = ?,
           role = ?,
           is_head_teacher = ?,
           photo_url = ?,
           quote = ?,
           message = ?,
           updated_at = unixepoch()
       WHERE id = ?`
      )
      .bind(
        pickText(body.name, current.name, 40),
        pickText(body.subject, current.subject, 40),
        pickText(body.subjectEn ?? body.subject_en, current.subject_en, 40),
        pickText(body.role, current.role, 80),
        body.isHeadTeacher === undefined ? current.is_head_teacher : (body.isHeadTeacher ? 1 : 0),
        pickText(body.photo ?? body.photoUrl ?? body.photo_url, current.photo_url, 500),
        pickText(body.quote, current.quote, 1000),
        pickText(body.message, current.message, 3000),
        id
      )
      .run();

    return jsonResponse({ updated: true, id });
  } catch (e: any) {
    return errorResponse('保存老师资料失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};

function pickText(nextValue: any, currentValue: any, max: number): string {
  const value = nextValue === undefined ? currentValue : nextValue;
  return String(value || '').trim().slice(0, max);
}
