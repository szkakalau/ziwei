# 🔮 海外占星/命理类产品 设计研究

> 研究时间：2026-06-18 | 覆盖：Co-Star、The Pattern、CHANI、Sanctuary、Stardust、Nebula、Cosmos AI 等

---

## 一、市场格局

| 产品 | 月收入（估） | 核心差异化 | 设计哲学 |
|------|------------|-----------|---------|
| **Co-Star** | ~$4.99/月 | AI + NASA数据，极简黑白 | 反装饰、文字驱动、冷感高端 |
| **CHANI** | **$832K/月** (iOS) | 纯人工内容，冥想+疗愈 | 温暖、无AI、品牌信任 |
| **The Pattern** | ~$400K/月 | 心理模式识别，社交链接 | 卡片驱动、彩色暗黑、社交化 |
| **Stardust** | **$397K/月** | 经期追踪×占星 | 女性化、刚需高频、伴侣社交 |
| **Nebula** | 未公开 | 1500+真人顾问+冥想 | Netflix式设计、克制高端 |
| **Sanctuary** | ~$20/月 | AI + 真人占星师混血 | 温暖教育、对话式 |

---

## 二、头部产品深度拆解

### 1. Co-Star — 极简黑白的标杆

**来源**: [Pratt Institute 设计批判](https://www.ixd.prattsi.org/2024/09/design-critique-co-star-ios-app/), [Lunar Guide 2026 Review](https://www.lunarguideapp.com/blog/co-star-astrology-app-review-2026), [Autviz 技术拆解](https://www.autviz.com/how-to-develop-an-astrology-app-like-co-star-step-by-step-guide/)

**设计 DNA**：
- 纯黑白界面，无广告、无动图、无花哨按钮。用户描述为"像翻纸质日记"
- 小字号 + 抽象图标 → 故意制造"稀缺感"和"私密感"
- 极简到连导航都只有 2 个 tab（Chart + Friends）

**关键交互**：
- **VOID 功能**：付费问答，加载时显示星云动画——"营造星星正在实时绘制的错觉"
- **推送**："简短、神秘、俳句式的通知"，打开率是普通推送的 3-5 倍
- **社交**：朋友对比、兼容性分享卡片

**踩坑点（别学）**：
- 导航无进度指示器，用户不知道还有几步
- 可点击元素没有 signifier（用户靠试错发现）
- 最近 v5.35 更新砍掉三层 transit 数据，用户大量流失
- "Rude AI" 内容被用户投诉

### 2. CHANI — 最赚钱的反模式

**来源**: [Huxiu CHANI vs Stardust](https://www.huxiu.com/article/4819755.html), [Retention.blog](https://www.retention.blog/p/whats-your-sign)

**核心数据**：
- 月收入 $83.2 万 | 同比 +15% | 生命周期收入 $3100 万
- 每下载收入 $25-50 | 订阅 $11.99/月
- **转化率估算 40-50%**（极高）

**设计反模式（但有效）**：
- 登录页无需 SSO，注册需填 5 个字段 + 邮箱验证
- 验证邮件里没有回 App 的链接
- 进入 App 后先展示免费内容列表，"通常会降低付费意愿"
- 付费按钮需要滚动才能看到，月/年选项**都不默认选中**

**核心逻辑**：品牌驱动。CHANI 的粉丝从创始人 Chani Nicholas 的占星内容转化而来，先爱内容再付费。高摩擦筛选出高忠诚用户。

**可抄的点**：
- ✅ 进入主页前先展示一段今日解读——"让用户立即感知价值"
- ✅ 付费墙延迟展示——"先建立使用习惯，再货币化"
- ✅ 订阅会员专属音频内容（冥想、肯定语）——"预测→应对"闭环

### 3. The Pattern — 社交化的卡片系统

**来源**: [Pratt Institute 设计批判](https://www.ixd.prattsi.org/2023/02/design-critique-the-pattern/), [ScreensDesign](https://screensdesign.com/showcase/the-pattern)

**设计 DNA**：
- 暗色背景 + 蓝色/青色点缀，卡片式布局
- 去星座化——用"信任自己""恐惧或犹豫"等心理语言替代占星术语
- Dashboard 卡片 + 音频叙事 + 动效饼图

**关键交互**：
- **Bonds 功能**：兼容性用动态饼图展示，可视化强
- **Shared Experiences**：连接有相同人格特质的用户
- **音频**：每个特质配有个人音频叙事 + 完整文字稿（可访问性）

**踩坑**：
- 卡片导航无进度指示——不知道还有多少特质
- "Skip for now" 按钮难点击

### 4. Stardust — 反向路径：刚需+占星

**来源**: [Huxiu 分析](https://www.huxiu.com/article/4819755.html)

**核心创新**：
- 找到经期追踪这个**天然高频刚需** → 融入占星差异化
- "月经周期和月亮周期都是约 28 天"作为产品语言
- **伴侣模式**：1/3 用户邀请伴侣使用——社交裂变

**可抄的核心策略**：
- ✅ 将命理/占星**嵌入已有高频行为**，而非期望用户每天为"算运势"打开 App
- ✅ 社交功能不限于产品内——分享卡片是增长引擎

### 5. Nebula — Netflix 化的设计

**来源**: [PRINT Magazine](https://www.printmag.com/branding-identity-design/spirituality-rebranded-nebulas-new-identity-turns-astrology-into-a-full-scale-guidance-system/)

**设计 DNA**：
- Moving Brands（Netflix 品牌代理）操刀
- Logo 是侧脸轮廓——"向内看的隐喻"
- 色彩："用克制取代天体杂乱的渐变"
- 产品从"算命热线"→"日常仪式"→"精神流媒体"

**品牌策略**：
- Tagline：**"Awaken Here"**
- 视觉语言从科技/流媒体/健康品牌借鉴，而非传统灵性图案
- **用极简赢取信任**，而非堆砌神秘元素

---

## 三、设计模式提炼——7 大维度

### 🎨 视觉设计

| 模式 | 采用者 | 描述 |
|------|-------|------|
| **暗黑极简** | Co-Star, Nebula | 黑/白 + 微小点缀色，文字驱动 |
| **暗黑卡片** | The Pattern, Cosmos AI | 暗底 + 青色/金色点缀，卡片式信息分层 |
| **温暖教育** | Sanctuary, CHANI | 暖色调、大字体、解释性语言 |
| **去神秘化** | The Pattern, Nebula | 刻意不用星星/月亮/Zodiac wheels |
| **渐变宇宙** | Cosmos AI, Dribbble 设计 | 深紫+金色渐变，玻璃态，现代神秘 |

### 🧭 布局策略

| 模式 | 来源 | 关键做法 |
|------|------|---------|
| **Tab 极简** | Co-Star | 2 tab（阅读+社交），内容为王 |
| **Dashboard 卡片** | The Pattern | 卡片式 Dashboard，个性化特质分主题展示 |
| **音频驱动** | CHANI | 独立 LISTEN tab，冥想+肯定语 |
| **聊天式** | Sanctuary | 对话 UI，降低占星门槛 |
| **内容优先** | 共同趋势 | 首页 = 今日内容，不藏到三层菜单后 |

### ✨ 动效与微交互

| 交互 | 来源 | 可抄度 |
|------|------|-------|
| **星云加载动画** | Co-Star VOID 功能 | ⭐⭐⭐⭐⭐ |
| **"Fetching NASA data" 加载提示** | Co-Star 切换页面 | ⭐⭐⭐⭐⭐ |
| **动态饼图** | The Pattern Bonds | ⭐⭐⭐ |
| **神秘推送文案** | Co-Star "俳句式"推送 | ⭐⭐⭐⭐⭐ |

### 💰 CTA 与转化

| 模式 | 采用者 | 效果 |
|------|-------|------|
| **延迟付费墙** | CHANI | 先让用户爱上产品再展示价格 |
| **清晰的功能解锁对比** | Autviz 建议 | "不是模糊的订阅，而是具体解锁什么" |
| **Freemium + 单次购买** | Co-Star | 日常免费 + 深度报告付费 + 真人咨询 |
| **试用期无追加销售** | CHANI | 不破坏试用体验 |
| **进入前展示价值** | CHANI | 打开 App 先看到今日解读 |

### 🔔 推送通知

| 策略 | 效果 |
|------|------|
| **"运势已就绪"** | 打开率 3-5× |
| **"幸运时间"推送** | 高打开率 |
| **周期触发** | 新月/满月/逆行提醒 |

### 🔄 用户留存

| 机制 | 来源 |
|------|------|
| **Daily Streak** | JPLoft |
| **成就徽章** | JPLoft |
| **Mood Tracking** | 多款产品 |
| **社交分享** | 增长飞轮 |
| **昨日反馈** | Dev.to 建议 |

---

## 四、Daily 页面对标建议

### 🔴 P0 — 立即改

| # | 来源 | 改什么 |
|---|------|-------|
| 1 | Co-Star | 运势卡片改暗黑极简：加大字号（≥20px desktop），行高 1.7-1.8 |
| 2 | 全行业 | 打开即见今日运势，首屏不滚动 |
| 3 | Co-Star + CHANI | AI 生成标注透明化 |
| 4 | The Pattern | 运势卡片化设计 |

### 🟡 P1 — 尽快改

| # | 来源 | 改什么 |
|---|------|-------|
| 5 | CHANI | 运势后紧跟可操作建议 |
| 6 | The Pattern | 星曜列表改卡片滑动 |
| 7 | Co-Star | 推送文案重写为神秘风格 |
| 8 | Dev.to | 昨日反馈 👍👎 |
| 9 | Nebula | 用克制取代神秘装饰 |

### 🟢 P2 — 逐步迭代

| # | 来源 | 改什么 |
|---|------|-------|
| 10 | Stardust | 社交分享卡片 |
| 11 | JPLoft | Daily Streak |
| 12 | CHANI | 音频引导 |
| 13 | The Pattern | 可视化兼容性 |
| 14 | Co-Star | 加载微动效 |

---

## 五、核心设计原则

1. **文字为王** — Co-Star 用纯文字做到高付费率
2. **极简 = 信任** — Nebula 请 Netflix 品牌公司，输出的是"克制"
3. **预测→应对闭环** — 光告诉用户"会怎样"不够，还要"该怎么做"
4. **透明 AI > 隐藏 AI** — 清晰标注并解释生成方式
5. **每日习惯 > 功能堆砌** — 轻量、高频、可预期
6. **推送不是打扰是服务** — 推送是体验的一部分
7. **去神秘化** — 现代用户要的是"自我认知工具"

**Sources**:
- [Co-Star Design Critique — Pratt Institute (2024)](https://www.ixd.prattsi.org/2024/09/design-critique-co-star-ios-app/)
- [Co-Star App Review — Lunar Guide (2026)](https://www.lunarguideapp.com/blog/co-star-astrology-app-review-2026)
- [How to Build an Astrology App Like Co-Star — Autviz](https://www.autviz.com/how-to-develop-an-astrology-app-like-co-star-step-by-step-guide/)
- [Top 3 Astrology Apps — WP Links](https://getwplinks.com/top-3-astrology-apps-that-deliver-daily-horoscope-insights-youll-actually-read/)
- [Design Critique: The Pattern — Pratt Institute](https://www.ixd.prattsi.org/2023/02/design-critique-the-pattern/)
- [Gamification in Astrology Apps — JPLoft](https://www.jploft.com/blog/gamification-in-astrology-apps)
- [Add Daily Horoscopes to Your App — Dev.to](https://dev.to/apiverve/add-daily-horoscopes-to-your-app-in-5-minutes-1a09)
- [Nebula Rebrand — PRINT Magazine](https://www.printmag.com/branding-identity-design/spirituality-rebranded-nebulas-new-identity-turns-astrology-into-a-full-scale-guidance-system/)
- [CHANI vs Stardust — Huxiu](https://www.huxiu.com/article/4819755.html)
- [CHANI Retention Analysis — Retention.blog](https://www.retention.blog/p/whats-your-sign)
- [Astrology App Development 2025 — AI Plain English](https://ai.plainenglish.io/astrology-app-development-in-2025-top-10-horoscope-apps-how-to-build-yours-with-ai-ml-flutter-6f4584bfaf46)
- [Astrology Website Design — DesignRush](https://www.designrush.com/best-designs/websites/astrostar247-website-design)
- [Cosmos AI Landing Page — Dribbble](https://dribbble.com/shots/27086279-Cosmos-AI-Astrology-Birth-Chart-Landing-Page)
- [How Astrology Apps Keep Users Coming Back — Programming Insider](https://programminginsider.com/how-astrology-apps-keep-users-coming-back-daily-in-2026/)
