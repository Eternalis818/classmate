# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**时光纪念册** — 给12岁女儿（张迤恩）的小升初毕业纪念册（松柏第二小学 · 六年级4班 · 2026届）。前端用 Open Design 搭建，计划搭配轻量化服务器。

**纯静态 HTML 项目**：无构建步骤、无包管理器，所有页面均为自包含单文件（内联 CSS+JS）。

## Architecture

### 目录结构

```
data/                       # 数据层
├── students.json           # 55位同学（id=01 空模板，id=50 发起人完整示例）
├── teachers.json           # 8位老师（T01 周黎已填，其余待录入）
└── messages-wall.json      # 全班公开留言墙

templates/
├── tokens-*.css            # 10套主题 Token CSS 变量
└── index.html              # 主题预览页

photos/                     # 学生/老师/留言照片
├── 50/                     # 发起人专属（avatar/life/school/future/pet）
├── teachers/
└── messages/               # 手写留言照片

assets/templates/<theme>/   # AI 生成素材（卷轴/印章/边框/粒子 PNG）
pic/                        # 15张参考图片
DESIGN-PLAN.md              # 设计方案（主题设计矩阵）

*.html                      # 自包含页面
*.artifact.json             # Open Design 元数据（status/exports/renderer）

.od-skills/                 # ⚠️ Open Design skill 实例（运行时数据，禁止提交）
```

### 页面关系

| 文件 | 用途 | 渲染方式 |
|------|------|----------|
| `index.html` | 发起人个人纪念册（默认主入口） | 纯静态 |
| `index-{theme}.html` | 9 个主题预览页（starlight/sakura/cosmic/martial/mint/hamster/ancient/energy/crayon） | 纯静态 |
| `student-50.html` | 发起人完整页，**starlight-admission 主题** | 纯静态 |
| `student-50-emperor.html` | "朕的同学录"御用主题 Demo（圣旨卷轴） | 纯静态 |
| `student-50-crayon.html` | 发起人蜡笔手绘版 Demo | 纯静态 |
| `student.html` | 通用学生页模板（JS 动态加载 `students.json`） | JS 渲染 |
| `class-homepage.html` | 班级首页（链接到各同学页） | 跳转页 |
| `onboarding.html` | 新用户引导/介绍页 | 纯静态 |
| `crop-tool.html` | 素材裁剪工具 | 纯静态 |
| `editor.html` | 数据录入页（**规划中**，data/_note 引用） | 待实现 |

### 主题系统（10 套）

每套主题对应 `templates/tokens-<id>.css`，定义 `:root` CSS 变量（色板/渐变/粒子色/字体）。换主题 = 替换 `:root` 块。`students.json` 中 `template` 字段指定主题 ID。

| 主题ID | 显示名称 | 色系 | 适用人群 |
|--------|----------|------|----------|
| starlight-admission | 星光录取通知书 | 米白+正红+烫金 | ⭐ 最受欢迎 |
| sakura-macaron | 樱花马卡龙 | 粉+薄荷绿+淡紫 | 女生 |
| cosmic-exam | 星际答题卡 | 考卷白+铅笔灰+重点蓝 | 男生 |
| martial-legend | 江湖风云榜 | 古铜+墨绿+朱红 | 中性偏男 |
| mint-journal | 薄荷手账 | 薄荷绿+奶白+淡粉 | 中性 |
| cute-hamster | 萌系仓鼠 | 粉黄+蜜桃粉+草绿 | 男女皆宜 |
| ancient-classic | 古风经典 | 靛蓝+金色+朱砂 | 男女皆宜 |
| energy-pop | 活力波普 | 橘色+电光蓝+柠檬黄 | 男女皆宜 |
| crayon-style | 蜡笔手绘 | 蜡笔彩色+涂鸦风 | 男女皆宜 |
| imperial-scroll | 圣旨卷轴（御用） | 朱红+金 | 古风宫廷 |
| delta-force | 三角洲行动 | 军绿+战术黑+橙 | 男生（**仅素材，无 tokens CSS**）|

