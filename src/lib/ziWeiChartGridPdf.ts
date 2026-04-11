/**
 * Traditional-style Zi Wei Dou Shu grid (4×4 with merged center 2×2),
 * matching the layout pattern of public/images/destiny-chart-preview.jpg.
 */

import { rgb, type PDFPage, type PDFFont } from "pdf-lib";

/** Palace names as returned by iztro zh-CN (fixed set). */
const PALACE_GRID_POS: Record<string, { r: number; c: number }> = {
  父母: { r: 3, c: 0 },
  福德: { r: 3, c: 1 },
  田宅: { r: 3, c: 2 },
  官禄: { r: 3, c: 3 },
  兄弟: { r: 2, c: 0 },
  仆役: { r: 2, c: 3 },
  命宫: { r: 1, c: 0 },
  迁移: { r: 1, c: 3 },
  子女: { r: 0, c: 0 },
  夫妻: { r: 0, c: 1 },
  财帛: { r: 0, c: 2 },
  疾厄: { r: 0, c: 3 },
};

export type ApparentMetaForChart = {
  apparentSolarDate: string;
  apparentSolarTime: string;
  placeLabel?: string;
};

type StarLite = { name?: string; brightness?: string; mutagen?: string };
type PalaceLite = {
  name?: string;
  isBodyPalace?: boolean;
  heavenlyStem?: string;
  earthlyBranch?: string;
  majorStars?: StarLite[];
  minorStars?: StarLite[];
  adjectiveStars?: StarLite[];
  changsheng12?: string;
  boshi12?: string;
  decadal?: { range?: number[]; heavenlyStem?: string; earthlyBranch?: string };
  ages?: number[];
};

type ChartLite = {
  gender?: string;
  solarDate?: string;
  lunarDate?: string;
  chineseDate?: string;
  time?: string;
  timeRange?: string;
  soul?: string;
  body?: string;
  fiveElementsClass?: string;
  earthlyBranchOfSoulPalace?: string;
  earthlyBranchOfBodyPalace?: string;
  palaces?: PalaceLite[];
};

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/** Header strip height inside each palace cell (宫名 + 干支). */
const HEADER_H = 20;
/** Reserve bottom of cell for 大限/小限 so star text never draws into that band. */
const RESERVED_CELL_BOTTOM = 40;

