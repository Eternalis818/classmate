# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**时光纪念册** — 给 12 岁女儿（张迤恩）的小升初毕业纪念册（松柏第二小学 · 六年级 4 班 · 2026 届）。前端页面用 Open Design 搭建。

**部署形态：Cloudflare Pages + Pages Functions + D1 + R2 的混合架构。** 静态页面（`*.html`）由 Pages 托管，业务 API 在 `functions/`，结构化数据存 D1（`gradbook-db`），上传原图存 R2（`gradbook-photos`）。无 npm 构建步骤、无 `node_modules`；前端每个 HTML 都是自包含单文件（内联 CSS+JS），后端 Functions 是 TypeScript 但**不经过编译**——Pages 直接执行 `functions/**/*.ts`。

## Architecture

### 数据流（读路径有回退，写路径必走云端）

- **读**：`student.html` 等 JS 渲染页会**优先请求 `/api/students/:id`**（D1），失败时回退到本地 `data/students.json`。所以 `data/*.json` 既是首次部署的种子来源，也是离线/D1 故障时的兜底。
- **写**：照片上传、留言、资料编辑、主题选择都 `fetch` 到 `/api/*`，写入 D1 / R2。
- 这意味着：**改了 `data/*.json` 不会反映到已部署站点**，除非重新跑 seed 迁移或通过 API 写入。

### 后端（`functions/`，Pages Functions 文件路由）

路由 = 文件路径。目录约定：

- `functions/_shared/` — 横切关注点，所有 API 都从这里引入：
  - `auth.ts` — `Env` 接口（`DB`/`PHOTOS`/`ADMIN_PASSWORD_HASH`/`MAX_UPLOAD_MB`/`R2_PUBLIC_URL`）、`authenticate()`、`hashPassword()`。**鉴权模型：管理员密码 OR 学生个人密码，二者任一通过即放行**。哈希算法是 SHA-256 + 固定盐前缀 `gradbook-2026-`（非 bcrypt，以 `auth.ts` 为准）。
  - `cors.ts` — `preflight()` / `jsonResponse()` / `errorResponse()`，每个 handler 开头都先 `const pre = preflight(req); if (pre) return pre;`。
  - `teachers.ts` / `templates.ts` — 领域读取工具。
- `functions/api/**` — 业务端点。命名模式：`students/[id].ts` 导出 `onRequestGet`/`onRequestPut`/`onRequestOptions`；嵌套资源用目录，如 `students/[id]/highlights.ts`、`messages/[id]/feature.ts`。
- **R2 代理端点**（无需鉴权）：`/api/photos/file/[[key]]`、`/api/themes/file/[[key]]`、`/api/class/file/[[key]]`。每个都**校验 key 前缀**（如 `themes/`、`class/`）做命名空间隔离，防止越权读其他 R2 对象。未配 `R2_PUBLIC_URL` 时，所有图片 URL 都走这些代理而非直连 R2 域名。

新增 API 时遵守的约定（看 `functions/api/students/[id].ts` 即模板）：handler 开头先 CORS preflight；写操作要 `authenticate()`；所有用户输入**就地长度截断 + 类型强转**（`String(x).trim().slice(0, N)`、`clamp(0..100)`），不依赖外部校验库；JSON 字段以字符串入库、读出时 `JSON.parse`。

### D1 schema（`migrations/`，按编号顺序应用）

核心表：

