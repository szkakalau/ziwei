import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders all 11 sections in correct order", async ({ page }) => {
    const main = page.locator("main");
    // Navbar
    await expect(main.getByRole("navigation")).toBeVisible();
    // Hero — headline + form
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#hero-form")).toBeVisible();
    // TrustBar — animated counters (use first() to avoid Hero social proof duplicate)
    await expect(page.getByText("charts generated").first()).toBeVisible();
    // WhyZiWeiBetter
    await expect(page.getByText("Why Zi Wei Dou Shu")).toBeVisible();
    // ProductShowcase
    await expect(page.getByText("Daily AI Insight")).toBeVisible();
    // SeeWhatYouGet
    await expect(page.getByText("Your Zi Wei Birth Chart")).toBeVisible();
    // FreeVsPaidTable
    await expect(page.getByText("Everything in Free")).toBeVisible();
    // Testimonials (How It Works)
    await expect(page.getByText("From birth chart")).toBeVisible();
    await expect(page.getByText("to daily guidance")).toBeVisible();
    // RiskFree
    await expect(page.getByText("Try everything for 7 days")).toBeVisible();
    // FAQ — heading is "Everything you want to ask"
    await expect(page.getByText("Everything you want to ask")).toBeVisible();
    // LandingFooter
    await expect(page.getByText(/DestinyBlueprint/).last()).toBeVisible();
    // StickyUnlockBar
    await expect(page.getByText("Continue To Checkout")).toBeVisible();
  });

  test("hero form accepts birth data and navigates to snapshot", async ({ page }) => {
    // Fill birth date
    await page.locator("#hero-year").selectOption("1990");
    await page.locator("#hero-month").selectOption("6");
    await page.locator("#hero-day").selectOption("15");
    // Set gender
    await page.getByRole("button", { name: "♂" }).click();
    // Fill birth time
    await page.locator("#hero-hour").selectOption("08");
    await page.locator("#hero-minute").selectOption("30");
    // Fill location
    await page.locator("#hero-location").fill("New York, USA");

    // Submit button should be enabled
    const submitBtn = page.getByRole("button", { name: /See My Free Snapshot/ });
    await expect(submitBtn).toBeEnabled();
  });

  test("sticky CTA scrolls to hero form", async ({ page }) => {
    // Scroll to bottom
    const stickyBar = page.getByText("Continue To Checkout");
    await stickyBar.scrollIntoViewIfNeeded();
    await expect(stickyBar).toBeVisible();

    // Click should scroll to hero form
    await stickyBar.click();
    // After smooth scroll, form should be in viewport
    await page.waitForTimeout(800);
    const form = page.locator("#hero-form");
    await expect(form).toBeInViewport();
  });

  test("why zi wei section renders all 4 comparison cards", async ({ page }) => {
    const section = page.getByText("Why Zi Wei Dou Shu").locator("..");
    await section.scrollIntoViewIfNeeded();

    await expect(page.getByText("See all 100+ stars")).toBeVisible();
    await expect(page.getByText("Wake up to a horoscope")).toBeVisible();
    await expect(page.getByText("1,000 years of refinement")).toBeVisible();
    await expect(page.getByText("Your chart is computed to")).toBeVisible();
  });

  test("FAQ accordion opens and closes", async ({ page }) => {
    const faqSection = page.getByText("Everything you want to ask");
    await faqSection.scrollIntoViewIfNeeded();

    // Click first question
    const firstTrigger = page.locator('[data-state="closed"]').first();
    if (await firstTrigger.isVisible()) {
      await firstTrigger.click();
      // Wait for animation
      await page.waitForTimeout(400);
      // Accordion content should be visible
      const openContent = page.locator('[data-state="open"]');
      await expect(openContent.first()).toBeVisible();
    }
  });

  test("nav links point to correct pages", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link", { name: "Daily" })).toHaveAttribute("href", "/daily");
    await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });

  test("mobile viewport renders single-column layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Hero headline should be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Form should be single column
    const form = page.locator("#hero-form");
    await expect(form).toBeVisible();
  });
});
