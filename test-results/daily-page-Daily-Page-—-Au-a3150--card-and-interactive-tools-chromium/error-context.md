# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: daily-page.spec.ts >> Daily Page — Authenticated States (mocked) >> shows success state with horoscope card and interactive tools
- Location: e2e\daily-page.spec.ts:208:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Today\'s Practice')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Today\'s Practice')

```

```yaml
- banner:
  - link "DestinyBlueprint.xyz":
    - /url: /
  - navigation:
    - link "Blog":
      - /url: /blog
    - link "Pricing":
      - /url: /pricing
    - link "FAQ":
      - /url: /faq
    - link "About":
      - /url: /about
  - link "Get my reading":
    - /url: /#free-personality-snapshot
- main:
  - main:
    - paragraph: Sunday, June 21
    - paragraph: Your daily Zi Wei Dou Shu reading
    - button "✨ Day 5"
    - paragraph: Your Architect pattern shines today. The Resources domain is activated.
    - paragraph: AI-generated — powered by your Zi Wei chart data
    - paragraph: Today’s Practice
    - paragraph: Write down one limiting belief. Then write one piece of evidence against it.
    - text: Was yesterday’s reading accurate?
    - button "Thumbs up — accurate": 👍
    - button "Thumbs down — not accurate": 👎
    - button "Share"
    - button "Share as image"
    - button "View Chart"
    - complementary:
      - paragraph: Active Stars Today
      - paragraph: Your chart’s dominant archetypes shaping today’s reading
      - text: Zi Wei · Emperor Star leadership authority strategy
      - paragraph: Strategic leader building lasting structures. Natural organizer others trust during uncertainty.
      - text: Tian Fu · Empress Star stability conservation management
      - paragraph: "Guardian of continuity. Creates security through reliable systems. Risk: choosing comfort over growth."
      - text: Wu Qu · Marshal Star discipline execution wealth
      - paragraph: Grit-powered achiever. Disciplined and closure-oriented. Wealth accumulates through measured consistency.
      - link "Yearly Forecast Career · Love · Wealth · Health":
        - /url: /yearly
        - paragraph: Yearly Forecast
        - paragraph: Career · Love · Wealth · Health
      - heading "Ask Zi Wei" [level=2]
      - paragraph: "Try asking:"
      - button "What does my career palace say about my work life?"
      - button "How do my stars affect my relationships?"
      - button "What's my biggest strength based on my chart?"
      - textbox "Ask about your chart..."
      - button [disabled]
      - heading "Compatibility Check" [level=2]
      - button "Check compatibility with someone →"
    - paragraph: DestinyBlueprint · Zi Wei Dou Shu Daily
    - navigation:
      - link "Today":
        - /url: /daily
      - link "Yearly":
        - /url: /yearly
      - link "Match":
        - /url: /compatibility
      - link "Account":
        - /url: /account
- contentinfo:
  - paragraph: © 2026 DestinyBlueprint.xyz. For reflection and entertainment only—not medical, legal, or financial advice.
  - list:
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy
    - listitem:
      - link "Terms":
        - /url: /terms
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Affiliate":
        - /url: /affiliate
- alert
```

# Test source

```ts
  162 |     await expect(page.locator(".animate-pulse").first()).toBeVisible();
  163 | 
  164 |     // Resolve the horoscope
  165 |     resolveHoroscope!();
  166 |     await page.waitForTimeout(200);
  167 | 
  168 |     // Should now show content
  169 |     await expect(page.getByText("Your Stars align today with unexpected clarity.")).toBeVisible();
  170 |   });
  171 | 
  172 |   test("shows error state with retry button", async ({ page }) => {
  173 |     await page.route("**/api/auth/me", (route) =>
  174 |       route.fulfill({
  175 |         status: 200,
  176 |         contentType: "application/json",
  177 |         body: JSON.stringify({
  178 |           ok: true,
  179 |           user: { id: "test-4", subscriptionStatus: "active" },
  180 |         }),
  181 |       })
  182 |     );
  183 | 
  184 |     await page.route("**/api/generate-daily", (route) =>
  185 |       route.fulfill({
  186 |         status: 500,
  187 |         contentType: "application/json",
  188 |         body: JSON.stringify({ ok: false, message: "Server error" }),
  189 |       })
  190 |     );
  191 | 
  192 |     await page.route("**/api/chart", (route) =>
  193 |       route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, chart: { palaces: [] } }) })
  194 |     );
  195 | 
  196 |     await page.route("**/api/streak", (route) =>
  197 |       route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, streak: 0 }) })
  198 |     );
  199 | 
  200 |     await page.goto("/daily");
  201 | 
  202 |     // Should show error message
  203 |     await expect(page.getByText("Server error")).toBeVisible();
  204 |     // Retry button
  205 |     await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  206 |   });
  207 | 
  208 |   test("shows success state with horoscope card and interactive tools", async ({ page }) => {
  209 |     await page.route("**/api/auth/me", (route) =>
  210 |       route.fulfill({
  211 |         status: 200,
  212 |         contentType: "application/json",
  213 |         body: JSON.stringify({
  214 |           ok: true,
  215 |           user: { id: "test-5", subscriptionStatus: "active", birthDate: "1990-06-15" },
  216 |         }),
  217 |       })
  218 |     );
  219 | 
  220 |     await page.route("**/api/generate-daily", (route) =>
  221 |       route.fulfill({
  222 |         status: 200,
  223 |         contentType: "application/json",
  224 |         body: JSON.stringify({
  225 |           ok: true,
  226 |           horoscope: "Your Architect pattern shines today. The Resources domain is activated.",
  227 |           highlightedStars: ["Architect", "Stabilizer", "Executor"],
  228 |           source: "deepseek",
  229 |         }),
  230 |       })
  231 |     );
  232 | 
  233 |     await page.route("**/api/chart", (route) =>
  234 |       route.fulfill({
  235 |         status: 200,
  236 |         contentType: "application/json",
  237 |         body: JSON.stringify({
  238 |           ok: true,
  239 |           chart: {
  240 |             palaces: [
  241 |               { name: "Destiny", majorStars: [{ name: "Zi Wei" }], minorStars: [] },
  242 |               { name: "Wealth", majorStars: [{ name: "Wu Qu" }], minorStars: [] },
  243 |             ],
  244 |           },
  245 |         }),
  246 |       })
  247 |     );
  248 | 
  249 |     await page.route("**/api/streak", (route) =>
  250 |       route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, streak: 5 }) })
  251 |     );
  252 | 
  253 |     await page.goto("/daily");
  254 | 
  255 |     // Horoscope text
  256 |     await expect(page.getByText("Your Architect pattern shines today.")).toBeVisible();
  257 | 
  258 |     // AI transparency label
  259 |     await expect(page.getByText(/AI-generated/)).toBeVisible();
  260 | 
  261 |     // Daily ritual box
