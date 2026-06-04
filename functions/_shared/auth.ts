// ─────────────────────────────────────────────
// functions/_shared/auth.ts
// 密码验证（个人密码 + 管理员密码）
// ─────────────────────────────────────────────

export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD_HASH?: string;
  R2_PUBLIC_URL?: string;
}

export interface AuthContext {
  valid: boolean;
  isAdmin: boolean;
  studentId?: string;
}

const SALT_PREFIX = 'gradbook-2026-';

// SHA-256 + 盐 哈希（生产环境建议用 bcrypt）
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(SALT_PREFIX + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  const computed = await hashPassword(password);
  return timingSafeEqual(computed, hash);
}

// 防止时序攻击的字符串比较
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// 综合校验：管理员 OR 个人密码
export async function authenticate(
  password: string,
  studentId: string,
  env: Env
): Promise<AuthContext> {
  if (!password) return { valid: false, isAdmin: false };

  // 1) 管理员密码
  if (env.ADMIN_PASSWORD_HASH) {
    if (await verifyPassword(password, env.ADMIN_PASSWORD_HASH)) {
      return { valid: true, isAdmin: true, studentId };
    }
  }

  // 2) 个人密码
  const row = await env.DB.prepare(
    'SELECT id, password_hash FROM students WHERE id = ?'
  )
    .bind(studentId)
    .first<{ id: string; password_hash: string | null }>();

  if (row?.password_hash) {
    if (await verifyPassword(password, row.password_hash)) {
      return { valid: true, isAdmin: false, studentId: row.id };
    }
  }

  return { valid: false, isAdmin: false };
}
