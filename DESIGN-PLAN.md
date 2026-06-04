# 时光纪念册 · 设计方案

> 基于15张同学提供的参考图片，制定在线纪念册的视觉设计方案。

---

## 一、参考图片风格分类（15张）

### A类：正式仪式风（4张，最高人气）

| 编号 | 风格名 | 核心特征 | 适合人群 |
|------|--------|----------|----------|
| 8_4 | 录取通知书 | 米白/棕色暖调，对称布局，复古正式 | 喜欢仪式感的同学 |
| 13_4 | 录取通知书·编织纹 | 白+深棕，编织纹理背景，印章元素 | 喜欢质感感的同学 |
| 14_4 | 录取通知书·活页 | 米白/灰色，活页装订孔，简约实用 | 喜欢简洁的同学 |
| 15_4 | 录取通知书·清华风 | 白+黑+红，硬壳封面，红色印章 | 向往名校的同学 |

**共同特征：** 仿录取通知书结构、正式边框、印章/红章、庄重而温馨

### B类：趣味创意风（3张）

| 编号 | 风格名 | 核心特征 | 适合人群 |
|------|--------|----------|----------|
| 4_4 | 答题卡 | 考试卡隐喻，正反两页，选项式填写 | 喜欢创意搞怪的同学 |
| 5_4 | 江湖风云榜 | 武侠主题，绿色封面，插画人物 | 喜欢古风/武侠的同学 |
| 7_4 | 试卷同学录 | "轻方测试B卷"，考试卷隐喻，卡通+怀旧 | 喜欢校园梗的同学 |

**共同特征：** 用"考试/武侠"等创意隐喻包装信息填写，趣味性强

### C类：可爱萌系风（5张）

| 编号 | 风格名 | 核心特征 | 适合人群 |
|------|--------|----------|----------|
| 6_4 | 马卡龙好友页 | 粉/紫/蓝/绿四色变体，卡通动物，柔和中性色 | 大众向，最百搭 |
| 9_4 | 治愈系手账 | 80页彩色可撕，马卡龙色系，模块化 | 喜欢手账/文艺的同学 |
| 10_4 | 日韩小清新 | 马卡龙色盘，网格布局，卡通动物，日系排版 | 喜欢日韩风的女生 |
| 11_4 | 萌系仓鼠 | 粉+黄，仓鼠卡通，"权威同学录" | 喜欢可爱风的女生 |
| 12_4 | 清新活泼卡通 | 浅蓝/白，Q版小熊，星星爱心装饰 | 男女皆宜 |

**共同特征：** 马卡龙色系、卡通动物插画、圆角、柔和感

### D类：传统中国风（2张）

| 编号 | 风格名 | 核心特征 | 适合人群 |
|------|--------|----------|----------|
| 2_4 | 古风龙凤 | 蓝金配色，龙凤图案，传统装帧 | 喜欢传统文化的同学 |
| 3_4 | 传统书签式 | 黄色边框，书法字体，古典表格 | 喜欢书卷气的同学 |

**共同特征：** 中国传统元素、书法字体、古典配色

---

## 二、设计方案：8套主题模板

将15张参考图片归纳为 **8套可实现的数字主题**，保留现有5套色板的基础，扩展为"色板+视觉隐喻"的完整主题：

### 主题1：starlight-admission（星光录取通知书）⭐ 推荐

- **灵感来源：** 图片8_4、13_4、14_4、15_4（录取通知书组）
- **主色调：** 米白 #FFF8F0 + 深棕 #5C3D2E + 印章红 #C41E3A + 金色 #B8860B
- **视觉隐喻：** 模拟录取通知书——正式边框、红色印章、金色封蜡
- **布局特点：**
  - Hero区：信封开启动画，展开"录取通知书"
  - Profile区：正式表格式布局，仿公文格式
  - 留言区：仿印章/邮戳风格
  - 信箱区：真实信封造型（红蜡封口）
- **CSS关键实现：**
  - `border: 3px double var(--gold)` 双线边框
  - 印章效果：圆形红底白字 + `border-radius: 50%` + `transform: rotate(-15deg)`
  - 纸张纹理：CSS gradient模拟（`repeating-linear-gradient` 做纸纹）
  - 封蜡效果：径向渐变 + box-shadow
- **适用人数预估：** 12-15人（最受欢迎风格）

### 主题2：sakura-macaron（樱花马卡龙）