function drawPalaceCell(
  page: PDFPage,
  font: PDFFont,
  x: number,
  yBottom: number,
  w: number,
  h: number,
  p: PalaceLite,
) {
  const border = rgb(0.45, 0.45, 0.48);
  page.drawRectangle({ x, y: yBottom, width: w, height: h, borderColor: border, borderWidth: 0.45 });

  const pad = 4;
  const yTop = yBottom + h - pad;
  const bodyTop = yTop - HEADER_H;
  const yContentFloor = yBottom + RESERVED_CELL_BOTTOM;

  // —— 顶栏：宫名 + 干支（宽度不足时折行，不越出格宽）
  page.drawRectangle({
    x,
    y: bodyTop,
    width: w,
    height: HEADER_H - 1,
    color: rgb(0.94, 0.94, 0.95),
    borderColor: border,
    borderWidth: 0.25,
  });

  const pname = (p.name ?? "宫位").trim();
  const branch = (p.earthlyBranch ?? "").trim();
  const stem = (p.heavenlyStem ?? "").trim();
  const stemBranch = stem && branch ? `${stem}${branch}` : stem || branch || "";
  const bodyTag = p.isBodyPalace ? "（身宫）" : "";
  const headerPrimary = `${pname}${bodyTag}`;
  const headerLine = stemBranch ? `${headerPrimary}　${stemBranch}` : headerPrimary;
  let hy = bodyTop + HEADER_H - 7;
  for (const seg of wrapByWidth(headerLine, font, 8.5, w - 2 * pad)) {
    page.drawText(seg, {
      x: x + pad,
      y: hy,
      size: 8.5,
      font,
      color: rgb(0.78, 0.08, 0.1),
    });
    hy -= 9;
    if (hy < bodyTop + 2) break;
  }

  // —— 主星（逐条列出，带庙陷与四化）
  let y = bodyTop - 4;
  page.drawText("主星", { x: x + pad, y, size: 6.2, font, color: rgb(0.35, 0.35, 0.4) });
  y -= 8;

  const majors = p.majorStars ?? [];
  if (!majors.length) {
    if (y >= yContentFloor) {
      page.drawText("（本宫无主星）", { x: x + pad, y, size: 7, font, color: rgb(0.45, 0.45, 0.5) });
      y -= 9;
    }
  } else {
    for (const s of majors) {
      const nm = (s.name ?? "").trim();
      if (!nm) continue;
      const br = (s.brightness ?? "").trim();
      const mut = (s.mutagen ?? "").trim();
      let line = br ? `${nm}　${br}` : nm;
      if (mut) line += `　化${mut}`;
      if (y < yContentFloor) break;
      for (const seg of wrapByWidth(line, font, 7.2, w - 2 * pad)) {
        if (y < yContentFloor) break;
        page.drawText(seg, { x: x + pad, y, size: 7.2, font, color: rgb(0.05, 0.05, 0.09) });
        y -= 8.2;
      }
    }
  }

  // —— 辅曜 / 杂曜（显式标签 + 名单）
  const minorNames = (p.minorStars ?? []).map((s) => (s.name ?? "").trim()).filter(Boolean) as string[];
  const adjNames = (p.adjectiveStars ?? []).map((s) => (s.name ?? "").trim()).filter(Boolean) as string[];
  const aux = [...minorNames, ...adjNames];
  if (aux.length && y >= yContentFloor + 10) {
    page.drawText("辅曜", { x: x + pad, y, size: 6.2, font, color: rgb(0.35, 0.35, 0.4) });
    y -= 8;
    const auxText = aux.join("、");
    for (const seg of wrapByWidth(auxText, font, 6.4, w - 2 * pad)) {
      if (y < yContentFloor) break;
      page.drawText(seg, { x: x + pad, y, size: 6.4, font, color: rgb(0.18, 0.18, 0.22) });
      y -= 7.2;
    }
  }

  const sx = [p.changsheng12, p.boshi12].filter(Boolean).join(" · ");
  if (sx && y >= yContentFloor + 6) {
    page.drawText(truncate(`神煞 ${sx}`, 24), { x: x + pad, y, size: 5.8, font, color: rgb(0.32, 0.32, 0.36) });
    y -= 7;
  }

  // —— 大限 / 小限（固定在格内下方，避免与星曜区重叠）
  const dec = p.decadal;
  if (dec?.range?.length === 2) {
    const dr = `大限 ${dec.range[0]}~${dec.range[1]}岁`;
    let dy = yBottom + 22;
    for (const seg of wrapByWidth(dr, font, 7, w - 2 * pad)) {
      page.drawText(seg, {
        x: x + pad,
        y: dy,
        size: 7,
        font,
        color: rgb(0.1, 0.1, 0.14),
      });
      dy -= 8;
      if (dy < yBottom + 10) break;
    }
  }

  const ages = (p.ages ?? []).slice(0, 8);
  if (ages.length) {
    const t = `小限 ${ages.join(" ")}`;
    let sy = yBottom + 10;
    for (const seg of wrapByWidth(t, font, 5.4, w - 2 * pad)) {
      page.drawText(seg, {
        x: x + pad,
        y: sy,
        size: 5.4,
        font,
        color: rgb(0.38, 0.38, 0.42),
      });
      sy -= 6.5;
      if (sy < yBottom + 2) break;
    }
  }
}

