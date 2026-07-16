import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /ai/service.json
 *
 * Describes the service capabilities for AI agent integration.
 * Helps AI assistants (ChatGPT plugins, Claude, Perplexity) understand
 * what actions are available on the site.
 *
 * Spec: https://geo-checklist.dev
 */
export function GET() {
  return NextResponse.json({
    name: "DestinyBlueprint.xyz",
    description:
      "AI-powered Zi Wei Dou Shu astrology platform with birth chart computation, daily horoscopes, and compatibility readings",
    url: "https://www.destinyblueprint.xyz",
    capabilities: [
      {
        name: "birth_chart",
        description:
          "Compute a Zi Wei Dou Shu birth chart from date, time, and place of birth",
        endpoint: "/#hero-form",
        method: "web_form",
        input: ["birth_date", "birth_time", "birth_place"],
        output: "12 palaces with major and minor star positions",
      },
      {
        name: "daily_horoscope",
        description:
          "Generate a personalized daily Zi Wei Dou Shu horoscope based on the user's natal chart and the day's transits",
        endpoint: "/daily",
        method: "web_page",
        authentication: "required",
        subscription: "required",
      },
      {
        name: "compatibility",
        description:
          "Analyze relationship compatibility between two Zi Wei Dou Shu birth charts",
        endpoint: "/compatibility",
        method: "web_page",
        authentication: "required",
        subscription: "required",
      },
      {
        name: "yearly_forecast",
        description:
          "Generate an annual Zi Wei Dou Shu forecast based on yearly transits",
        endpoint: "/yearly",
        method: "web_page",
        authentication: "required",
        subscription: "required",
      },
      {
        name: "email_consultation",
        description:
          "Human-written personalized Zi Wei Dou Shu reading delivered via email",
        endpoint: "/pricing",
        method: "web_page",
        subscription: "required",
      },
      {
        name: "api",
        description:
          "Developer API for birth chart computation and horoscope generation",
        endpoint: "/api-docs",
        method: "rest_api",
        authentication: "api_key",
      },
    ],
    pricing: {
      free_tier: "Birth chart snapshot (no signup required)",
      premium: "$4.99/month with 7-day free trial",
    },
  });
}
