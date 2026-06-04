// ─────────────────────────────────────────────
// functions/api/students.ts
// GET 学生列表（公开基础信息）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../_shared/cors';
import type { Env } from '../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const url = new URL(context.request.url);
  const template = url.searchParams.get('template');
  const includePrivate = url.searchParams.get('private') === 'true';

  let query = `SELECT id, name, nickname, class, school, template,
                      is_founder, is_public, updated_at
               FROM students
               WHERE 1=1`;
  const params: any[] = [];

  if (!includePrivate) {
    query += ` AND is_public = 1`;
  }
  if (template) {
    query += ` AND template = ?`;
    params.push(template);
  }
  query += ` ORDER BY id`;

  const stmt = context.env.DB.prepare(query);
  const { results } = await (params.length ? stmt.bind(...params) : stmt).all();

  return jsonResponse({ students: results || [] });
};