function wrapByWidth(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const g = Array.from(text);
  const lines: string[] = [];
  let cur = "";
  for (const ch of g) {
    const trial = cur + ch;
    if (font.widthOfTextAtSize(trial, size) > maxW && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = trial;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function drawCenterBlock(
  page: PDFPage,
  fontCn: PDFFont,
  fontEn: PDFFont,
  x: number,
  yBottom: number,
  w: number,
  h: number,
  chart: ChartLite,
  apparent?: ApparentMetaForChart,
) {
  const border = rgb(0.45, 0.45, 0.48);
  page.drawRectangle({ x, y: yBottom, width: w, height: h, borderColor: border, borderWidth: 0.45 });

  let y = yBottom + h - 8;
  const pad = 6;
  const minY = yBottom + 10;
  const maxW = w - 2 * pad;

  const drawLines = (text: string, size: number, color: ReturnType<typeof rgb>): boolean => {
    for (const ln of wrapByWidth(text, fontCn, size, maxW)) {
      if (y < minY + 18) return false;
      page.drawText(ln, { x: x + pad, y, size, font: fontCn, color });
      y -= size + 2;
    }
    return true;
  };

  const title = "DestinyBlueprint · 命盘";
  let ok = y >= minY + 40;
  if (ok) {
    page.drawText(title, { x: x + pad, y, size: 9, font: fontCn, color: rgb(0.08, 0.08, 0.12) });
    y -= 12;
  }
  const g = chart.gender ?? "—";
  const fe = chart.fiveElementsClass ?? "—";
  ok = ok && drawLines(`${g}　${fe}`, 8, rgb(0.12, 0.12, 0.15));
  ok = ok && (!chart.solarDate || drawLines(`阳历：${chart.solarDate}`, 7, rgb(0.2, 0.2, 0.24)));
  ok = ok && (!(chart.timeRange || chart.time) || drawLines(`时辰：${chart.timeRange ?? chart.time}`, 7, rgb(0.2, 0.2, 0.24)));
  ok = ok && (!chart.lunarDate || drawLines(`农历：${chart.lunarDate}`, 7, rgb(0.2, 0.2, 0.24)));
  if (ok && apparent) {
    const line = `真太阳时盘：${apparent.apparentSolarDate} ${apparent.apparentSolarTime}`;
    ok = drawLines(line, 7, rgb(0.25, 0.18, 0.08));
    ok = ok && (!apparent.placeLabel || drawLines(`地点：${apparent.placeLabel}`, 7, rgb(0.2, 0.2, 0.24)));
  }
  ok = ok && (!chart.chineseDate || drawLines(`四柱：${chart.chineseDate}`, 8, rgb(0.1, 0.1, 0.14)));
  ok =
    ok &&
    (!(chart.soul || chart.body) ||
      drawLines(`命主 ${chart.soul ?? "—"}　身主 ${chart.body ?? "—"}`, 7.5, rgb(0.15, 0.15, 0.18)));
  ok =
    ok &&
    (!(chart.earthlyBranchOfSoulPalace || chart.earthlyBranchOfBodyPalace) ||
      drawLines(
        `命宫支 ${chart.earthlyBranchOfSoulPalace ?? "—"}　身宫支 ${chart.earthlyBranchOfBodyPalace ?? "—"}`,
        7,
        rgb(0.2, 0.2, 0.24),
      ));

  if (ok) {
    y -= 2;
    if (y >= minY + 14) {
      page.drawText("四化：禄(绿) 权(红) 科(蓝) 忌(红)", {
        x: x + pad,
        y,
        size: 6.5,
        font: fontCn,
        color: rgb(0.3, 0.3, 0.34),
      });
    }
  }

  page.drawText("© chart data: iztro", {
    x: x + pad,
    y: yBottom + 6,
    size: 6,
    font: fontEn,
    color: rgb(0.45, 0.45, 0.5),
  });
}

export type ChartPdfLayout = {
  pageWidth?: number;
  pageHeight?: number;
  marginX?: number;
  marginTop?: number;
  marginBottom?: number;
  /** Vertical space reserved for the page title above the grid. */
  titleSlack?: number;
};

/**
 * Draws the 4×4 grid. Cell size is derived from page margins so the grid stays on-page.
 */
export function drawZiWeiChartGrid(params: {
  page: PDFPage;
  fontCn: PDFFont;
  fontEn: PDFFont;
  chartZh: unknown;
  apparent?: ApparentMetaForChart;
  /** @deprecated prefer layout; used when layout omitted */
  gridBottomY?: number;
  cellSize?: number;
  layout?: ChartPdfLayout;
}): void {
  const PW = params.layout?.pageWidth ?? 612;
  const PH = params.layout?.pageHeight ?? 792;
  const mx = params.layout?.marginX ?? 48;
  const mt = params.layout?.marginTop ?? 52;
  const mb = params.layout?.marginBottom ?? 50;
  const slack = params.layout?.titleSlack ?? 40;
  const innerW = PW - 2 * mx;
  const innerH = PH - mt - mb - slack;
  const computedCell = Math.min(Math.floor(innerW / 4), Math.floor(innerH / 4));
  const CELL = params.cellSize ?? Math.max(1, computedCell);
  const GRID = 4 * CELL;
  const gridLeftX = (PW - GRID) / 2;
  const yb = params.gridBottomY ?? mb;

  const { page, fontCn, fontEn } = params;
  const chart = params.chartZh as ChartLite;
  const palaces = Array.isArray(chart.palaces) ? chart.palaces : [];
  const byName = new Map<string, PalaceLite>();
  for (const p of palaces) {
    const n = (p.name ?? "").trim();
    if (n) byName.set(n, p);
  }

  for (const [name, pos] of Object.entries(PALACE_GRID_POS)) {
    const p = byName.get(name);
    if (!p) continue;
    const x = gridLeftX + pos.c * CELL;
    const yCell = yb + pos.r * CELL;
    drawPalaceCell(page, fontCn, x, yCell, CELL, CELL, p);
  }

  const cx = gridLeftX + CELL;
  const cy = yb + CELL;
  drawCenterBlock(page, fontCn, fontEn, cx, cy, CELL * 2, CELL * 2, chart, params.apparent);
}
