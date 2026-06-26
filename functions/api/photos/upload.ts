// ─────────────────────────────────────────────
// functions/api/photos/upload.ts
// ❶ 照片上传 → R2 存储 + D1 元数据
// ─────────────────────────────────────────────

import { preflight, jsonResponse, errorResponse } from '../../_shared/cors';
import { authenticate, hashPassword, type Env } from '../../_shared/auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const pre = preflight(context.request);
  if (pre) return pre;

  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;
    const studentId = formData.get('student_id') as string | null;
    const password = formData.get('password') as string | null;

    // 1) 参数校验
    if (!file) return errorResponse('缺少文件', 400);
    if (!category) return errorResponse('缺少分类', 400);
    if (!studentId) return errorResponse('缺少学生 ID', 400);

    const validCategories = ['avatar', 'life', 'school', 'future', 'pet', 'handwritten'];
    if (!validCategories.includes(category)) {
      return errorResponse('无效的分类', 400, { allowed: validCategories });
    }

    // 2) 鉴权：无密码时自动视为"首次设置密码"（学生本人无密码 + 无 admin）
    let auth = await authenticate(password || '', studentId, context.env);
    if (!auth.valid && !password) {
      // 空密码：首次上传，自动把密码写进 students 表
      const hash = await hashPassword('');
      await context.env.DB.prepare(
        'UPDATE students SET password_hash = ?, updated_at = unixepoch() WHERE id = ? AND password_hash IS NULL'
      )
        .bind(hash, studentId)
        .run();
      auth = { valid: true, isAdmin: false, studentId };
    } else if (!auth.valid) {
      return errorResponse('密码错误', 403);
    }

    // 3) 文件大小校验（默认 10MB）
    const maxMB = parseInt(context.env.MAX_UPLOAD_MB || '10', 10);
    if (file.size > maxMB * 1024 * 1024) {
      return errorResponse(`文件超过 ${maxMB}MB`, 413);
    }

    // 4) 文件类型校验
    if (!file.type.startsWith('image/')) {
      return errorResponse('只支持图片文件', 415);
    }

    // 5) 生成 R2 key
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif'].includes(ext) ? ext : 'jpg';
    const photoId = crypto.randomUUID();
    const key = `students/${studentId}/${category}/${photoId}.${safeExt}`;

    // 6) 上传到 R2
    await context.env.PHOTOS.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        studentId,
        category,
        uploadedBy: auth.isAdmin ? 'admin' : studentId,
      },
    });

    // 7) 生成可访问 URL：有 R2 自定义域名时直出，否则走 Pages Function 代理
    const publicUrl = context.env.R2_PUBLIC_URL
      ? `${context.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
      : `/api/photos/file/${key}`;

    // 8) 写入 D1 元数据
    await context.env.DB.prepare(
      `INSERT INTO photos (id, owner_type, owner_id, category, url, file_size, created_at)
       VALUES (?, 'student', ?, ?, ?, ?, unixepoch())`
    )
      .bind(photoId, studentId, category, publicUrl, file.size)
      .run();

    // 9) 照片真实来源统一为 photos 表；students 表只更新时间戳，避免多处状态不一致
    await context.env.DB.prepare('UPDATE students SET updated_at = unixepoch() WHERE id = ?')
      .bind(studentId)
      .run();

    return jsonResponse({
      id: photoId,
      url: publicUrl,
      key,
      category,
      student_id: studentId,
      file_size: file.size,
      content_type: file.type,
    });
  } catch (e: any) {
    console.error('Upload error:', e);
    return errorResponse('上传失败', 500, e.message);
  }
};
