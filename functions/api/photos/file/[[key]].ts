// ─────────────────────────────────────────────
// functions/api/photos/file/[[key]].ts
// GET /api/photos/file/students/:id/:category/:file
// R2 图片代理：未配置 R2_PUBLIC_URL 时，上传图片也能被页面直接显示
// ─────────────────────────────────────────────

import { preflight, errorResponse } from '../../../_shared/cors';
import type { Env } from '../../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const raw = context.params.key;
  const key = Array.isArray(raw) ? raw.join('/') : String(raw || '');
  if (!key || !key.startsWith('students/')) {
    return errorResponse('照片路径无效', 400);
  }

  const object = await context.env.PHOTOS.get(key);
  if (!object) return errorResponse('照片不存在', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', headers.get('cache-control') || 'public, max-age=31536000, immutable');
  headers.set('access-control-allow-origin', '*');

  return new Response(object.body, { headers });
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
