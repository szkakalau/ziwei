import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb, type PDFPage } from "pdf-lib";
import { loadNotoSansScOtfBytes } from "@/lib/notoSansScFont";
import { wrapEnLinesByWidth } from "@/lib/pdfWrapEn";
import { toPdfStandardFontText } from "@/lib/pdfStandardFontText";
import type { PaidPalaceInterpretation } from "@/lib/paidPalaceInterpretationsOpenAi";
import { drawZiWeiChartGrid, type ApparentMetaForChart } from "@/lib/ziWeiChartGridPdf";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 54;
const MARGIN_BOTTOM = 56;
const MARGIN_TOP = 60;

function wrapGraphemes(text: string, maxPerLine: number): string[] {
  if (!text) return [""];
  const g = Array.from(text);
  const lines: string[] = [];
  for (let i = 0; i < g.length; i += maxPerLine) {
    lines.push(g.slice(i, i + maxPerLine).join(""));
  }
  return lines;
}

function cnCharsPerLine(size: number): number {
  return Math.max(22, Math.floor((PAGE_W - 2 * MARGIN_X) / (size * 1.02)));
}

export type RenderPaidDestinyPdfInput = {
  /** Short English lines (birth meta, disclaimers). */
  coverLinesEn: string[];
  /** iztro zh-CN astrolabe (plain data object — no methods). */
  chartZh: unknown;
  /** True solar / place shown inside the chart center panel. */
  apparentMeta?: ApparentMetaForChart;
  interpretations: PaidPalaceInterpretation[];
};

export async function renderPaidDestinyPdf(input: RenderPaidDestinyPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fontBytes = await loadNotoSansScOtfBytes();
  // subset:true can drop CJK glyphs until layout runs — star/palace names then render blank in viewers.
  const fontCn = await pdf.embedFont(fontBytes, { subset: false });
  const fontEn = await pdf.embedFont(StandardFonts.Helvetica);
  const fontEnBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;
  let pageNum = 1;

  const footer = () => {
    const label = `Page ${pageNum}`;
    page.drawText(label, {
      x: PAGE_W / 2 - fontEn.widthOfTextAtSize(label, 8) / 2,
      y: 28,
      size: 8,
      font: fontEn,
      color: rgb(0.45, 0.45, 0.48),
    });
  };

  const newPage = () => {
    footer();
    pageNum++;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN_TOP;
  };

  const needSpace = (h: number) => {
    if (y - h < MARGIN_BOTTOM) {
      newPage();
    }
  };

  const enMaxW = PAGE_W - 2 * MARGIN_X;

  const drawEn = (raw: string, size: number, bold = false, color = rgb(0.1, 0.1, 0.12)) => {
    const text = toPdfStandardFontText(raw);
    const f = bold ? fontEnBold : fontEn;
    for (const ln of wrapEnLinesByWidth(text, f, size, enMaxW)) {
      needSpace(size + 10);
      page.drawText(ln, { x: MARGIN_X, y, size, font: f, color });
      y -= size + 6;
    }
  };

  const drawCn = (raw: string, size: number, color = rgb(0.06, 0.06, 0.08)) => {
    const maxG = cnCharsPerLine(size);
    for (const ln of wrapGraphemes(raw, maxG)) {
      needSpace(size + 10);
      page.drawText(ln, { x: MARGIN_X, y, size, font: fontCn, color });
      y -= size + 6;
    }
  };

  drawEn("DestinyBlueprint — Paid Zi Wei Report", 16, true);
  y -= 4;
  drawEn("Part I: Chinese astrolabe (engine truth) · Part II: English palace commentary (AI)", 9, false);
  y -= 10;

  for (const line of input.coverLinesEn) {
    drawEn(line, 10);
  }
  y -= 8;
  drawEn("Part I (next page): traditional Chinese chart grid, same layout style as the site preview.", 9);
  footer();
  pageNum++;
  page = pdf.addPage([PAGE_W, PAGE_H]);
  y = PAGE_H - MARGIN_TOP;

  drawCn("第一部分　紫微斗数命盘（表格式真盘）", 13);
  y -= 8;

  const layout = {
    pageWidth: PAGE_W,
    pageHeight: PAGE_H,
    marginX: MARGIN_X,
    marginTop: MARGIN_TOP,
    marginBottom: MARGIN_BOTTOM,
    titleSlack: 46,
  };
  const innerH = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM - layout.titleSlack;
  const innerW = PAGE_W - 2 * MARGIN_X;
  const cell = Math.min(Math.floor(innerW / 4), Math.floor(innerH / 4));
  const gridH = 4 * cell;
  const gridBottomY = MARGIN_BOTTOM;
  drawZiWeiChartGrid({
    page,
    fontCn,
    fontEn,
    chartZh: input.chartZh,
    apparent: input.apparentMeta,
    layout,
  });
  y = gridBottomY + gridH;
  footer();

  pageNum++;
  page = pdf.addPage([PAGE_W, PAGE_H]);
  y = PAGE_H - MARGIN_TOP;

  needSpace(40);
  drawEn("Part II — Twelve palaces (English commentary)", 14, true);
  y -= 6;
  drawEn(
    "The following sections are generated in English from your chart JSON using an AI model. They are for reflection and entertainment, not medical, legal, or financial advice.",
    9,
  );
  y -= 10;

  for (const block of input.interpretations) {
    needSpace(36);
    drawEn(block.title, 12, true, rgb(0.12, 0.1, 0.2));
    y -= 2;
    for (const para of block.paragraphs) {
      drawEn(para, 10);
    }
    y -= 6;
  }

  footer();

  return pdf.save();
}
