// ─────────────────────────────────────────────
// functions/api/class/config.ts
// GET /api/class/config  读取全班共享配置（无需鉴权）
// POST /api/class/config  更新配置（仅管理员）
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { isAdminPassword, type Env } from '../../_shared/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const { results } = await context.env.DB.prepare(
      'SELECT key, value, updated_at FROM class_config ORDER BY key'
    ).all();
    return jsonResponse({ config: results || [] });
  } catch (e: any) {
    return errorResponse('读取配置失败', 500, e.message);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const body = (await context.request.json()) as {
      key: string;
      value: string;
      password?: string;
    };

    if (!body.key || body.value === undefined) {
      return errorResponse('缺少 key 或 value', 400);
    }

    // 允许的 key 白名单
    const ALLOWED_KEYS = ['class_photo_url', 'class_slogan', 'graduation_date', 'school_name'];
    if (!ALLOWED_KEYS.includes(body.key)) {
      return errorResponse(`无效的 key（允许：${ALLOWED_KEYS.join(', ')}）`, 400);
    }

    const password = body.password || '';
    if (!(await isAdminPassword(password, context.env))) {
      return errorResponse('管理员密码错误', 403);
    }

    await context.env.DB.prepare(
      'INSERT OR REPLACE INTO class_config (key, value, updated_at) VALUES (?, ?, unixepoch())'
    )
      .bind(body.key, String(body.value))
      .run();

    return jsonResponse({ key: body.key, value: body.value, updated: true });
  } catch (e: any) {
    return errorResponse('更新配置失败', 500, e.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return preflight(context.request) || new Response(null, { status: 204 });
};