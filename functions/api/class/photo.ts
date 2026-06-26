// ─────────────────────────────────────────────
// functions/api/class/photo.ts
// POST /api/class/photo  上传大合照（仅管理员）
// multipart: file + password
// 存到 R2 class/photo.<ext>，URL 写入 class_config.class_photo_url
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { isAdminPassword, type Env } from '../../_shared/auth';

const MAX_CLASS_PHOTO_MB = 20;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    // 1) 鉴权
    const formData = await context.request.formData();
    const password = String(formData.get('password') || '');
    if (!(await isAdminPassword(password, context.env))) {
      return errorResponse('管理员密码错误', 403);
    }

    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('缺少文件', 400);

    const maxBytes = MAX_CLASS_PHOTO_MB * 1024 * 1024;
    if (file.size > maxBytes) return errorResponse(`文件超过 ${MAX_CLASS_PHOTO_MB}MB`, 413);
    if (!ALLOWED_TYPES.includes(file.type)) return errorResponse('只支持 JPEG/PNG/WebP', 415);

    // 2) 生成 R2 key
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const key = `class/photo.${safeExt}`;

    // 3) 上传到 R2（覆盖旧图）
    await context.env.PHOTOS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      cacheControl: 'public, max-age=31536000, immutable',
    });

    // 4) 写入 D1
    const publicUrl = context.env.R2_PUBLIC_URL
      ? `${context.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
      : `/api/class/file/${key}`;

    await context.env.DB.prepare(
      'INSERT OR REPLACE INTO class_config (key, value, updated_at) VALUES (?, ?, unixepoch())'
    )
      .bind('class_photo_url', publicUrl)
      .run();

    return jsonResponse({ url: publicUrl, key, file_size: file.size }, { status: 201 });
  } catch (e: any) {
    return errorResponse('上传大合照失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};