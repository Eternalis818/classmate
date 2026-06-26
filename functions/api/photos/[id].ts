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
      const marker = '/api/photos/file/';
      const key = photo.url.includes(marker)
        ? photo.url.slice(photo.url.indexOf(marker) + marker.length)
        : photo.url.split('/').slice(-4).join('/'); // students/{id}/{cat}/{file}
      await context.env.PHOTOS.delete(key);
    } catch (e) {
      console.warn('R2 delete failed (continuing):', e);
    }

    // 从 D1 删除
    await context.env.DB.prepare('DELETE FROM photos WHERE id = ?')
      .bind(photoId)
      .run();

    await context.env.DB.prepare('UPDATE students SET updated_at = unixepoch() WHERE id = ?')
      .bind(photo.owner_id)
      .run();

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
