// ─────────────────────────────────────────────
// functions/api/class/file/[[key]].ts
// GET /api/class/file/class/photo.<ext>  大合照代理（无需鉴权）
// 仅允许 class/ 前缀
// ─────────────────────────────────────────────

import { preflight, errorResponse } from '../../../_shared/cors';
import type { Env } from '../../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  const raw = context.params.key;
  const key = Array.isArray(raw) ? raw.join('/') : String(raw || '');

  if (!key || !key.startsWith('class/')) {
    return errorResponse('无效的路径', 400);
  }

  const object = await context.env.PHOTOS.get(key);
  if (!object) return errorResponse('文件不存在', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('access-control-allow-origin', '*');

  return new Response(object.body, { headers });
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};