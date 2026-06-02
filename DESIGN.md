# DESIGN.md — DestinyBlueprint Design System

Minimal design system for Phase 1 Daily Horoscope PWA. Extends the existing landing page patterns with App UI conventions.

## Colors (OKLCH)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | App background (dark) |
| `--bg-card` | `rgba(255,255,255,0.03)` | Card surfaces |
| `--border-subtle` | `rgba(255,255,255,0.06)` | Card borders, dividers |
| `--border-accent` | `rgba(251,191,36,0.15)` | Accent borders (amber) |
| `--text-primary` | `rgba(255,255,255,0.90)` | Body text, horoscope content |
| `--text-secondary` | `rgba(255,255,255,0.60)` | Secondary labels |
| `--text-muted` | `rgba(255,255,255,0.30)` | Tertiary info |
| `--accent` | `#fbbf24` | Amber/gold accent |
| `--accent-muted` | `rgba(251,191,36,0.10)` | Accent background |

**Rule:** No purple, violet, or indigo. One accent color (amber/gold). Dark background is deep near-black, not pure #000.

## Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Page heading | DM Serif Display | 400 | 24px |
| Horoscope body | Inter | 400 | 17px, line-height 1.6 |
| Labels / meta | Inter | 500 | 12-14px |
| Chart labels | system-ui | 400 | 10px |

**Rule:** No system-ui as PRIMARY display font. DM Serif Display + Inter pair.

## Spacing (8px system)

| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |

## Components

### Card
- Max 1 card per page. Cards earn their existence.
- `rounded-2xl`, subtle border, gradient background
- No card grids, no icon-in-circle decorations

### Button
- **Primary:** Accent-filled or bordered
- **Secondary:** Ghost on dark (`white/[0.05]`)
- Min touch target: 44px

### Chart
- Circular 12-palace layout (traditional ZWDS style)
- SVG-based, clickable palaces with in-place expansion
- Amber dots for stars, subtle sector dividers

## Icons
- Lucide icons exclusively (no emoji as design elements)
- Consistent `h-4 w-4` for inline, `h-5 w-5` for standalone

## States (every UI component)

| State | Pattern |
|-------|---------|
| Loading | Skeleton shimmer (gray pulse, not spinner) |
| Empty | Warm message + secondary action suggestion |
| Error | Clear message + retry button + attribution if fallback used |
| Success | Content-first, minimal chrome |

## Responsive

| Breakpoint | Layout |
|------------|--------|
| 375px (base) | Single column, full-width cards |
| 768px | Max-width 640px centered |
| 1024px+ | Max-width 640px centered, larger chart |

## Accessibility
- Touch targets ≥ 44px
- Color contrast ≥ 4.5:1 (body), ≥ 3:1 (large text)
- All icons have aria-label
- Form fields have visible labels (not placeholder-only)
- Links distinguish visited/unvisited
