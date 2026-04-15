import type { BirthChartMeta } from "@/lib/computeBirthChart";
import { buildZhChartPlainForMeta } from "@/lib/chartZhForPaidPdf";

const MAX_CHART_JSON_CHARS = 28_000;

const ZIWEI_DEEPSEEK_USER_PREAMBLE = `你现在是资深的国学易经术数领域专家，请详细分析下面这个紫微斗数命盘，综合使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，对命盘十二宫星曜分布、限流叠宫和各宫位间的飞宫四化进行细致分析，进而对命主的健康、学业、事业、财运、人际关系、婚姻和感情等各个方面进行全面分析和总结，关键事件须给出发生时间范围、吉凶属性、事件对命主的影响程度等信息，并结合命主的自身特点给出针对性的解决方案和建议。命盘数据中包含十二个大限及流年信息之处，请对前八个大限的所有流年进行分析，给出每一年需要关注的重大事件和注意事项。全文使用简体中文撰写。最后，在结论部分再次明确提醒：上述分析仅限于研究或娱乐目的使用，不构成医疗、法律、投资等专业意见。

说明：命盘事实以文末「紫微斗数命盘数据」JSON 为唯一依据（由本站 iztro 排盘引擎生成，字段含义与常见桌面排盘软件类似但排版不同）；请严格依据 JSON 中的星曜、宫位、庙旺利陷、生年四化、大限、流年等字段立论，不得臆造与 JSON 相矛盾的盘势。

--- 排盘校正与元数据 ---
`;

function metaBlock(meta: BirthChartMeta): string {
  const approx = meta.isApproximate
    ? "是（时区或真太阳时等校正可能不完整，论断仅供参考）"
    : "否";
  return [
    `用于排盘的真太阳历法日期：${meta.apparentSolarDate}`,
    `用于排盘的真太阳历法时刻：${meta.apparentSolarTime}`,
    `地点：${meta.placeLabel}`,
    `时区标注：${meta.timezone}`,
    `是否标记为近似盘：${approx}`,
    "",
  ].join("\n");
}

/**
 * 生成发给 DeepSeek 的「术数专家 + 结构化命盘」用户提示词（简体中文任务说明 + zh-CN 命盘 JSON）。
 * 用途：**Stripe 付款成功邮件**里的长文解读（`generateDeepSeekReport`），与前端无耦合。
 *
 * 付费 **PDF 第二部分**（十二宫英文解读）走另一条链路：`fetchPaidPalaceInterpretations`
 *（`paidPalaceInterpretationsOpenAi.ts`，同样优先 DeepSeek），与本文提示词并行、互不覆盖。
 */
export function chartToAiPrompt(params: {
  meta: BirthChartMeta;
  gender: "male" | "female";
  /** 若需调试可传入已构建盘；否则由 meta+gender 生成 zh-CN 盘 */
  chart?: unknown;
}): string {
  const chart = params.chart ?? buildZhChartPlainForMeta(params.meta, params.gender);
  let chartJson: string;
  try {
    chartJson = JSON.stringify(chart, null, 2);
  } catch {
    chartJson = String(chart);
  }
  if (chartJson.length > MAX_CHART_JSON_CHARS) {
    chartJson = `${chartJson.slice(0, MAX_CHART_JSON_CHARS)}\n\n[…因长度截断…]`;
  }

  return `${ZIWEI_DEEPSEEK_USER_PREAMBLE}${metaBlock(params.meta)}--- 紫微斗数命盘数据（JSON） ---
${chartJson}
--- 命盘数据结束 ---

请按任务说明输出完整分析（可使用小标题分段）。`;
}