- `students` — 主键 `id`（`"01"`-`"55"`），`highlights`/`tags`/`stickers`/`pet_json` 都是 **JSON 字符串列**，能力值是 `abilities_swim`/`_tech`/`_resp` 三个 INTEGER 列，`password_hash` 存个人密码。
- `teachers` — `is_head_teacher=1` 的在老师寄语板块优先展示。
- `messages` — 个人（`type='personal'`，`to_student_id` 非空）与公开墙（`type='wall'`，`to_student_id` 为 NULL）**统一存这一张表**；`is_approved` 做审核。注意：`data/messages-wall.json` 只存公开墙留言的种子。
- `photos` — `owner_type`（student/teacher/message/theme）+ `owner_id` + `category`（avatar/life/school/future/pet/handwritten）。`student.html` 的相册区按 `category` 把照片分到 avatar/life/school/future/pet/handwritten 槽位。
- `templates` — 内置 11 套主题 + 管理员发布的自定义/AI 主题包；`assets` 列存 8 个素材槽位 JSON（heroBg/profileFrame/timelineMarker/abilityBarBg/abilityBarFill/envelopeClosed/envelopeOpen/stamp）。
- `class_config` — key-value 表，存班级共享配置（大合照 URL、班级口号、毕业日期等）。

迁移要按 `0001` → `0008` 顺序应用；本地和远端是两套独立状态。

### 主题系统（11 套）

每套主题对应 `templates/tokens-<id>.css` 的 `:root` CSS 变量（色板/渐变/粒子色/字体）。换主题 = 替换 `:root` 块。`students.template` 字段指定主题 ID。`delta-force` 与 `martial-legend` 额外有 R2 图片素材，通过 CSS 变量 `--asset-<slot>` + class `has-asset-<slot>` 注入 `student.html`；其余主题纯 CSS token。

| 主题 ID | 显示名称 | 色系 |
|--------|----------|------|
| starlight-admission | 星光录取通知书 | 米白+正红+烫金（⭐ 最受欢迎）|
| sakura-macaron | 樱花马卡龙 | 粉+薄荷绿+淡紫 |
| cosmic-exam | 星际答题卡 | 考卷白+铅笔灰+重点蓝 |
| martial-legend | 江湖风云榜 | 古铜+墨绿+朱红（有素材）|
| mint-journal | 薄荷手账 | 薄荷绿+奶白+淡粉 |
| cute-hamster | 萌系仓鼠 | 粉黄+蜜桃粉+草绿 |
| ancient-classic | 古风经典 | 靛蓝+金色+朱砂 |
| energy-pop | 活力波普 | 橘色+电光蓝+柠檬黄 |
| crayon-style | 蜡笔手绘 | 蜡笔彩色+涂鸦风 |
| imperial-scroll | 圣旨卷轴（御用） | 朱红+金（古风宫廷）|
| delta-force | 三角洲行动 | 军绿+战术黑+橙（有素材）|

### 页面关系

| 文件 | 用途 |
|------|------|
| `student.html` | **通用学生页**（JS 渲染，读 `?id=` → `/api/students/:id`，回退 `data/students.json`）。所有真实学生走这个。|
| `index.html` | 发起人个人纪念册（默认主入口）|
| `index-{theme}.html` | 主题预览页（starlight/sakura/cosmic/martial/mint/hamster/ancient/energy/crayon/delta）|
| `student-50.html` / `student-50-emperor.html` / `student-50-crayon.html` / `student-50-delta.html` | **50 号专属独立 Demo**，仅供展示主题排版，不接入 API；通用页只复用它们的 token/素材 |
| `class-homepage.html` | 班级首页（跳转到各同学页）|
| `onboarding.html` | 新用户引导页，已接云端：保存资料 → 上传压缩照片到 R2，顶栏有"班级管理"上传大合照 |
| `crop-tool.html` | 素材裁剪工具 |

### 9 大板块（每个学生页）

Hero 开屏 → 个人档案卡 → 闪光时刻(时间线) → 超能力(雷达图+进度条) → 宠物伙伴 → 同学留言板 → 老师寄语 → 未来信箱(可交互信封) → 尾页。

御用主题（`imperial-scroll`，见 `student-50-emperor.html`）改用古风命名：圣旨→皇家玉牒→编年史→武功秘籍→灵兽录→群臣奏折→太傅赠言→密旨锦囊→龙行天下，素材在 `assets/templates/martial-legend/`。

## Editing Conventions

