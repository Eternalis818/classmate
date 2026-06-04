// ─────────────────────────────────────────────
// functions/api/students/[id].ts
// GET 单个学生详情（含照片）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import type { Env } from '../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const id = context.params.id as string;
  const student = await context.env.DB.prepare(
    `SELECT id, name, nickname, student_number, class, school, tags, motto,
            highlights, abilities_swim, abilities_tech, abilities_resp,
            pet_json, future_letter, template, stickers, is_founder, is_public,
            created_at, updated_at
     FROM students WHERE id = ?`
  )
    .bind(id)
    .first();

  if (!student) return errorResponse('学生不存在', 404);

  // 解析 JSON 字段
  const parseJson = (v: any) => {
    if (!v) return null;
    try {
      return JSON.parse(v as string);
    } catch {
      return v;
    }
  };

  const result = {
    ...student,
    tags: parseJson(student.tags),
    highlights: parseJson(student.highlights),
    stickers: parseJson(student.stickers),
    pet: parseJson(student.pet_json),
    // 照片统一从 photos 表读取
    photos: await getPhotosForStudent(context.env.DB, id),
  };

  return jsonResponse(result);
};

async function getPhotosForStudent(db: D1Database, studentId: string) {
  const { results } = await db.prepare(
    `SELECT id, category, url, width, height, file_size, created_at
     FROM photos WHERE owner_id = ? AND owner_type = 'student'
     ORDER BY created_at ASC`
  )
    .bind(studentId)
    .all();

  const photos: Record<string, any> = {
    avatar: null,
    life: [],
    school: [],
    future: [],
    pet: null,
    handwritten: null,
  };

  for (const p of results || []) {
    const cat = p.category as string;
    if (['avatar', 'pet', 'handwritten'].includes(cat)) {
      photos[cat] = p;
    } else if (['life', 'school', 'future'].includes(cat)) {
      photos[cat].push(p);
    }
  }

  return photos;
}
