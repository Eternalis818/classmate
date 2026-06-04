// ─────────────────────────────────────────────
// functions/api/photos/[id].ts
// 删除照片（仅本人/管理员）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { authenticate, type Env } from '../../_shared/auth';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const photoId = context.params.id as string;
    const body = (await context.request.json()) as {
      student_id: string;
      password: string;
    };

    if (!body.student_id || !body.password) {
      return errorResponse('缺少 student_id 或 password', 400);
    }

    const auth = await authenticate(body.password, body.student_id, context.env);
    if (!auth.valid) return errorResponse('密码错误', 403);

    // 读取照片元数据
    const photo = await context.env.DB.prepare(
      'SELECT id, owner_id, url, category FROM photos WHERE id = ?'
    )
      .bind(photoId)
      .first<{ id: string; owner_id: string; url: string; category: string }>();

    if (!photo) return errorResponse('照片不存在', 404);

    // 权限：本人或管理员
    if (!auth.isAdmin && photo.owner_id !== body.student_id) {
      return errorResponse('无权删除此照片', 403);
    }

    // 从 R2 删除
    try {
      const key = photo.url.split('/').slice(-4).join('/'); // students/{id}/{cat}/{file}
      await context.env.PHOTOS.delete(key);
    } catch (e) {
      console.warn('R2 delete failed (continuing):', e);
    }

    // 从 D1 删除
    await context.env.DB.prepare('DELETE FROM photos WHERE id = ?')
      .bind(photoId)
      .run();

    // 从 students 表的 photo 数组中移除
    const colMap: Record<string, string> = {
      avatar: 'photos_avatar',
      life: 'photos_life',
      school: 'photos_school',
      future: 'photos_future',
      pet: 'pet_photo',
      handwritten: 'handwritten_photo',
    };
    const col = colMap[photo.category];
    if (col) {
      if (['avatar', 'pet', 'handwritten'].includes(photo.category)) {
        await context.env.DB.prepare(
          `UPDATE students SET ${col} = NULL, updated_at = unixepoch() WHERE ${col} = ?`
        )
          .bind(photo.url)
          .run();
      } else {
        const row = await context.env.DB.prepare(
          `SELECT ${col} FROM students WHERE id = ?`
        )
          .bind(photo.owner_id)
          .first<{ [k: string]: string | null }>();
        if (row?.[col]) {
          const arr: string[] = JSON.parse(row[col] as string);
          const filtered = arr.filter((u) => u !== photo.url);
          await context.env.DB.prepare(
            `UPDATE students SET ${col} = ?, updated_at = unixepoch() WHERE id = ?`
          )
            .bind(JSON.stringify(filtered), photo.owner_id)
            .run();
        }
      }
    }

    return jsonResponse({ deleted: true, id: photoId });
  } catch (e: any) {
    return errorResponse('删除失败', 500, e.message);
  }
};

// 查询单张照片
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const photoId = context.params.id as string;
  const photo = await context.env.DB.prepare(
    'SELECT * FROM photos WHERE id = ?'
  )
    .bind(photoId)
    .first();

  if (!photo) return errorResponse('照片不存在', 404);
  return jsonResponse(photo);
};
