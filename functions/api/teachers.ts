// ─────────────────────────────────────────────
// functions/api/teachers.ts
// GET 老师列表
// ─────────────────────────────────────────────

import { preflight, jsonResponse } from '../_shared/cors';
import type { Env } from '../_shared/auth';
import { normalizeTeacherRow } from '../_shared/teachers';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const { results } = await context.env.DB.prepare(
    `SELECT id, name, subject, subject_en, role, is_head_teacher,
            photo_url, quote, message, updated_at
     FROM teachers
     ORDER BY id`
  ).all();

  return jsonResponse({ teachers: (results || []).map(normalizeTeacherRow) });
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
