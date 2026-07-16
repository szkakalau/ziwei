import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /ai/faq.json
 *
 * Machine-readable FAQ for AI search visibility.
 * Mirrors the human FAQ page content for AI crawler consumption.
 *
 * Spec: https://geo-checklist.dev
 */
export function GET() {
  return NextResponse.json({
    site: "DestinyBlueprint.xyz",
    lastUpdated: "2026-07-01",
    questions: [
      {
        q: "What is Chinese astrology / Zi Wei Dou Shu?",
        a: "Zi Wei Dou Shu (Purple Star Astrology) is a classical Chinese astrological system that maps over 100 stars across 12 life palaces using your birth date and time. Unlike Western sun-sign astrology, it provides a highly personalized chart based on the exact moment you were born.",
      },
      {
        q: "Is this fortune telling?",
        a: "Zi Wei Dou Shu is not deterministic fortune telling. It's a framework for self-reflection that maps celestial patterns at your birth to personality tendencies, life themes, and timing cycles — similar to how a personality test describes tendencies rather than fixed outcomes.",
      },
      {
        q: "Is Zi Wei Dou Shu scientifically validated?",
        a: "Like all astrological systems, Zi Wei Dou Shu is not empirically validated by modern scientific methods. It is a cultural and philosophical tradition spanning over 1,000 years. We present it as a tool for self-reflection and entertainment, not as scientific fact.",
      },
      {
        q: "How important is accurate birth time?",
        a: "Birth time is critical in Zi Wei Dou Shu — it determines the Life Palace (命宫) position, which is the foundation of the entire chart. A 2-hour difference can shift all 12 palaces. If you don't know your exact birth time, use the closest estimate; the reading will note this.",
      },
      {
        q: "How do the daily readings work?",
        a: "Each day, the system computes the day's heavenly stem (日干) and determines the four transformations (四化): Prosperity (化禄), Authority (化权), Fame (化科), and Obstacle (化忌). AI analyzes which stars in your natal chart are activated by these transformations and generates a personalized horoscope.",
      },
      {
        q: "What does the subscription include?",
        a: "$4.99/month with a 7-day free trial includes: daily AI horoscopes, compatibility readings, yearly forecasts, and human-written email consultations. Cancel anytime. No upsells.",
      },
      {
        q: "How is my data handled?",
        a: "Your birth data and chart are stored in an encrypted database. We do not sell or share your data with third parties. You can request deletion of your data at any time by contacting support.",
      },
      {
        q: "What is the refund policy?",
        a: "We offer a 7-day free trial so you can experience the full service before being charged. If you forget to cancel, contact us within 48 hours of the first charge for a refund.",
      },
    ],
  });
}
