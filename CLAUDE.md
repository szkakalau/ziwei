# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (next/core-web-vitals + next/typescript)

# Vitest (unit tests, jsdom environment, src/**/*.test.ts)
npx vitest run                          # Run all unit tests
npx vitest run src/lib/__tests__/horoscopeGenerator.test.ts  # Single file

# Playwright (E2E, e2e/*.spec.ts)
npx playwright test                     # Run all E2E (requires dev server)
npx playwright test e2e/daily-page.spec.ts  # Single E2E
```

## Architecture

Next.js 14 App Router, deployed on Vercel. Neon serverless PostgreSQL via `@neondatabase/serverless`. Auth via `iron-session` (stateless encrypted cookies). Zi Wei Dou Shu chart computation via `iztro` library.

### Core domain: ZWDS star naming (critical invariant)

**REPEATEDLY CAUSES BUGS.** Stars have TWO representations:

| Layer | Example | Where used |
|-------|---------|------------|
| **iztro canonical key** (source of truth) | `"emperor"`, `"upright"`, `"wolf"` | `SIHUA_TABLE`, `sihua.hualu`, DB storage, API responses |
| **Display name** (Pinyin · Alias) | `"Zi Wei · Emperor Star"`, `"Lian Zhen · Virtue Star"` | Prompts to AI, UI rendering |

`getStarNaming(rawKey)` resolves a canonical key to a `{pinyin, alias, keywords}` object. Resolution goes through 3 paths (see [zwdsNaming.ts](src/lib/zwdsNaming.ts)): direct key lookup → `ARCHETYPE_TO_KEY` reverse map → `RAW_ALIAS_TO_KEY`.

**Rule**: All data flowing to `formatStarName()`, `getStarBrief()`, `getStarKeywords()` MUST be raw iztro canonical keys. Passing display names produces empty/incorrect results.

[zwdsKnowledge.ts](src/lib/zwdsKnowledge.ts) is the single source of truth for `STAR_ARCHETYPE_MAP` (star → archetype). Every consumer imports from here.

### Horoscope generation pipeline

[horoscopeGenerator.ts](src/lib/horoscopeGenerator.ts) — 3-tier fallback:
1. **DeepSeek** (primary) — `deepseek-chat`, 1200 max_tokens, 20s timeout
2. **OpenAI** (fallback) — `gpt-4o-mini`, 1200 max_tokens, 20s timeout
3. **Template** (guaranteed) — `templateHoroscope()` produces structured output with no API dependency

`generateHoroscope()` ignores `userChart`/`transitSummary` params (kept for backward compat) — it computes today's real 四化 transit via `getDailyTransit()` internally.

`formatHighlightedStars()` returns raw iztro keys (not display names). The frontend [daily page](src/app/daily/page.tsx) resolves briefs/keywords from these keys.

### Daily transit computation

[dailyTransit.ts](src/lib/dailyTransit.ts) — `getDailyTransit()` computes the day's Heavenly Stem (日干) via Julian Day Number algorithm, then looks up 四化 from `SIHUA_TABLE` (10 stems × 4 transformations). Returns both raw `sihua` keys and `display` names.

### API route patterns

- Auth routes: `/api/auth/login|logout|register|me` — iron-session, bcrypt password hashing
- Chart routes: `/api/birth-chart`, `/api/chart` — compute or fetch cached chart
- AI routes: `/api/chat`, `/api/compatibility`, `/api/birthday-reading`, `/api/yearly-reading` — LLM-powered readings
- Daily: `/api/generate-daily` — POST generates + caches, GET returns cached
- Stripe: `/api/checkout`, `/api/stripe/webhook` — subscription payments
- Cron: `/api/cron/generate-daily` — Vercel cron-triggered daily generation for all users

### Database

[db.ts](src/lib/db.ts) uses a `Proxy` over `neon()` for lazy connection — no DB connection at import time. Tables: `users` (with chart_data JSONB), `daily_horoscopes` (with highlighted_stars JSONB), `streaks` (current_streak / longest_streak / last_check_date). All functions are exported individually (no ORM).

### Critical invariants (踩坑记录 — 改前必读)

**DB DATE 列返回 JS `Date` 对象，不是字符串。** Neon 驱动（`@neondatabase/serverless`）对 `DATE` 列（oid 1082）用 `pg-types` 的 `parseDate` 解析成 JS `Date`，不是 `YYYY-MM-DD` 字符串。任何从 `streaks.last_check_date`、`daily_horoscopes.date` 等 DATE 列读回的值，与字符串做 `===` 比较恒为 `false`。`updateStreak()` 曾因此把每次访问都判为"断签"重置成 1（streak 永远 Day 1）——前三次修复都改前端顺序，改错了层。读回 DATE 列后必须先归一化成字符串再比较，且用**本地日期分量**（`getFullYear/getMonth/getDate`）而非 `toISOString().slice(0,10)`，否则 UTC+8 本地零点会被推回前一天。

**"今天"全系统统一用服务端 UTC。** streak 的 `bumpStreak`、运势缓存 key（[generate-daily/route.ts](src/app/api/generate-daily/route.ts)）、每日四化（[dailyTransit.ts](src/lib/dailyTransit.ts)）三者都用 `new Date().toISOString().slice(0, 10)`，日界线落在北京 08:00。这是设计选择不是 bug——三者必须同时切换。**不要只改 streak 一处**改用本地时区，否则 streak 与运势脱钩（读到新一天运势但 streak 没涨）。要改就得三处一起改 + 客户端传时区。

**测试 mock 必须反映真实驱动行为。** [streak.test.ts](src/lib/__tests__/streak.test.ts) 曾把 `last_check_date` mock 成字符串，与真实驱动的 `Date` 对象相反，导致 DATE 类型 bug 长期隐藏。mock DB 返回值时按真实 Neon 类型来：DATE→`Date`、TIMESTAMPTZ→`Date`、JSONB→对象、TEXT/INTEGER→基本类型。

### Key patterns

- `@/` alias maps to `src/` (configured in tsconfig.json, vitest.config.ts)
- Chart caching: [chartCache.ts](src/lib/chartCache.ts) checks `users.chart_data` first, computes via `computeBirthChart()` only on miss
- Subscription guard: `checkSubscription()` in [subscriptionGuard.ts](src/lib/subscriptionGuard.ts) gates paid features
- Dynamic import for heavy Node-only modules (e.g., `computeBirthChart` imports `iztro`)
- Tests live co-located: unit tests in `src/**/__tests__/`, E2E in `e2e/`
- `vitest.config.ts` uses jsdom environment; API route tests override with `// @vitest-environment node`

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
