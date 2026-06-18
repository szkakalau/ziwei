import { test, expect } from "@playwright/test";

test.describe("Daily Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/daily");
  });

  test("shows auth gate when unauthenticated", async ({ page }) => {
    // Should show the login/register form
    await expect(page.getByText("Start your free trial")).toBeVisible();
    await expect(page.getByText("7 days free, then $4.99/month")).toBeVisible();

    // Date label visible
    await expect(page.getByText(/^\w+day, \w+ \d+$/)).toBeVisible();

    // Form fields
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder(/Password/)).toBeVisible();

    // CTA button
    await expect(page.getByRole("button", { name: "Start 7-Day Free Trial" })).toBeVisible();

    // Toggle to login
    await page.getByText("Already have an account? Log in").click();
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();

    // Toggle back to register
    await page.getByText("New here? Create an account").click();
    await expect(page.getByText("Start your free trial")).toBeVisible();
  });

  test("shows validation errors with empty credentials", async ({ page }) => {
    // Click submit without filling form
    await page.getByRole("button", { name: "Start 7-Day Free Trial" }).click();
    // Should remain on the same page (auth fails due to empty fields)
    await expect(page.getByPlaceholder("Email")).toBeVisible();
  });

  test("shows footer branding", async ({ page }) => {
    await expect(page.getByText("DestinyBlueprint — Zi Wei Dou Shu Daily")).toBeVisible();
  });

  test("mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/daily");

    // Auth form should be single column
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start 7-Day Free Trial" })).toBeVisible();
  });

  test("desktop viewport has wider layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/daily");

    // Auth gate still renders correctly
    await expect(page.getByText("Start your free trial")).toBeVisible();
  });
});