> 262 |     await expect(page.getByText("Today's Practice")).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  263 | 
  264 |     // Yesterday feedback
  265 |     await expect(page.getByText("Was yesterday's reading accurate?")).toBeVisible();
  266 |     await expect(page.getByLabel("Thumbs up — accurate")).toBeVisible();
  267 |     await expect(page.getByLabel("Thumbs down — not accurate")).toBeVisible();
  268 | 
  269 |     // Active stars chips (use exact:true — star names also appear in horoscope text)
  270 |     await expect(page.getByText("Active Stars Today")).toBeVisible();
  271 |     await expect(page.getByText("Architect", { exact: true })).toBeVisible();
  272 |     await expect(page.getByText("Stabilizer", { exact: true })).toBeVisible();
  273 |     await expect(page.getByText("Executor", { exact: true })).toBeVisible();
  274 | 
  275 |     // Action buttons — Share might conflict with ShareCard "Share as image"
  276 |     await expect(page.getByRole("button", { name: "Share", exact: true })).toBeVisible();
  277 |     await expect(page.getByRole("button", { name: "View Chart" })).toBeVisible();
  278 | 
  279 |     // Sidebar tools
  280 |     await expect(page.getByText("Yearly Forecast")).toBeVisible();
  281 |     await expect(page.getByTestId("ask-ziwei")).toBeVisible();
  282 |     await expect(page.getByTestId("compat-check")).toBeVisible();
  283 | 
  284 |     // Footer
  285 |     await expect(page.getByText("DestinyBlueprint — Zi Wei Dou Shu Daily")).toBeVisible();
  286 |     await expect(page.getByTestId("app-nav")).toBeVisible();
  287 |   });
  288 | 
  289 |   test("streak badge displays correct count", async ({ page }) => {
  290 |     await page.route("**/api/auth/me", (route) =>
  291 |       route.fulfill({
  292 |         status: 200,
  293 |         contentType: "application/json",
  294 |         body: JSON.stringify({
  295 |           ok: true,
  296 |           user: { id: "test-6", subscriptionStatus: "active" },
  297 |         }),
  298 |       })
  299 |     );
  300 | 
  301 |     await page.route("**/api/generate-daily", (route) =>
  302 |       route.fulfill({
  303 |         status: 200,
  304 |         contentType: "application/json",
  305 |         body: JSON.stringify({
  306 |           ok: true,
  307 |           horoscope: "Today is your day.",
  308 |           highlightedStars: [],
  309 |           source: "deepseek",
  310 |         }),
  311 |       })
  312 |     );
  313 | 
  314 |     await page.route("**/api/chart", (route) =>
  315 |       route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, chart: { palaces: [] } }) })
  316 |     );
  317 | 
  318 |     await page.route("**/api/streak", (route) =>
  319 |       route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, streak: 7 }) })
  320 |     );
  321 | 
  322 |     await page.goto("/daily");
  323 | 
  324 |     // Streak badge
  325 |     const streakBadge = page.getByTestId("streak-badge");
  326 |     await expect(streakBadge).toBeVisible();
  327 |     await expect(streakBadge).toContainText("7");
  328 |   });
  329 | 
  330 |   test("chart toggle shows/hides birth chart", async ({ page }) => {
  331 |     await page.route("**/api/auth/me", (route) =>
  332 |       route.fulfill({
  333 |         status: 200,
  334 |         contentType: "application/json",
  335 |         body: JSON.stringify({
  336 |           ok: true,
  337 |           user: { id: "test-7", subscriptionStatus: "active" },
  338 |         }),
  339 |       })
  340 |     );
  341 | 
  342 |     await page.route("**/api/generate-daily", (route) =>
  343 |       route.fulfill({
  344 |         status: 200,
  345 |         contentType: "application/json",
  346 |         body: JSON.stringify({
  347 |           ok: true,
  348 |           horoscope: "Stars align.",
  349 |           highlightedStars: [],
  350 |           source: "deepseek",
  351 |         }),
  352 |       })
  353 |     );
  354 | 
  355 |     await page.route("**/api/chart", (route) =>
  356 |       route.fulfill({
  357 |         status: 200,
  358 |         contentType: "application/json",
  359 |         body: JSON.stringify({
  360 |           ok: true,
  361 |           chart: {
  362 |             palaces: [
```