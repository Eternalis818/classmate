// ─────────────────────────────────────────────
// functions/api/admin/auth.ts
// 管理员登录
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { verifyPassword, type Env } from '../../_shared/auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const { password } = (await context.request.json()) as { password: string };
    if (!password) return errorResponse('缺少密码', 400);

    if (!context.env.ADMIN_PASSWORD_HASH) {
      return errorResponse('管理员密码未配置', 500);
    }

    const valid = await verifyPassword(password, context.env.ADMIN_PASSWORD_HASH);
    if (!valid) return errorResponse('密码错误', 403);

    // 颁发一个简单的 token（生产环境应该用 JWT）
    const token = await hashToken(password + Date.now());
    return jsonResponse({ token, isAdmin: true, expires_in: 86400 });
  } catch (e: any) {
    return errorResponse('登录失败', 500, e.message);
  }
};

async function hashToken(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32);
}
