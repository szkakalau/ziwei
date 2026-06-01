import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, renderToStream } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf", fontWeight: 600 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Inter",
    backgroundColor: "#0a0a0f",
    color: "#e5e5e5",
  },
  brand: {
    fontSize: 10,
    color: "#fbbf24",
    textTransform: "uppercase" as const,
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: "#f5f5f5",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 32,
  },
  divider: {
    borderBottom: "1px solid rgba(251,191,36,0.15)",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fbbf24",
    marginBottom: 8,
    marginTop: 20,
  },
  body: {
    fontSize: 12,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 12,
  },
  footer: {
    position: "absolute" as const,
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "rgba(255,255,255,0.15)",
    textAlign: "center" as const,
  },
});

interface YearlyPdfProps {
  year: number;
  reading: string;
}

function YearlyPdfDocument({ year, reading }: YearlyPdfProps) {
  const sections = reading.split("###").filter(Boolean).map((s) => {
    const [heading, ...body] = s.trim().split("\n");
    return { heading: heading.trim(), body: body.join("\n").trim() };
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>DestinyBlueprint</Text>
        <Text style={styles.title}>Your {year} Zi Wei Dou Shu Annual Forecast</Text>
        <Text style={styles.subtitle}>
          Personalized reading based on your birth chart • Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </Text>
        <View style={styles.divider} />

        {sections.map((s) => (
          <React.Fragment key={s.heading}>
            <Text style={styles.sectionTitle}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </React.Fragment>
        ))}

        <Text style={styles.footer}>
          DestinyBlueprint — Zi Wei Dou Shu • For entertainment and self-reflection purposes only
        </Text>
      </Page>
    </Document>
  );
}

export async function generateYearlyPdf(year: number, reading: string): Promise<Buffer> {
  const stream = await renderToStream(<YearlyPdfDocument year={year} reading={reading} />);
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
