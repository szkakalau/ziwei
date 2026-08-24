import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /ai/summary.json
 *
 * AI engine discovery endpoint — provides a structured summary of the site
 * for AI crawlers (ChatGPT, Perplexity, Claude, etc.).
 *
 * Spec: https://geo-checklist.dev
 */
export function GET() {
  return NextResponse.json({
    name: "DestinyBlueprint.xyz",
    description:
      "AI-powered daily Zi Wei Dou Shu (Purple Star Astrology) horoscopes based on your exact birth chart. Free birth chart snapshot, daily readings, compatibility, yearly forecasts, and human-written email consultations.",
    url: "https://www.destinyblueprint.xyz",
    category: "Astrology & Spirituality",
    language: "en-US",
    pricing: {
      model: "subscription",
      price: "$4.99/month",
      trial: "7-day free trial",
    },
    features: [
      "Free birth chart computation (no signup)",
      "Daily AI-powered Zi Wei Dou Shu horoscopes",
      "Compatibility readings between two charts",
      "Yearly forecast based on transits",
      "Human-written email consultations",
      "Streak tracking for daily engagement",
    ],
    contact: {
      email: "castro.liu@me.com",
    },
  });
}