- **灵感来源：** 图片6_4、9_4、10_4（马卡龙组）
- **主色调：** 粉色 #FFB6C1 + 薄荷绿 #98D8C8 + 淡紫 #DDA0DD + 奶油白 #FFFDD0
- **视觉隐喻：** 马卡龙甜点——圆润、柔和、甜蜜
- **布局特点：**
  - Hero区：彩色圆形气泡飘浮
  - Profile区：卡片式，大圆角，糖果色渐变
  - 留言区：便签纸风格，带图钉
  - 装饰：星星、爱心、小动物插画（CSS/SVG）
- **CSS关键实现：**
  - `border-radius: 24px` 大圆角
  - 柔和阴影：`box-shadow: 0 4px 20px rgba(255,182,193,0.3)`
  - 渐变：`linear-gradient(135deg, var(--pink), var(--mint))`
- **适用人数预估：** 10-12人

### 主题3：cosmic-exam（星际答题卡）

- **灵感来源：** 图片4_4、7_4（答题卡/试卷组）
- **主色调：** 考卷白 #FEFEFE + 铅笔灰 #666 + 重点蓝 #4169E1 + 批改红 #FF4444
- **视觉隐喻：** 考试卷/答题卡——横线、选择题、分数栏
- **布局特点：**
  - Hero区："毕业统一考试 · 综合卷" 标题格式
  - Profile区：选择题样式（A○姓名 B○班级...）
  - 能力区：分数栏格式（□□□/100）
  - 留言区："简答题"格式
  - 信箱区："附加题"格式
- **CSS关键实现：**
  - 横线纸效果：`repeating-linear-gradient(transparent, transparent 31px, #ddd 31px, #ddd 32px)`
  - 填空下划线：`border-bottom: 1px solid #333`
  - 批改红笔：手写体 + 红色
  - 页面折角：CSS triangle pseudo-element
- **适用人数预估：** 6-8人

### 主题4：martial-legend（江湖风云榜）

- **灵感来源：** 图片5_4（江湖风云榜）
- **主色调：** 古铜 #8B7355 + 墨绿 #2F4F4F + 朱红 #FF6347 + 宣纸黄 #F5F5DC
- **视觉隐喻：** 武侠江湖——卷轴、令牌、武功秘籍
- **布局特点：**
  - Hero区：卷轴展开动画，"XX大侠·江湖录"
  - Profile区：令牌造型，圆+方形组合
  - 能力区：武功招式名（"凌波微步"→体育能力）
  - 留言区：拜帖格式
  - 信箱区：密函/飞鸽传书造型
- **CSS关键实现：**
  - 卷轴效果：两端圆形木轴 + 中间可展开区域
  - 古风边框：`border-image` 用SVG
  - 毛笔字体：引入站酷高端黑或华文行楷
  - 水墨渐变：radial-gradient 模拟墨点
- **适用人数预估：** 4-6人

### 主题5：mint-journal（薄荷手账）

- **灵感来源：** 图片9_4（治愈系手账）
- **主色调：** 薄荷 #A8E6CF + 奶白 #FFF8E7 + 淡粉 #FFD3B6 + 浅灰文字 #555
- **视觉隐喻：** 手账/日记本——胶带、贴纸、手写感
- **布局特点：**
  - Hero区：手账封面，仿皮革纹理
  - Profile区：胶带固定的照片+便签
  - 时间线：手绘箭头连线
  - 留言区：彩色便签纸堆叠
  - 装饰：和纸胶带、纸屑、印章
- **CSS关键实现：**
  - 胶带效果：半透明色带 + `transform: rotate(-3deg)`
  - 便签堆叠：多层 `box-shadow` + 微旋转
  - 手绘线条：SVG path 模拟
  - 纸张层次：z-index + 微偏移
- **适用人数预估：** 6-8人

### 主题6：cute-hamster（萌系仓鼠）

- **灵感来源：** 图片11_4、12_4（萌系卡通组）
- **主色调：** 粉黄 #FFE4B5 + 蜜桃粉 #FFDAB9 + 草绿 #90EE90 + 橘黄 #FFA500
- **视觉隐喻：** 可爱动物朋友——仓鼠、小熊、兔子
- **布局特点：**
  - Hero区：大号卡通动物头像 + "CLASS BOOK" 标题
  - Profile区：动物头像框（猫耳朵、兔耳朵等边框）
  - 能力区：食物/星星评分（甜甜圈、棒棒糖代替进度条）
  - 留言区：气泡对话框造型
  - 装饰：爪印、毛线球、奶酪
