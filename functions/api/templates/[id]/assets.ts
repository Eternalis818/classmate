// ─────────────────────────────────────────────
// functions/api/templates/[id]/assets.ts
// POST /api/templates/:id/assets  上传主题素材（管理员）
// body: FormData { file, slot }
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../../_shared/cors';
import { isAdminPassword, type Env } from '../../../_shared/auth';

const ASSET_SLOTS = new Set([
  'heroBg', 'profileFrame', 'timelineMarker',
  'abilityBarBg', 'abilityBarFill',
  'envelopeClosed', 'envelopeOpen', 'stamp',
]);

const MAX_ASSET_MB = 5;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const id = String(context.params.id || '').trim().toLowerCase();
    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const slot = String(formData.get('slot') || '').trim();

    if (!/^[a-z0-9][a-z0-9-_]{0,79}$/.test(id)) return errorResponse('无效的主题 id', 400);
    if (!file) return errorResponse('缺少文件', 400);
    if (!slot || !ASSET_SLOTS.has(slot)) {
      return errorResponse('无效的 slot（必须是 heroBg/profileFrame/timelineMarker/abilityBarBg/abilityBarFill/envelopeClosed/envelopeOpen/stamp）', 400);
    }

    // 1) 鉴权
    const password = String(formData.get('password') || '');
    if (!(await isAdminPassword(password, context.env))) {
      return errorResponse('管理员密码错误', 403);
    }

    // 2) 文件校验
    const maxBytes = MAX_ASSET_MB * 1024 * 1024;
    if (file.size > maxBytes) return errorResponse(`文件超过 ${MAX_ASSET_MB}MB`, 413);
    if (!ALLOWED_TYPES.includes(file.type)) return errorResponse('只支持 PNG/JPEG/WebP/GIF', 415);

    // 3) 先确认主题存在，避免错误 id 产生 R2 孤儿对象
    const row = await context.env.DB.prepare('SELECT assets FROM templates WHERE id = ? AND is_public = 1')
      .bind(id)
      .first<{ assets: string | null }>();
    if (!row) return errorResponse('主题不存在', 404);

    // 4) 生成 R2 key
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const safeExt = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) ? ext : 'png';
    const key = `themes/${id}/${slot}.${safeExt}`;

    // 5) 上传 R2
    await context.env.PHOTOS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      cacheControl: 'public, max-age=31536000, immutable',
    });

    // 6) 合并 slot，写回 D1
    let assets: Record<string, string> = {};
    if (row.assets) {
      try { assets = JSON.parse(row.assets); } catch { /* ignore */ }
    }
    assets[slot] = key;
    await context.env.DB.prepare('UPDATE templates SET assets = ?, updated_at = unixepoch() WHERE id = ?')
      .bind(JSON.stringify(assets), id)
      .run();

    return jsonResponse({
      slot,
      key,
      url: `/api/themes/file/${key}`,
    }, { status: 201 });
  } catch (e: any) {
    return errorResponse('上传素材失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};