test.describe("Daily Page — Authenticated States (mocked)", () => {
  test("shows no-subscription gate", async ({ page }) => {
    // Mock auth API to return user without subscription
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "test-1", subscriptionStatus: "free", birthDate: "1990-01-01" },
        }),
      })
    );

    await page.goto("/daily");

    // Should show subscription upsell
    await expect(page.getByText("Get your daily horoscope")).toBeVisible();
    await expect(page.getByText("Personalized Zi Wei Dou Shu horoscopes every morning")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start 7-Day Free Trial" })).toBeVisible();
  });

  test("shows no-chart prompt when authenticated but missing chart", async ({ page }) => {
    // Mock: authenticated, subscribed, but generate-daily returns 400 (no chart)
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "test-2", subscriptionStatus: "active", birthDate: null },
        }),
      })
    );

    // generate-daily returns 400 → triggers no_chart after syncChartFromStorage fails
    await page.route("**/api/generate-daily", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ ok: false }),
      })
    );

    await page.goto("/daily");

    // Should prompt to set up birth chart
    await expect(page.getByText("Set up your birth chart")).toBeVisible();
    await expect(page.getByRole("link", { name: /Enter Birth Details/ })).toHaveAttribute("href", "/#free-personality-snapshot");
  });

  test("shows loading skeleton while fetching horoscope", async ({ page }) => {
    let resolveHoroscope: () => void;
    const horoscopePromise = new Promise<void>((r) => { resolveHoroscope = r; });

    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "test-3", subscriptionStatus: "active" },
        }),
      })
    );

    // Delay the horoscope API to observe loading state
    await page.route("**/api/generate-daily", async (route) => {
      await horoscopePromise;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          horoscope: "Your Stars align today with unexpected clarity.",
          highlightedStars: ["Architect", "Executor"],
          source: "deepseek",
        }),
      });
    });

    await page.route("**/api/chart", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, chart: { palaces: [] } }),
      })
    );

    await page.route("**/api/streak", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, streak: 3 }),
      })
    );

    await page.goto("/daily");

    // Should show loading pulsing skeleton
    await expect(page.locator(".animate-pulse").first()).toBeVisible();

    // Resolve the horoscope
    resolveHoroscope!();
    await page.waitForTimeout(200);

    // Should now show content
    await expect(page.getByText("Your Stars align today with unexpected clarity.")).toBeVisible();
  });

  test("shows error state with retry button", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "test-4", subscriptionStatus: "active" },
        }),
      })
    );

    await page.route("**/api/generate-daily", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, message: "Server error" }),
      })
    );

    await page.route("**/api/chart", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, chart: { palaces: [] } }) })
    );

    await page.route("**/api/streak", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, streak: 0 }) })
    );

    await page.goto("/daily");

    // Should show error message
    await expect(page.getByText("Server error")).toBeVisible();
    // Retry button
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("shows success state with horoscope card and interactive tools", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "test-5", subscriptionStatus: "active", birthDate: "1990-06-15" },
        }),
      })
    );

    await page.route("**/api/generate-daily", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          horoscope: "Your Architect pattern shines today. The Resources domain is activated.",
          highlightedStars: ["Architect", "Stabilizer", "Executor"],
          source: "deepseek",
        }),
      })
    );

    await page.route("**/api/chart", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          chart: {
            palaces: [
              { name: "Destiny", majorStars: [{ name: "Zi Wei" }], minorStars: [] },
              { name: "Wealth", majorStars: [{ name: "Wu Qu" }], minorStars: [] },
            ],
          },
        }),
      })
    );

    await page.route("**/api/streak", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, streak: 5 }) })
    );

    await page.goto("/daily");

    // Horoscope text
    await expect(page.getByText("Your Architect pattern shines today.")).toBeVisible();

    // AI transparency label
    await expect(page.getByText(/AI-generated/)).toBeVisible();

    // Daily ritual box
    await expect(page.getByText("Today's Practice")).toBeVisible();

    // Yesterday feedback
    await expect(page.getByText("Was yesterday's reading accurate?")).toBeVisible();
    await expect(page.getByLabel("Thumbs up — accurate")).toBeVisible();
    await expect(page.getByLabel("Thumbs down — not accurate")).toBeVisible();

    // Active stars chips (use exact:true — star names also appear in horoscope text)
    await expect(page.getByText("Active Stars Today")).toBeVisible();
    await expect(page.getByText("Architect", { exact: true })).toBeVisible();
    await expect(page.getByText("Stabilizer", { exact: true })).toBeVisible();
    await expect(page.getByText("Executor", { exact: true })).toBeVisible();

    // Action buttons — Share might conflict with ShareCard "Share as image"
    await expect(page.getByRole("button", { name: "Share", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "View Chart" })).toBeVisible();

    // Sidebar tools
    await expect(page.getByText("Yearly Forecast")).toBeVisible();
    await expect(page.getByTestId("ask-ziwei")).toBeVisible();
    await expect(page.getByTestId("compat-check")).toBeVisible();

    // Footer
    await expect(page.getByText("DestinyBlueprint — Zi Wei Dou Shu Daily")).toBeVisible();
    await expect(page.getByTestId("app-nav")).toBeVisible();
  });

  test("streak badge displays correct count", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "test-6", subscriptionStatus: "active" },
        }),
      })
    );

    await page.route("**/api/generate-daily", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          horoscope: "Today is your day.",
          highlightedStars: [],
          source: "deepseek",
        }),
      })
    );

    await page.route("**/api/chart", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, chart: { palaces: [] } }) })
    );

    await page.route("**/api/streak", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, streak: 7 }) })
    );

    await page.goto("/daily");

    // Streak badge
    const streakBadge = page.getByTestId("streak-badge");
    await expect(streakBadge).toBeVisible();
    await expect(streakBadge).toContainText("7");
  });

  test("chart toggle shows/hides birth chart", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "test-7", subscriptionStatus: "active" },
        }),
      })
    );

    await page.route("**/api/generate-daily", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          horoscope: "Stars align.",
          highlightedStars: [],
          source: "deepseek",
        }),
      })
    );

    await page.route("**/api/chart", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          chart: {
            palaces: [
              { name: "Destiny", majorStars: [{ name: "Zi Wei" }], minorStars: [] },
            ],
          },
        }),
      })
    );

    await page.route("**/api/streak", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, streak: 0 }) })
    );

    await page.goto("/daily");

    // Click "View Chart"
    await page.getByRole("button", { name: "View Chart" }).click();

    // Chart canvas should be visible (ChartCanvas renders SVG)
    await expect(page.locator("section svg").first()).toBeVisible();

    // Button should now say "Hide Chart"
    await expect(page.getByRole("button", { name: "Hide Chart" })).toBeVisible();

    // Click to hide
    await page.getByRole("button", { name: "Hide Chart" }).click();
    // Button should revert
    await expect(page.getByRole("button", { name: "View Chart" })).toBeVisible();
  });
});
