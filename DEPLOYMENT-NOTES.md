# Cloudflare 部署检查记录

项目当前是 Cloudflare Pages + Pages Functions + D1 + R2 的混合架构，不再是纯静态 HTML。

## 现状

- 静态页面由 Pages 托管，`wrangler.toml` 使用 `pages_build_output_dir = "."`。
- API 位于 `functions/`，依赖 Pages Functions 文件路由。
- 学生、老师、留言、照片元数据存 D1：`gradbook-db`。
- 上传原图存 R2：`gradbook-photos`。
- `student.html` 会优先读 `/api/students/:id`，失败时回退到 `data/students.json`。

## 本次修正

- 照片上传后端不再写不存在的 `students.photos_*` 列，照片真实来源统一为 `photos` 表。
- 未配置 `R2_PUBLIC_URL` 时，上传图片 URL 改为 `/api/photos/file/...`，由 Pages Function 从 R2 代理输出，避免出现 `r2.example.com` 占位图。
- `student.html` 的相册区改为始终显示，新同学没有照片时也能看到“上传照片”入口。
- 新增 `PUT /api/students/:id/template`，主题选择可用本人密码或管理员密码保存到 D1。
- 主题切换弹窗改为显示中文主题名，内置 `delta-force`、`imperial-scroll`、`crayon-style` 都可被通用学生页选择。
- 新增 `templates` 表与 `/api/templates`，自定义/AI 主题包可由管理员发布到全班共享主题库。
- 新增 `PUT /api/students/:id`，支持学生资料、首次密码设置、隐私、能力值、闪光时刻和未来信箱保存到 D1。
- `onboarding.html` 的“一键生成”已接入云端：先保存学生资料，再把本机压缩照片上传到 R2。
- 老师资料已接入 `/api/teachers` 与 `/api/teachers/:id`；首页会优先读取 D1 老师数据，班主任寄语可用管理员密码同步保存。
- 新增 `.assetsignore`，避免根目录部署时把本地凭证说明、调试截图、迁移和 Functions 源码作为静态资源公开。
- 新增 `migrations/0006_template_assets.sql`，给 `templates` 表加 `assets TEXT` 列，存 8 个素材槽位 JSON。
- 新增 `POST /api/templates/:id/assets`（管理员），上传主题素材（heroBg/profileFrame/timelineMarker/abilityBarBg/abilityBarFill/envelopeClosed/envelopeOpen/stamp）到 R2，写入 D1 `assets` 字段。
- 新增 `GET /api/themes/file/[[key]]`（无需鉴权），从 R2 代理主题素材图片，key 必须以 `themes/` 开头，安全隔离 students/ 等其他 R2 对象。
- 主题素材通过 CSS 变量（`--asset-<slot>`）+ class（`has-asset-<slot>`）注入 `student.html`，delta-force 和 martial-legend 已补全全部 8 个素材槽位。
- `student.html` 换主题弹窗的缩略图会显示 heroBg 背景图。
- `onboarding.html` AI 生成模态框新增"上传 hero 背景图"入口，支持 AI 主题附带一张全屏背景图。
- 新增 `migrations/0007_class_config.sql`，建立 `class_config` key-value 表存班级共享配置（大合照、班级口号、毕业日期等）。
- 新增 `GET /api/class/config`（无需鉴权），所有学生页加载时读取共享配置。
- 新增 `POST /api/class/config`（管理员），可更新 `class_photo_url/class_slogan/graduation_date/school_name`。
- 新增 `POST /api/class/photo`（管理员），上传大合照到 R2 `class/photo.<ext>`，URL 写入 `class_config.class_photo_url`。
- 新增 `GET /api/class/file/[[key]]`（无需鉴权），从 R2 代理大合照，key 必须以 `class/` 开头。
- `student.html` 的 Hero 区现在自动从 `/api/class/config` 读取 `class_photo_url`，若已配置则显示"点击查看大合照"徽章，点击放大查看。
- `onboarding.html` 顶栏新增"🏫 班级管理"按钮，可上传/预览大合照。

## 尚未完全闭环

- 学生个人密码现在可在第一次云端提交时写入 D1；如果管理员第一次代填，管理员密码不会被写成学生密码。
- 老师头像上传尚未接入 R2；当前老师资料 D1 化优先覆盖姓名、角色、寄语等文本字段，避免把 base64 大图写入 D1。
- 自定义/AI 主题发布到全班共享需要管理员密码；取消管理员密码时仍只保存到本机。
- AI 主题仅支持 heroBg 单图上传，其他 7 个素材槽位本期不支持上传。
- `student-50-emperor.html`、`student-50-crayon.html`、`student-50-delta.html` 是 50 号专属独立 Demo；通用学生页只复用它们的 token/素材，不会 1:1 复刻所有专属排版。
- delta-force 和 martial-legend 以外的 9 套内置主题本次不动，仍走纯 CSS token，无图片素材。

## 部署前检查

1. Cloudflare Pages 项目绑定 D1：`DB = gradbook-db`。
2. Cloudflare Pages 项目绑定 R2：`PHOTOS = gradbook-photos`。
3. 环境变量至少配置：
   - `ADMIN_PASSWORD_HASH`
   - `MAX_UPLOAD_MB=10`
   - 可选 `R2_PUBLIC_URL`，不配也能走 `/api/photos/file/...` 代理。
4. 按顺序应用远端 D1 迁移：
   - `migrations/0001_init.sql`
   - `migrations/0002_messages_featured.sql`
   - `migrations/0003_seed_data.sql`
   - `migrations/0004_set_founder_delta_theme.sql`
   - `migrations/0005_shared_templates.sql`
   - `migrations/0006_template_assets.sql`
   - `migrations/0007_class_config.sql`
5. 部署后验证：
   - `/api/students/50`
   - `/api/teachers`
   - `/api/templates`
   - `/api/templates/delta-force`（验证 assets 字段）
   - `/api/themes/file/themes/delta-force/hero.png`（验证 R2 代理）
   - `/api/class/config`（验证 class_config 表）
   - `/api/photos/file/students/...` 上传后返回的图片 URL
   - `student.html?id=50` 的主题切换和上传照片弹窗
   - `student.html?id=50` 选择 delta-force 主题后验证素材（HUD 边角、能力条、信封等）是否正常显示
   - 在 `onboarding.html` 点击"🏫 班级管理"上传大合照，刷新 `student.html?id=50` 验证 Hero 区显示大合照徽章

## 本地 Functions 验证

普通 `python -m http.server 50749` 只能验证静态页面，`/api/*` 会 404。要验证数据库、上传和 Pages Functions，使用 Wrangler，并显式绑定本地资源：

```bash
npx wrangler pages dev . --port 8790 --ip 127.0.0.1 --persist-to .wrangler/state --d1 DB --r2 PHOTOS -b MAX_UPLOAD_MB=10 -b ADMIN_PASSWORD_HASH=8db33f465e1f936cc5142ecde6c3dbfa1dc4fadef81f8bca86ca7bfa797bba89
```

如果本地 D1 首次为空，先执行：

```bash
npx wrangler d1 execute DB --local --persist-to .wrangler/state --file=./migrations/0001_init.sql
npx wrangler d1 execute DB --local --persist-to .wrangler/state --file=./migrations/0003_seed_data.sql
npx wrangler d1 execute DB --local --persist-to .wrangler/state --file=./migrations/0004_set_founder_delta_theme.sql
npx wrangler d1 execute DB --local --persist-to .wrangler/state --file=./migrations/0005_shared_templates.sql
npx wrangler d1 execute DB --local --persist-to .wrangler/state --file=./migrations/0006_template_assets.sql
```
