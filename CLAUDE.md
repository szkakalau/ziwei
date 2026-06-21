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

[db.ts](src/lib/db.ts) uses a `Proxy` over `neon()` for lazy connection — no DB connection at import time. Tables: `users` (with chart_data JSONB), `daily_horoscopes` (with highlighted_stars JSONB). All functions are exported individually (no ORM).

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
