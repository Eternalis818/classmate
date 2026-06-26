// ─────────────────────────────────────────────
// functions/api/students/[id].ts
// GET 单个学生详情（含照片）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { authenticate, hashPassword, type Env } from '../../_shared/auth';

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

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const id = context.params.id as string;
    const body = (await context.request.json()) as {
      password?: string;
      name?: string;
      nickname?: string;
      class?: string;
      school?: string;
      tags?: string[];
      motto?: string;
      highlights?: Array<Record<string, any>>;
      abilities?: Record<string, number>;
      pet?: Record<string, any> | null;
      futureLetter?: string;
      template?: string;
      stickers?: string[];
      isPublic?: boolean;
    };

    if (!body.password) return errorResponse('缺少密码', 401);

    const row = await context.env.DB.prepare(
      'SELECT id, password_hash FROM students WHERE id = ?'
    )
      .bind(id)
      .first<{ id: string; password_hash: string | null }>();

    if (!row) return errorResponse('学生不存在', 404);

    const isFirstSetup = !row.password_hash;
    const auth = await authenticate(body.password, id, context.env);
    if (!isFirstSetup && !auth.valid) return errorResponse('密码错误', 403);

    const safeTags = Array.isArray(body.tags)
      ? body.tags.map(v => String(v).trim().slice(0, 24)).filter(Boolean).slice(0, 8)
      : [];
    const safeHighlights = Array.isArray(body.highlights)
      ? body.highlights.map(h => ({
          year: typeof h.year === 'string' ? h.year.slice(0, 20) : '',
          title: typeof h.title === 'string' ? h.title.slice(0, 100) : '',
          desc: typeof h.desc === 'string' ? h.desc.slice(0, 500) : '',
          detail: typeof h.detail === 'string' ? h.detail.slice(0, 2000) : '',
          reflection: typeof h.reflection === 'string' ? h.reflection.slice(0, 1000) : '',
          emoji: typeof h.emoji === 'string' ? h.emoji.slice(0, 8) : ''
        })).filter(h => h.title)
      : [];
    const ab = body.abilities || {};
    const clamp = (v: any) => Math.max(0, Math.min(100, Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0));
    const safePet = body.pet
      ? {
          name: typeof body.pet.name === 'string' ? body.pet.name.slice(0, 40) : '',
          type: typeof body.pet.type === 'string' ? body.pet.type.slice(0, 40) : '',
          photo: typeof body.pet.photo === 'string' ? body.pet.photo.slice(0, 500) : '',
          desc: typeof body.pet.desc === 'string' ? body.pet.desc.slice(0, 500) : ''
        }
      : null;
    const safeStickers = Array.isArray(body.stickers)
      ? body.stickers.map(v => String(v).trim().slice(0, 40)).filter(Boolean).slice(0, 12)
      : [];
    const requestedTemplate = typeof body.template === 'string' && body.template
      ? body.template.slice(0, 80)
      : 'starlight-admission';
    if (!(await templateExists(requestedTemplate, context.env.DB))) {
      return errorResponse('未知主题', 400);
    }
    const safeTemplate = requestedTemplate;
    const passwordHash = isFirstSetup && !auth.isAdmin
      ? await hashPassword(body.password)
      : row.password_hash;

    await context.env.DB.prepare(
      `UPDATE students
       SET name = ?,
           nickname = ?,
           class = ?,
           school = ?,
           tags = ?,
           motto = ?,
           highlights = ?,
           abilities_swim = ?,
           abilities_tech = ?,
           abilities_resp = ?,
           pet_json = ?,
           future_letter = ?,
           template = ?,
           stickers = ?,
           is_public = ?,
           password_hash = ?,
           updated_at = unixepoch()
       WHERE id = ?`
    )
      .bind(
        String(body.name || '').trim().slice(0, 40),
        String(body.nickname || '').trim().slice(0, 40),
        String(body.class || '六年级4班').trim().slice(0, 40),
        String(body.school || '松柏第二小学').trim().slice(0, 80),
        JSON.stringify(safeTags),
        String(body.motto || '').trim().slice(0, 120),
        JSON.stringify(safeHighlights),
        clamp(ab.swimming),
        clamp(ab.tech),
        clamp(ab.responsibility),
        safePet ? JSON.stringify(safePet) : null,
        String(body.futureLetter || '').trim().slice(0, 3000),
        safeTemplate,
        JSON.stringify(safeStickers),
        body.isPublic === false ? 0 : 1,
        passwordHash,
        id
      )
      .run();

    return jsonResponse({ updated: true, first_setup: isFirstSetup, id });
  } catch (e: any) {
    return errorResponse('保存学生资料失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
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

async function templateExists(templateId: string, db: D1Database): Promise<boolean> {
  if (BUILTIN_TEMPLATES.has(templateId)) return true;
  const row = await db.prepare('SELECT id FROM templates WHERE id = ? AND is_public = 1')
    .bind(templateId)
    .first<{ id: string }>();
  return !!row;
}