- **CSS 变量统一管理**：颜色/间距/圆角/动画走 `:root`，禁止硬编码。
- **图片占位符**用 `.ph-img` 类，不链接外部 CDN。
- **`data-od-id`**：每个 `<section>` 必须有，供 Open Design 评论模式定位。
- **响应式断点**：920px（Grid 重构）/ 700px（Profile/Flex 重构）/ 600px（导航隐藏）。
- **交互**：时间线展开(`toggleDetail`)、信封开合(`toggleEnvelope`)、滚动渐入(`IntersectionObserver`)、能力条动画、Canvas 粒子。
- **AI 素材 PNG** 放 `assets/templates/{theme-id}/`，HTML 用相对路径；要全班共享则由管理员 `POST /api/templates/:id/assets` 上传到 R2。
- **新增学生**：复制 `data/students.json` 里 `id=01` 空模板，按需填充；生产环境数据应通过 API 写入 D1。
- **Functions 源码注释用中文**，与现有代码一致。

## Data Schema

学生对象完整结构见 `data/students.json` 中 `id=50`（`isFounder: true`），空模板见 `id=01`。D1 `students` 表字段与 JSON 基本一一对应。关键字段：`template`（主题 ID）、`abilities`（`{swimming,tech,responsibility}` 0-100）、`pet`（`{name,type,photo,desc}` 或 null）、`messages[]`（`type` 为 `personal`/`wall`）、`isFounder`、`stickers[]`、`password`（个人页密码，空=公开；首次云端提交时写入 D1 `password_hash`）。

`teachers.json` 中 `isHeadTeacher: true` 在老师寄语板块优先展示。`messages-wall.json` 仅存公开墙留言种子（`personal` 留言嵌入对应学生对象的 `messages` 数组中）。

## Commands

本项目无构建步骤。两种本地预览模式：

```bash
# ① 仅静态预览（快，但 /api/* 会 404，只适合调 HTML/CSS）
python -m http.server 50749
# → http://127.0.0.1:50749/

# ② 全栈本地预览（含 D1/R2/Functions，调 API/上传/留言必用）
npx wrangler pages dev . --port 8790 --ip 127.0.0.1 \
  --persist-to .wrangler/state --d1 DB --r2 PHOTOS \
  -b MAX_UPLOAD_MB=10 -b ADMIN_PASSWORD_HASH=<sha256哈希>

# 本地 D1 首次为空时，按顺序灌入迁移 + 种子（--local 表示本地状态）
npx wrangler d1 execute DB --local --persist-to .wrangler/state --file=./migrations/0001_init.sql
# … 0002 → 0008 依次执行；0003 是种子数据
```

远端 D1 迁移（部署时）：`wrangler d1 execute gradbook-db --file=./migrations/<N>.sql --remote`。

数据校验（种子文件完整性）：

```bash
jq '.students | length' data/students.json   # 应输出 55
jq '.teachers | length' data/teachers.json   # 应输出 8
```

Open Design 开发界面（编辑前端页面用，不是预览部署态）：`cd D:\ProgramData\open-design && pnpm tools-dev run web`。

## Key References

- `DEPLOYMENT-NOTES.md` — **部署检查清单 + 最新后端改动**，动后端前先读它（比本文件更细、更新）。
- `wrangler.toml` — D1/R2 绑定与环境变量（`ALLOWED_ORIGIN`/`MAX_UPLOAD_MB`/`ADMIN_PASSWORD_HASH`）。
- `DESIGN-PLAN.md` — 主题设计矩阵，15 张参考图的归纳方案。
- `.assetsignore` — 根目录部署时排除的文件（凭证说明、调试截图、迁移、Functions 源码不作为静态资源公开）。
- `.od-skills/` — Open Design skill 实例，运行时数据，**禁止提交**。
- 敏感凭证（管理员密码哈希、`.admin-credentials.local.md`）只在本地，不写入文档、不提交。
