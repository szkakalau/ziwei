/**
 * Local sample: paid-style PDF (Chinese astrolabe + English palace commentary).
 *
 * Usage:
 *   npx tsx scripts/gen-paid-pdf-sample.ts
 *
 * PDF is written to public/output/. With `npm run dev`, open in browser:
 *   http://localhost:3000/api/dev/sample-paid-pdf?date=1978-11-09
 * (Static /output/... can 404 if the file was never generated or is gitignored.)
 *
 * Loads `.env.local` if present (simple KEY=value lines).
 * Set DEEPSEEK_API_KEY (preferred) or OPENAI_API_KEY for full LLM text; otherwise placeholders.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { computeBirthChart } from "../src/lib/computeBirthChart";
import { buildZhChartPlainForMeta } from "../src/lib/chartZhForPaidPdf";
import { fetchPaidPalaceInterpretations } from "../src/lib/paidPalaceInterpretationsOpenAi";
import type { PaidPalaceInterpretation } from "../src/lib/paidPalaceInterpretationsOpenAi";
import { renderPaidDestinyPdf } from "../src/lib/renderPaidDestinyPdf";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const txt = readFileSync(p, "utf8");
  for (const line of txt.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function mockInterpretations(keys: string[]): PaidPalaceInterpretation[] {
  return keys.map((key) => ({
    palaceKey: key,
    title: `${key.replace(/^\w/, (c) => c.toUpperCase())} palace (placeholder — set DEEPSEEK_API_KEY or OPENAI_API_KEY)`,
    paragraphs: [
      `Sample placeholder for the “${key}” palace. Configure DEEPSEEK_API_KEY or OPENAI_API_KEY in .env.local and re-run.`,
    ],
  }));
}

async function main() {
  loadEnvLocal();
  process.env.NOMINATIM_USER_AGENT ||= "DestinyBlueprint-local-pdf-sample/1.0 (local script)";

  const birthDate = process.argv[2] || "1978-11-09";
  const birthTime = process.argv[3] || "20:15";
  const location = process.argv[4] || "Shenzhen, Guangdong, China";
  const gender = (process.argv[5] === "female" ? "female" : "male") as "male" | "female";

  console.log("Computing chart:", { birthDate, birthTime, location, gender });

  const chartResult = await computeBirthChart({
    birthDate,
    birthTime,
    gender,
    location,
    allowFallback: true,
  });

  if (!chartResult.ok) {
    console.error("computeBirthChart failed:", chartResult.errorCode);
    process.exit(1);
  }

  const meta = chartResult.meta;
  const chartZhPlain = buildZhChartPlainForMeta(meta, gender);

  const palaceKeys = (
    (chartResult.chart as { palaces?: Array<{ name?: string }> }).palaces ?? []
  ).map((p) => String(p.name ?? "").trim());

  let interpretations: PaidPalaceInterpretation[];
  if (process.env.DEEPSEEK_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim()) {
    console.log("Calling LLM (DeepSeek preferred) for twelve-palace commentary…");
    interpretations = await fetchPaidPalaceInterpretations({
      chart: chartResult.chart,
      meta,
    });
  } else {
    console.warn("DEEPSEEK_API_KEY / OPENAI_API_KEY missing — using placeholder English blocks.");
    interpretations = mockInterpretations(palaceKeys);
  }

  const generatedAt = new Date().toISOString();
  const coverLinesEn = [
    `LOCAL SAMPLE (not a Stripe purchase)`,
    `Report generated (UTC): ${generatedAt}`,
    `Input: ${birthDate} ${birthTime} · ${location}`,
    `Apparent solar used for the chart: ${meta.apparentSolarDate} ${meta.apparentSolarTime}`,
    `Place: ${meta.placeLabel}`,
    `Time zone: ${meta.timezone}${meta.isApproximate ? " · Approximate chart" : ""}`,
    "",
    "Disclaimer: For reflection and entertainment only.",
  ];

  console.log("Rendering PDF (font download on first run may take a while)…");
  const bytes = await renderPaidDestinyPdf({
    coverLinesEn,
    chartZh: chartZhPlain,
    apparentMeta: {
      apparentSolarDate: meta.apparentSolarDate,
      apparentSolarTime: meta.apparentSolarTime,
      placeLabel: meta.placeLabel,
    },
    interpretations,
  });

  const outDir = resolve(process.cwd(), "public", "output");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, `sample-paid-report-${birthDate}.pdf`);
  writeFileSync(outPath, Buffer.from(bytes));
  console.log("Wrote:", outPath);
  console.log(
    "Browser (npm run dev, then open): http://localhost:3000/api/dev/sample-paid-pdf?date=" +
      birthDate,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
