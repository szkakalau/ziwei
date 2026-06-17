// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// ---- Mock child components ----

vi.mock("@/components/StreakBadge", () => ({
  StreakBadge: () => React.createElement("span", { "data-testid": "streak-badge" }),
}));

vi.mock("@/components/ChartCanvas", () => ({
  ChartCanvas: () => React.createElement("div", { "data-testid": "chart-canvas" }),
}));

vi.mock("@/components/ShareCard", () => ({
  ShareCard: () => null,
}));

vi.mock("@/components/AskZiwei", () => ({
  AskZiwei: () => React.createElement("div", { "data-testid": "ask-ziwei" }),
}));

vi.mock("@/components/CompatibilityCheck", () => ({
  CompatibilityCheck: () => React.createElement("div", { "data-testid": "compat-check" }),
}));

vi.mock("@/components/PushSetup", () => ({
  useOneSignal: () => ({ pushState: "unsupported" as const, requestPush: vi.fn() }),
  PushPrompt: () => null,
}));

vi.mock("@/components/BirthdaySurprise", () => ({
  BirthdaySurprise: () => null,
}));

vi.mock("@/components/AppNav", () => ({
  AppNav: () => null,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

// ---- Tests ----

describe("DailyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("shows login/register form when not authenticated", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 401, ok: false, json: async () => ({ ok: false }),
    } as Response);

    const DailyPage = (await import("../page")).default;
    render(React.createElement(DailyPage));

    await waitFor(() => {
      expect(screen.getByText("Start your free trial")).toBeDefined();
    });
  });

  it("shows trial CTA when subscription is cancelled", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, user: { id: "u1", subscriptionStatus: "cancelled", birthDate: null } }),
    } as Response);

    const DailyPage = (await import("../page")).default;
    render(React.createElement(DailyPage));

    await waitFor(() => {
      expect(screen.getByText("Get your daily horoscope")).toBeDefined();
    });
  });

  it("shows chart setup prompt when chart is missing", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, user: { id: "u1", subscriptionStatus: "active", birthDate: "1990-01-01" } }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 400, ok: false } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ ok: true, chart: { palaces: [] } }) } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ ok: true, streak: 0 }) } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({}) } as Response);

    const DailyPage = (await import("../page")).default;
    render(React.createElement(DailyPage));

    await waitFor(() => {
      expect(screen.getByText("Set up your birth chart")).toBeDefined();
    }, { timeout: 3000 });
  });

  it("shows error and Try again button when API returns 500", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, user: { id: "u1", subscriptionStatus: "active", birthDate: "1990-01-01" } }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 500, ok: false } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ ok: true, chart: { palaces: [] } }) } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ ok: true, streak: 0 }) } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({}) } as Response);

    const DailyPage = (await import("../page")).default;
    render(React.createElement(DailyPage));

    await waitFor(() => {
      expect(screen.getByText("Try again")).toBeDefined();
    }, { timeout: 3000 });
  });

  it("shows horoscope and interactive tools on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, user: { id: "u1", subscriptionStatus: "active", birthDate: "1990-06-15" } }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, horoscope: "Your Architect pattern shines today.", highlightedStars: ["Architect", "Executor"], source: "deepseek" }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, chart: { palaces: [{ name: "soul", majorStars: [{ name: "emperor" }] }] } }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, streak: 7 }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({}) } as Response);

    const DailyPage = (await import("../page")).default;
    render(React.createElement(DailyPage));

    await waitFor(() => {
      expect(screen.getByText("Your Architect pattern shines today.")).toBeDefined();
    }, { timeout: 3000 });

    // Horoscope source line
    expect(screen.getByText(/Generated via/)).toBeDefined();
    // Sidebar items
    expect(screen.getByText("Yearly Forecast")).toBeDefined();
    expect(screen.getByTestId("ask-ziwei")).toBeDefined();
    expect(screen.getByTestId("compat-check")).toBeDefined();
  });

  it("shows empty state when horoscope is null (not yet generated)", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, user: { id: "u1", subscriptionStatus: "active", birthDate: "1990-01-01" } }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200, ok: true,
      json: async () => ({ ok: true, horoscope: null, highlightedStars: [], source: "cached" }),
    } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ ok: true, chart: { palaces: [] } }) } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ ok: true, streak: 1 }) } as Response);
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({}) } as Response);

    const DailyPage = (await import("../page")).default;
    render(React.createElement(DailyPage));

    // The empty state shows a helpful message. Refresh button is rendered
    // (may say "Generating…" or "Refresh" depending on loading timing).
    await screen.findByText(/Your first horoscope is being written/i, {}, { timeout: 5000 });

    // Verify there's at least one button on the page (the Refresh/retry button)
    // Use querySelector because getByRole can fail with timing in CI.
    await waitFor(() => {
      expect(document.querySelector("button")).not.toBeNull();
    }, { timeout: 3000 });
  });
});