- **CSS关键实现：**
  - 动物耳朵边框：CSS clip-path 或 pseudo-elements
  - 气泡对话框：`border-radius` + 三角尾巴
  - 食物图标：CSS绘制或内联SVG
  - 弹跳动画：`@keyframes bounce`
- **适用人数预估：** 6-8人

### 主题7：ancient-classic（古风经典）

- **灵感来源：** 图片2_4、3_4（古风组）
- **主色调：** 靛蓝 #1A237E + 金色 #FFD700 + 朱砂 #E64A19 + 宣纸 #F0E68C
- **视觉隐喻：** 古籍善本——线装书、龙凤纹、书法
- **布局特点：**
  - Hero区：线装书封面，龙凤/祥云纹样
  - Profile区：竖排文字，古籍书页布局
  - 时间线：卷轴/竹简展开
  - 留言区：题词/对联格式
  - 信箱区：飞鸽传书/锦囊造型
- **CSS关键实现：**
  - `writing-mode: vertical-rl` 竖排文字
  - 龙凤纹样：SVG背景
  - 线装书效果：中间装订线 + 左右页
  - 古风字体：引入楷体或仿宋
- **适用人数预估：** 3-5人

### 主题8：energy-pop（活力波普）

- **灵感来源：** 补充主题（无直接参考，但覆盖剩余需求）
- **主色调：** 橘色 #FF6B35 + 电光蓝 #00D4FF + 柠檬黄 #FFE66D + 热粉 #FF6B9D
- **视觉隐喻：** 波普艺术——大胆撞色、漫画分镜、能量感
- **布局特点：**
  - Hero区：漫画封面风格，爆炸对话框
  - Profile区：漫画分镜格子
  - 能力区：能量条 + 闪电图标
  - 留言区：漫画气泡
  - 装饰：漫画线条、音效文字（"BOOM!"）
- **CSS关键实现：**
  - 漫画半调网点：`radial-gradient` 重复小圆点
  - 粗黑边框：`border: 4px solid #000` + `box-shadow`
  - 倾斜布局：`transform: skew(-2deg)`
  - 爆炸文字：clip-path 星形
- **适用人数预估：** 3-5人

---

## 三、主题分配策略

### 分配原则

1. **学生自选优先：** 通过 editor.html 让学生从8套主题中自选
2. **默认推荐：** 未选择时根据学生数据推荐
3. **避免雷同：** 相邻学号尽量分配不同主题

### 默认推荐规则

```
if 学生有宠物 → 优先 cute-hamster（萌系）
if 学生标签含"学霸" → 优先 cosmic-exam（答题卡）
if 学生标签含"文艺" → 优先 mint-journal（手账）
if 学生标签含"古风" → 优先 ancient-classic（古风）
if 学生标签含"运动" → 优先 energy-pop（波普）
默认 → starlight-admission（录取通知书，最受欢迎）
```

### 主题ID映射

| 主题ID | 显示名称 | token文件 |
|--------|----------|-----------|
| starlight-admission | 星光录取通知书 | tokens-starlight-admission.css |
| sakura-macaron | 樱花马卡龙 | tokens-sakura-macaron.css |
| cosmic-exam | 星际答题卡 | tokens-cosmic-exam.css |
| martial-legend | 江湖风云榜 | tokens-martial-legend.css |
| mint-journal | 薄荷手账 | tokens-mint-journal.css |
| cute-hamster | 萌系仓鼠 | tokens-cute-hamster.css |
| ancient-classic | 古风经典 | tokens-ancient-classic.css |
| energy-pop | 活力波普 | tokens-energy-pop.css |

---

## 四、技术实现方案

### 架构变更

当前架构：1个 `student.html` + CSS变量换色
新架构：1个 `student.html` + **主题CSS文件** + **主题装饰层**

```
templates/
├── tokens-starlight-admission.css   # 色板+特效变量
├── tokens-sakura-macaron.css
├── tokens-cosmic-exam.css
├── tokens-martial-legend.css
├── tokens-mint-journal.css
├── tokens-cute-hamster.css
├── tokens-ancient-classic.css
├── tokens-energy-pop.css
├── decorations/                     # 主题装饰SVG
│   ├── stamp.svg                    # 印章（录取通知书用）
│   ├── scroll.svg                   # 卷轴（江湖用）
│   ├── tape.svg                     # 胶带（手账用）
│   ├── hamster.svg                  # 仓鼠（萌系用）
│   ├── dragon-phoenix.svg           # 龙凤（古风用）
│   └── ...                          # 更多装饰
└── preview.html                     # 8主题预览页
```

