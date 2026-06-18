# 🏠 首页（Landing Page）设计研究

> 研究时间：2026-06-18 | 对标：当前 [LandingPage](src/components/landing/LandingPage.tsx)

---

## 一、当前首页 vs 行业基准

### 当前 Section 流

```
Hero(左文右图+表单) → TrustBar(统计) → ProductShowcase(3卡片) → FreeVsPaid → FAQ → Footer
```

### 行业最佳实践的缺失

| # | 缺失 | 行业标准 |
|---|------|---------|
| 1 | **无沉浸式首屏** | Co-Star 暗黑文字驱动 / Cosmos AI 3D宇宙 / Ephemeris 编辑式排版 |
| 2 | **无实际产品预览** | CHANI 进入前展示今日解读；Astrostar247 展示真实星盘输出 |
| 3 | **无客户证言** | Testimonials.tsx 已写好但没用到 |
| 4 | **无风险消除** | RiskFree.tsx 已写好但没用到 |
| 5 | **无底部转化钩子** | StickyUnlockBar.tsx 已写好但没用到 |
| 6 | **Section 过渡平铺直叙** | Ephemeris 编辑式滚动 + GSAP 入场动效 |

### 已写好但未使用的 7 个组件

```
src/components/landing/
├── Testimonials.tsx          ← 存在但没用
├── RiskFree.tsx              ← 存在但没用
├── StickyUnlockBar.tsx       ← 存在但没用
├── BirthSnapshotSection.tsx  ← 存在但没用
├── SeeWhatYouGet.tsx         ← 存在但没用
├── EmailReadingPreviewSample.tsx ← 存在但没用
└── WhyZiWeiBetter.tsx        ← 存在但没用
```

---

## 二、头部产品首页深度拆解

### A) Ephemeris — 编辑式叙事（最值得抄）

**来源**: [Rocket Template](https://www.rocket.new/templates/ephemeris-timeless-astrology-landing-page-template)

| 维度 | 细节 |
|------|------|
| **主题** | 文艺复兴天文学家手稿——羊皮纸底色、铁墨文字、锈色边注 |
| **首屏** | **无图**！纯大字排版 + 一条锈色细线 + 斜体日期 |
| **内容节奏** | 全出血排版 → 两栏编辑式 → 星座网格 → 出生图解剖 → 表单 |
| **CTA 策略** | **故意延迟**——先滚过 3 个编辑式 section 才出现表单 |
| **字体组合** | Fraunces（展示）+ Crimson Text（正文）+ IBM Plex Mono（注释） |
| **动效** | GSAP 入场、滚动揭示、视差层、卡片悬浮倾斜 |
| **社交证明** | "2,400+ charts cast this month" 嵌入编辑式 byline |

### B) Astroideal 重设计 — 转化优化教科书

**来源**: [Contra Case Study](https://contra.com/p/qZoFWbgL-astroideal-website-redesign)

| 维度 | Before | After |
|------|--------|-------|
| **首屏标题** | 模糊不清 | "Connect with the Universe." |
| **CTA** | "Available now" 无上下文 | 试用型 CTA，低门槛 |
| **信任** | 零 | 证言 + 安全支付保障 |
| **导航** | 弹窗无关闭、移动端冻结 | 完全响应式 |
| **视觉** | 每 section 样式不同 | 统一设计系统 |
| **步骤** | 混乱 | 4 步清晰层级 |

### C) Cosmos AI — 暗黑沉浸派

**来源**: [Dribbble](https://dribbble.com/shots/27086279-Cosmos-AI-Astrology-Birth-Chart-Landing-Page)

- 深空背景 + 交互式天体球 + 金色点缀
- 霓虹渐变 + 深空黑 + 金色强调
- SaaS 式结构——Hero → Features → How It Works → Pricing → CTA

---

## 三、行业标准转化漏斗

```
Hero（强价值主张 1 句话）
  ↓
Social Proof（数字、评价星、媒体logo）
  ↓
Problem Agitation（"传统占星的问题"）
  ↓
Solution Demo（真实产品预览/截图/动画）
  ↓
Feature Cards（3-4 张，图标+一句话）
  ↓
Pricing（Freemium 清晰对比）
  ↓
Testimonials（真人照片+名字+具体结果）
  ↓
Risk Reversal（退款保证、隐私承诺）
  ↓
FAQ（处理最后异议）
  ↓
Final CTA（底部转化钩子）
```

## 四、DestinyBlueprint 首页优化建议

### 🔴 P0 — 立即补上（组件已存在）

| # | 改什么 | 组件 | 位置 |
|---|-------|------|------|
| 1 | 补上用户证言 | Testimonials.tsx | Pricing 后 |
| 2 | 补上风险消除 | RiskFree.tsx | Testimonials 后 |
| 3 | 补上产品预览 | SeeWhatYouGet.tsx | ProductShowcase 后 |
| 4 | 补上底部钩子 | StickyUnlockBar.tsx | 页面底部固定 |
| 5 | 补上 "Why Zi Wei" | WhyZiWeiBetter.tsx | TrustBar 后 |

### 🟡 P1 — Section 重排

```
Hero → TrustBar → WhyZiWeiBetter → ProductShowcase → SeeWhatYouGet
     → FreeVsPaid → Testimonials → RiskFree → FAQ → Footer
     + StickyUnlockBar（固定底部）
```

### 🟢 P2 — 视觉升级

| # | 来源 | 改什么 |
|---|------|-------|
| 6 | Ephemeris | Hero 标题加大加粗，减少次要元素 |
| 7 | Cosmos AI | Hero 背景深空暗黑+金色微光 |
| 8 | Ephemeris | 编辑式滚动——section 之间加微入场动效 |
| 9 | 健康类趋势 | 增大 section 间距（≥120px） |

### 🔵 P3 — A/B 测试

| # | 来源 | 尝试 |
|---|------|------|
| 10 | Ephemeris | Hero 去掉星盘图，纯文字驱动 |
| 11 | CHANI | 表单改 step-by-step 引导 |
| 12 | Co-Star | 极简暗黑实验——纯黑+大白字+无图 |

---

**Sources**:
- [Ephemeris Landing Page Template — Rocket](https://www.rocket.new/templates/ephemeris-timeless-astrology-landing-page-template)
- [Astroideal Website Redesign — Contra](https://contra.com/p/qZoFWbgL-astroideal-website-redesign)
- [Cosmos AI Landing Page — Dribbble](https://dribbble.com/shots/27086279-Cosmos-AI-Astrology-Birth-Chart-Landing-Page)
- [Astro-Co Landing Page — Contra](https://contra.com/p/B3P3ZYsR-astro-co-landing-page-ai-astrology-app)
- [Astrostar247 — DesignRush](https://www.designrush.com/best-designs/websites/astrostar247-website-design)
- [Why Googling Your Category Kills Design — Dev.to](https://dev.to/ji_ai/why-googling-your-category-kills-your-design-and-how-i-built-a-cosmic-3d-background-with-threejs-32hk)
- [Wellness Landing Page Design — Contra](https://contra.com/p/2mYBrFEW-niora-wellness-landing-page-design-and-development)
- [AstroChat Conversion Rate Optimization — AppTweak](https://www.apptweak.com/en/case-studies/astrochat)