### 9 大板块（每个学生页）

Hero开屏 → 个人档案卡 → 闪光时刻(时间线) → 超能力(雷达图+进度条) → 宠物伙伴 → 同学留言板 → 老师寄语 → 未来信箱(可交互信封) → 尾页

### 御用主题（imperial-scroll）

`student-50-emperor.html` 是独立 Demo，古风金龙风格，命名体系：
圣旨(Hero) → 皇家玉牒(Profile) → 编年史(Timeline) → 武功秘籍(Abilities) → 灵兽录(Pet) → 群臣奏折(Messages) → 太傅赠言(Teacher) → 密旨锦囊(Letter) → 龙行天下(Finale)

特效：金色粒子飘落、圣旨卷轴展开、密旨锦囊点击开合、能力条武林等级。素材在 `assets/templates/martial-legend/`。CSS 变量：`--gold`/`--red`/`--parchment`/`--ink`。

## Editing Conventions

- **CSS 变量统一管理**：颜色/间距/圆角/动画参数走 `:root`，禁止硬编码
- **图片占位符**：用 `.ph-img` 类，不链接外部 CDN
- **`data-od-id`**：每个 `<section>` 必须有，供 Open Design 评论模式定位
- **响应式断点**：920px（Grid 重构）/ 700px（Profile/Flex 重构）/ 600px（导航隐藏）
- **交互**：时间线展开(`toggleDetail`)、信封开合(`toggleEnvelope`)、滚动渐入(`IntersectionObserver`)、能力条动画、Canvas 粒子
- **AI 素材**：Image 2.0 生成的 PNG 放 `assets/templates/{theme-id}/`，HTML 中用相对路径
- **新增学生**：复制 `id=01` 模板对象到 `students.json`，按需填充字段

## Data Schema

学生对象完整结构见 `data/students.json` 中 `id=50`（`isFounder: true`）。空模板见 `id=01`。关键字段：

- `template`：主题 ID（10 套之一）
- `abilities`：`{swimming, tech, responsibility}` 0-100
- `pet`：`{name, type, photo, desc}` 或 `null`
- `messages[]`：同学留言，`type` 为 `personal`（个人）或 `wall`（全班公开）
- `isFounder`：发起人标记，显示金色皇冠徽章
- `stickers[]`：从 `stickers` 分类中选取
- `password`：个人页密码（空=公开）

`teachers.json` 中 `isHeadTeacher: true` 在老师寄语板块优先展示。`messages-wall.json` 仅存公开留言（`personal` 留言嵌入对应学生对象的 `messages` 数组中）。

## Design Decisions

- 女儿偏好"朕的同学录"古风金龙风格（参考图 2_4 + 4_4）
- 15 张参考图归纳方案详见 `DESIGN-PLAN.md`
- 御用主题对应 `imperial-scroll`，发起人专属 Demo 是 `student-50-emperor.html`
- Phase 1 优先主题：starlight-admission / sakura-macaron / cosmic-exam（覆盖 70%+ 学生）
- 多数主题已有 tokens，但**未全部集成**到 `student.html` 通用模板（部分仅有 Demo 主题页）

## Commands

本项目**无构建步骤、无包管理器**。开发流程：

```bash
# 本地预览（推荐，避免 file:// 下 fetch JSON 失败）
cd "D:/ProgramData/open-design/.od/projects/44c24b95-8998-4c54-9c05-1073e1273148"
python -m http.server 50749
# 浏览器打开 http://127.0.0.1:50749/
```

数据校验（确保录入完整）：

```bash
jq '.students | length' data/students.json   # 应输出 55
jq '.teachers | length' data/teachers.json   # 应输出 8
```

## Preview

- **Open Design 开发界面**：`cd D:\ProgramData\open-design && pnpm tools-dev run web`（端口动态分配）
- **本地预览**：`python -m http.server 50749`（推荐，避开 file:// 限制）
- **直接打开**：双击 `.html`（`fetch` JSON 会失败，慎用）