### CSS变量扩展

除了现有色板变量，新增"结构变量"：

```css
:root {
  /* 现有色板变量 */
  --color-primary: ...;
  --color-secondary: ...;

  /* 新增：结构变量 */
  --section-border-radius: 24px;     /* 马卡龙=24px, 古风=0px */
  --card-border-style: double;       /* 录取通知书=double, 考试=solid */
  --heading-font-family: serif;      /* 古风=楷体, 波普=黑体 */
  --body-font-family: sans-serif;
  --hero-layout: envelope;           /* envelope|scroll|cover|exam */
  --message-style: stamp;            /* stamp|note|bubble|scroll */
  --ability-style: bar;              /* bar|score|skill|food */

  /* 新增：动画变量 */
  --particle-shape: circle;          /* circle|star|petal|spark */
  --entrance-animation: fadeIn;      /* fadeIn|slideUp|unfold|bounce */
}
```

### student.html 渲染逻辑

```javascript
// 加载主题CSS
async function loadTheme(themeId) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `templates/tokens-${themeId}.css`;
  document.head.appendChild(link);

  // 根据主题变量渲染装饰层
  const heroLayout = getComputedStyle(document.documentElement)
    .getPropertyValue('--hero-layout').trim();

  renderHero(heroLayout);
  renderMessageStyle(/* ... */);
  renderAbilityStyle(/* ... */);
}
```

---

## 五、开发优先级

### Phase 1（核心3套主题，覆盖70%+学生）

1. **starlight-admission**（录取通知书）— 人气最高
2. **sakura-macaron**（马卡龙）— 大众百搭
3. **cosmic-exam**（答题卡）— 创意趣味

### Phase 2（扩展5套主题）

4. **cute-hamster**（萌系仓鼠）
5. **mint-journal**（薄荷手账）
6. **martial-legend**（江湖风云榜）
7. **ancient-classic**（古风经典）
8. **energy-pop**（活力波普）

---

## 六、9大板块 × 8主题 适配矩阵

| 板块 | 录取通知书 | 马卡龙 | 答题卡 | 江湖 | 手账 | 萌系 | 古风 | 波普 |
|------|-----------|--------|--------|------|------|------|------|------|
| Hero | 信封展开 | 气泡飘浮 | 发卷铃响 | 卷轴展开 | 翻开手账 | 动物探头 | 线装翻页 | 爆炸特效 |
| 档案卡 | 公文表格 | 糖果卡片 | 选择题 | 令牌 | 胶带贴照 | 动物相框 | 竖排书页 | 分镜格子 |
| 时间线 | 邮戳日期 | 彩色气球 | 批改日期 | 竹简 | 手绘箭头 | 爪印路径 | 卷轴展开 | 漫画面板 |
| 超能力 | 星级评分 | 糖果进度 | 分数栏 | 武功等级 | 手绘图表 | 食物评分 | 内功心法 | 能量条 |
| 宠物伙伴 | 宠物护照 | 糖果卡片 | 填空题 | 灵兽录 | 贴纸页 | 动物朋友 | 瑞兽图鉴 | 宠物漫画 |
| 留言板 | 邮票便签 | 糖果便签 | 简答题 | 拜帖 | 彩色便签 | 气泡对话 | 题词 | 漫画气泡 |
| 老师寄语 | 官方印章 | 温馨卡片 | 评语栏 | 师傅赠言 | 手写信 | 老师卡片 | 题字 | 旁白框 |
| 未来信箱 | 红蜡信封 | 糖果信封 | 附加题 | 密函 | 手账信 | 动物信使 | 锦囊 | 漫画预告 |
| 尾页 | 邮戳尾印 | 彩虹祝福 | 交卷 | 江湖再见 | 合上日记 | 拥抱告别 | 封卷 | 待续 |

---

## 七、与现有系统的兼容

- 保留 `student-50.html` 和 `index.html` 作为V1版本
- 新主题系统通过 `student.html` 的JS动态渲染实现
- `students.json` 中 `template` 字段更新为新主题ID
- 旧主题文件（starry-purple等）保留兼容

---

*设计方案 v1.0 · 基于15张参考图片分析 · 待确认后进入开发*
