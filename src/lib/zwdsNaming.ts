/**
 * Zi Wei Dou Shu English Naming Canon
 *
 * This is DestinyBlueprint's definitive English naming standard for all 104
 * Zi Wei Dou Shu stars. There is no universal standard across the English
 * Zi Wei Dou Shu community — different sites use different translations.
 * This file establishes a consistent, well-researched naming system:
 *
 *   • pinyin   — canonical romanized Chinese (Diacritic-free, e.g. "Zi Wei")
 *   • alias    — descriptive English name (e.g. "Emperor Star")
 *   • keywords — 3–5 search/comprehension keywords
 *
 * Design principles:
 *   1. Pinyin is the primary, authoritative identifier (no one dares translate).
 *   2. Aliases are descriptive and consistent — same pattern for same star class.
 *   3. Keywords are optimized for English-speaking user comprehension and SEO.
 *   4. Display format: "Tan Lang · Desire Star" (pinyin · alias).
 */

export interface StarNaming {
  /** Canonical pinyin romanization (diacritic-free, e.g. "Zi Wei") */
  pinyin: string;
  /** Descriptive English alias (e.g. "Emperor Star") */
  alias: string;
  /** 3-5 comprehension / SEO keywords */
  keywords: string[];
}

/**
 * Complete 104-star naming map. Keyed by iztro canonical key (same keys
 * used in STAR_ARCHETYPE_MAP). Every star that appears in the knowledge
 * base has an entry here.
 */
export const ZWDS_NAMING: Record<string, StarNaming> = {
  // ══════════════════════════════════════════════════════════════════════
  // 14 MAJOR STARS (主星) — Pinyin + Descriptive Alias
  // ══════════════════════════════════════════════════════════════════════
  emperor: {
    pinyin: "Zi Wei",
    alias: "Emperor Star",
    keywords: ["leadership", "authority", "strategy", "structure", "sovereignty"],
  },
  advisor: {
    pinyin: "Tian Ji",
    alias: "Strategist Star",
    keywords: ["intellect", "analysis", "adaptation", "planning", "foresight"],
  },
  sun: {
    pinyin: "Tai Yang",
    alias: "Sun Star",
    keywords: ["vitality", "charisma", "warmth", "visibility", "generosity"],
  },
  general: {
    pinyin: "Wu Qu",
    alias: "Marshal Star",
    keywords: ["discipline", "execution", "wealth", "determination", "resolve"],
  },
  fortunate: {
    pinyin: "Tian Tong",
    alias: "Harmony Star",
    keywords: ["peace", "empathy", "contentment", "healing", "gentleness"],
  },
  upright: {
    pinyin: "Lian Zhen",
    alias: "Virtue Star",
    keywords: ["integrity", "justice", "truth", "intensity", "conviction"],
  },
  empress: {
    pinyin: "Tian Fu",
    alias: "Empress Star",
    keywords: ["stability", "conservation", "management", "security", "abundance"],
  },
  moon: {
    pinyin: "Tai Yin",
    alias: "Moon Star",
    keywords: ["emotion", "intuition", "nurturing", "receptivity", "depth"],
  },
  wolf: {
    pinyin: "Tan Lang",
    alias: "Desire Star",
    keywords: ["charisma", "creativity", "passion", "ambition", "magnetism"],
  },
  judge: {
    pinyin: "Ju Men",
    alias: "Gate Star",
    keywords: ["discernment", "critique", "depth", "investigation", "truth-seeking"],
  },
  minister: {
    pinyin: "Tian Xiang",
    alias: "Minister Star",
    keywords: ["diplomacy", "service", "facilitation", "loyalty", "grace"],
  },
  sage: {
    pinyin: "Tian Liang",
    alias: "Sage Star",
    keywords: ["wisdom", "longevity", "mentorship", "protection", "grounding"],
  },
  sevenkillings: {
    pinyin: "Qi Sha",
    alias: "Warrior Star",
    keywords: ["courage", "decisiveness", "breakthrough", "intensity", "action"],
  },
  rebel: {
    pinyin: "Po Jun",
    alias: "Reformer Star",
    keywords: ["transformation", "innovation", "disruption", "renewal", "courage"],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 6 AUSPICIOUS STARS (吉星)
  // ══════════════════════════════════════════════════════════════════════
  wenchang: {
    pinyin: "Wen Chang",
    alias: "Scholar Star",
    keywords: ["academics", "literature", "intellect", "examinations", "culture"],
  },
  wenqu: {
    pinyin: "Wen Qu",
    alias: "Artist Star",
    keywords: ["creativity", "aesthetics", "expression", "grace", "beauty"],
  },
  tiankui: {
    pinyin: "Tian Kui",
    alias: "Patron Star",
    keywords: ["sponsorship", "elevation", "endorsement", "nobility", "promotion"],
  },
  tianyue: {
    pinyin: "Tian Yue",
    alias: "Benefactor Star",
    keywords: ["timely aid", "rescue", "support", "grace", "intervention"],
  },
  zuofu: {
    pinyin: "Zuo Fu",
    alias: "Left Hand Star",
    keywords: ["assistance", "reliability", "execution", "support", "steadiness"],
  },
  youbi: {
    pinyin: "You Bi",
    alias: "Right Hand Star",
    keywords: ["counsel", "wisdom", "guidance", "partnership", "judgment"],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 6 INAUSPICIOUS STARS (煞星)
  // ══════════════════════════════════════════════════════════════════════
  mars: {
    pinyin: "Huo Xing",
    alias: "Fire Star",
    keywords: ["urgency", "impulse", "passion", "volatility", "courage"],
  },
  lingxing: {
    pinyin: "Ling Xing",
    alias: "Bell Star",
    keywords: ["simmering", "resentment", "delayed reaction", "intensity", "depth"],
  },
  qingyang: {
    pinyin: "Qing Yang",
    alias: "Ram Star",
    keywords: ["confrontation", "force", "directness", "courage", "friction"],
  },
  tuoluo: {
    pinyin: "Tuo Luo",
    alias: "Spiral Star",
    keywords: ["stagnation", "repetition", "persistence", "delay", "endurance"],
  },
  dikong: {
    pinyin: "Di Kong",
    alias: "Void Star",
    keywords: ["emptiness", "detachment", "transcendence", "instability", "depth"],
  },
  dijie: {
    pinyin: "Di Jie",
    alias: "Calamity Star",
    keywords: ["disruption", "crisis", "loss", "resilience", "transformation"],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 4 TRANSFORMATION STARS (四化星)
  // ══════════════════════════════════════════════════════════════════════
  hualu: {
    pinyin: "Hua Lu",
    alias: "Prosperity Star",
    keywords: ["abundance", "wealth", "joy", "expansion", "reward"],
  },
  huaquan: {
    pinyin: "Hua Quan",
    alias: "Authority Star",
    keywords: ["power", "command", "influence", "decisiveness", "control"],
  },
  huake: {
    pinyin: "Hua Ke",
    alias: "Fame Star",
    keywords: ["recognition", "reputation", "achievement", "grace", "visibility"],
  },
  huaji: {
    pinyin: "Hua Ji",
    alias: "Taboo Star",
    keywords: ["contraction", "obstacle", "introspection", "refinement", "caution"],
  },

  // ══════════════════════════════════════════════════════════════════════
  // BATCH 1: 26 MINOR STARS — Fortune, Career, Peach Blossom, Karma,
  //           Virtue, Health, & Miscellaneous
  // ══════════════════════════════════════════════════════════════════════
  lucun: {
    pinyin: "Lu Cun",
    alias: "Treasurer Star",
    keywords: ["savings", "accumulation", "frugality", "stability", "prudence"],
  },
  tianma: {
    pinyin: "Tian Ma",
    alias: "Traveler Star",
    keywords: ["movement", "relocation", "travel", "freedom", "momentum"],
  },
  tianguan: {
    pinyin: "Tian Guan",
    alias: "Dignitary Star",
    keywords: ["rank", "title", "promotion", "institution", "status"],
  },
  tianfu: {
    pinyin: "Tian Fu",
    alias: "Blessed Star",
    keywords: ["fortune", "luck", "serendipity", "optimism", "protection"],
  },
  tianshou: {
    pinyin: "Tian Shou",
    alias: "Longevity Star",
    keywords: ["endurance", "patience", "late success", "persistence", "stamina"],
  },
  tiancai: {
    pinyin: "Tian Cai",
    alias: "Prodigy Star",
    keywords: ["talent", "intelligence", "skill", "aptitude", "brilliance"],
  },
  tiangui: {
    pinyin: "Tian Gui",
    alias: "Noble Star",
    keywords: ["dignity", "elite", "respect", "privilege", "bearing"],
  },
  enguang: {
    pinyin: "En Guang",
    alias: "Illumination Star",
    keywords: ["clarity", "insight", "meaning", "enlightenment", "grace"],
  },
  hongluan: {
    pinyin: "Hong Luan",
    alias: "Romance Star",
    keywords: ["love", "marriage", "partnership", "attraction", "commitment"],
  },
  tianxi: {
    pinyin: "Tian Xi",
    alias: "Celebration Star",
    keywords: ["joy", "festivity", "milestone", "happiness", "gratitude"],
  },
  xianchi: {
    pinyin: "Xian Chi",
    alias: "Seduction Star",
    keywords: ["charisma", "allure", "magnetism", "desire", "fascination"],
  },
  muyu: {
    pinyin: "Mu Yu",
    alias: "Renewal Star",
    keywords: ["cleansing", "reinvention", "fresh start", "transformation", "release"],
  },
  santai: {
    pinyin: "San Tai",
    alias: "Ascension Star",
    keywords: ["career ladder", "promotion", "progress", "hierarchy", "advancement"],
  },
  bazuo: {
    pinyin: "Ba Zuo",
    alias: "Statesman Star",
    keywords: ["governance", "institution", "authority", "stability", "diplomacy"],
  },
  taifu: {
    pinyin: "Tai Fu",
    alias: "Councillor Star",
    keywords: ["advisory", "behind-scenes", "wisdom", "influence", "strategy"],
  },
  fenggao: {
    pinyin: "Feng Gao",
    alias: "Commendation Star",
    keywords: ["award", "recognition", "honor", "achievement", "acknowledgment"],
  },
  tianxing: {
    pinyin: "Tian Xing",
    alias: "Adjudicator Star",
    keywords: ["justice", "accountability", "judgment", "consequence", "karma"],
  },
  tianyao: {
    pinyin: "Tian Yao",
    alias: "Enchantment Star",
    keywords: ["fascination", "mystery", "attraction", "charm", "intrigue"],
  },
  tianku: {
    pinyin: "Tian Ku",
    alias: "Mourning Star",
    keywords: ["grief", "loss", "depth", "sorrow", "compassion"],
  },
  tianxu: {
    pinyin: "Tian Xu",
    alias: "Emptiness Star",
    keywords: ["void", "absence", "contemplation", "potential", "space"],
  },
  yuede: {
    pinyin: "Yue De",
    alias: "Lunar Virtue Star",
    keywords: ["kindness", "grace", "quiet help", "blessing", "generosity"],
  },
  tiande: {
    pinyin: "Tian De",
    alias: "Heavenly Virtue Star",
    keywords: ["integrity", "moral compass", "righteousness", "ethics", "honor"],
  },
  longchi: {
    pinyin: "Long Chi",
    alias: "Dragon Pool Star",
    keywords: ["metamorphosis", "transformation", "ambition", "evolution", "greatness"],
  },
  fengge: {
    pinyin: "Feng Ge",
    alias: "Phoenix Pavilion Star",
    keywords: ["rebirth", "resilience", "rising", "renewal", "grace"],
  },
  tianchu: {
    pinyin: "Tian Chu",
    alias: "Nourishment Star",
    keywords: ["sustenance", "care", "comfort", "provision", "generosity"],
  },
  tianwu: {
    pinyin: "Tian Wu",
    alias: "Mystic Star",
    keywords: ["intuition", "spirituality", "transcendence", "mystery", "insight"],
  },

  // ══════════════════════════════════════════════════════════════════════
  // BATCH 2: 26 MINOR STARS — Life-Cycle (12) + Annual Sha & Auxiliary (14)
  // ══════════════════════════════════════════════════════════════════════
  // ── 12 Life-Cycle Stars (长生十二神) ──
  changsheng: {
    pinyin: "Chang Sheng",
    alias: "Birth Star",
    keywords: ["genesis", "new cycle", "initiation", "momentum", "potential"],
  },
  guandai: {
    pinyin: "Guan Dai",
    alias: "Initiation Star",
    keywords: ["apprentice", "learning", "formation", "development", "curiosity"],
  },
  linguan: {
    pinyin: "Lin Guan",
    alias: "Officiate Star",
    keywords: ["first authority", "junior leadership", "responsibility", "growth", "emergence"],
  },
  diwang: {
    pinyin: "Di Wang",
    alias: "Peak Star",
    keywords: ["apex", "summit", "maximum power", "achievement", "prime"],
  },
  shuai: {
    pinyin: "Shuai",
    alias: "Decline Star",
    keywords: ["wane", "recalibration", "rest", "wisdom transfer", "acceptance"],
  },
  bing: {
    pinyin: "Bing",
    alias: "Ailment Star",
    keywords: ["vulnerability", "depletion", "restoration", "recovery", "self-care"],
  },
  si: {
    pinyin: "Si",
    alias: "Death Star",
    keywords: ["closure", "ending", "release", "completion", "transition"],
  },
  mu: {
    pinyin: "Mu",
    alias: "Entombment Star",
    keywords: ["dormancy", "preservation", "underground work", "stillness", "incubation"],
  },
  jue: {
    pinyin: "Jue",
    alias: "Extinction Star",
    keywords: ["dissolution", "final end", "release", "surrender", "purification"],
  },
  tai: {
    pinyin: "Tai",
    alias: "Conception Star",
    keywords: ["gestation", "new spark", "potential", "fragile beginning", "hope"],
  },
  yang: {
    pinyin: "Yang",
    alias: "Nurture Star",
    keywords: ["sustaining", "growth", "daily care", "thriving", "cultivation"],
  },

  // ── 14 Annual Sha & Auxiliary Stars (年煞及杂曜) ──
  suiyi: {
    pinyin: "Sui Yi",
    alias: "Courier Star",
    keywords: ["messages", "travel", "news", "transmission", "connection"],
  },
  huagai: {
    pinyin: "Hua Gai",
    alias: "Hermit Star",
    keywords: ["solitude", "deep work", "withdrawal", "insight", "contemplation"],
  },
  jiesha: {
    pinyin: "Jie Sha",
    alias: "Robbery Star",
    keywords: ["loss risk", "theft", "vulnerability", "caution", "protection"],
  },
  zaisha: {
    pinyin: "Zai Sha",
    alias: "Calamity Sha Star",
    keywords: ["crisis", "preparation", "setback", "warning", "fortification"],
  },
  tiansha: {
    pinyin: "Tian Sha",
    alias: "Heavenly Sha Star",
    keywords: ["karmic threat", "consequence", "instinct", "alertness", "discernment"],
  },
  zhibei: {
    pinyin: "Zhi Bei",
    alias: "Accusation Star",
    keywords: ["scrutiny", "criticism", "blame", "defense", "integrity"],
  },
  jiangxing: {
    pinyin: "Jiang Xing",
    alias: "Commander Star",
    keywords: ["battlefield", "leadership", "conflict", "strategy", "command"],
  },
  panan: {
    pinyin: "Pan An",
    alias: "Ascendant Star",
    keywords: ["rising", "multi-domain growth", "ascent", "momentum", "recognition"],
  },
  suipo: {
    pinyin: "Sui Po",
    alias: "Yearbreaker Star",
    keywords: ["disruption", "pattern break", "annual reset", "upheaval", "renewal"],
  },
  longde: {
    pinyin: "Long De",
    alias: "Dragon Virtue Star",
    keywords: ["protection", "deflection", "guardian", "blessing", "shield"],
  },
  baihu: {
    pinyin: "Bai Hu",
    alias: "White Tiger Star",
    keywords: ["fierce defense", "confrontation", "guardian", "boundary", "protection"],
  },
  diaoke: {
    pinyin: "Diao Ke",
    alias: "Mourning Guest Star",
    keywords: ["witness", "grief companion", "ceremony", "compassion", "presence"],
  },
  bingfu: {
    pinyin: "Bing Fu",
    alias: "Sickness Charm Star",
    keywords: ["vulnerability", "minor ailment", "health signal", "care", "prevention"],
  },
  dahao: {
    pinyin: "Da Hao",
    alias: "Great Loss Star",
    keywords: ["major depletion", "budget", "tightening", "caution", "austerity"],
  },
  xiaohao: {
    pinyin: "Xiao Hao",
    alias: "Small Loss Star",
    keywords: ["slow leakage", "audit", "efficiency", "habits", "attention"],
  },

  // ══════════════════════════════════════════════════════════════════════
  // BATCH 3: 22 FINAL STARS — Solitude, Doctor, Year-Breaker, Shadow,
  //           Relief, & Miscellaneous
  // ══════════════════════════════════════════════════════════════════════
  guchen: {
    pinyin: "Gu Chen",
    alias: "Solitude Star",
    keywords: ["independence", "self-sufficiency", "alone", "autonomy", "depth"],
  },
  guasu: {
    pinyin: "Gua Su",
    alias: "Widower Star",
    keywords: ["loss imprint", "separation", "grief", "depth", "resilience"],
  },
  feilian: {
    pinyin: "Fei Lian",
    alias: "Gossip Star",
    keywords: ["social intelligence", "information flow", "network", "discretion", "reputation"],
  },
  posui: {
    pinyin: "Po Sui",
    alias: "Shatter Star",
    keywords: ["fragmentation", "breakage", "weakness reveal", "discernment", "truth"],
  },
  jielu: {
    pinyin: "Jie Lu",
    alias: "Obstacle Star",
    keywords: ["blocked path", "redirection", "bottleneck", "detour", "patience"],
  },
  xunkong: {
    pinyin: "Xun Kong",
    alias: "Interval Void Star",
    keywords: ["cyclical emptiness", "pause", "waiting", "preparation", "stillness"],
  },
  fubing: {
    pinyin: "Fu Bing",
    alias: "Ambush Star",
    keywords: ["hidden danger", "betrayal", "vigilance", "discernment", "trust"],
  },
  guanfu: {
    pinyin: "Guan Fu",
    alias: "Officialdom Star",
    keywords: ["bureaucracy", "institution", "process", "compliance", "navigation"],
  },
  boshi: {
    pinyin: "Bo Shi",
    alias: "Erudite Star",
    keywords: ["scholarship", "expertise", "knowledge", "authority", "depth"],
  },
  lishi: {
    pinyin: "Li Shi",
    alias: "Strongman Star",
    keywords: ["endurance", "strength", "willpower", "service", "resilience"],
  },
  qinglong: {
    pinyin: "Qing Long",
    alias: "Green Dragon Star",
    keywords: ["renewal", "revival", "spring", "growth", "restoration"],
  },
  jiangjun: {
    pinyin: "Jiang Jun",
    alias: "General Star",
    keywords: ["strategic command", "long-term", "campaign", "persistence", "leadership"],
  },
  zoushu: {
    pinyin: "Zou Shu",
    alias: "Memorialist Star",
    keywords: ["recording", "preservation", "memory", "history", "documentation"],
  },
  xishen: {
    pinyin: "Xi Shen",
    alias: "Joy Spirit Star",
    keywords: ["happiness", "magnetism", "celebration", "delight", "warmth"],
  },
  suijian: {
    pinyin: "Sui Jian",
    alias: "Year Architect Star",
    keywords: ["annual planning", "structure", "calendar", "foresight", "design"],
  },
  huiqi: {
    pinyin: "Hui Qi",
    alias: "Gloom Star",
    keywords: ["sadness", "melancholy", "depth", "shadow work", "honesty"],
  },
  sangmen: {
    pinyin: "Sang Men",
    alias: "Mourning Gate Star",
    keywords: ["threshold", "loss passage", "grief journey", "transition", "healing"],
  },
  guansuo: {
    pinyin: "Guan Suo",
    alias: "Binding Star",
    keywords: ["commitment", "obligation", "chain", "loyalty", "sacred bond"],
  },
  yinsha: {
    pinyin: "Yin Sha",
    alias: "Shadow Sha Star",
    keywords: ["repressed", "shadow work", "hidden truth", "revelation", "depth"],
  },
  tiankong: {
    pinyin: "Tian Kong",
    alias: "Sky Void Star",
    keywords: ["boundless possibility", "options", "freedom", "choice", "potential"],
  },
  tianjie: {
    pinyin: "Tian Jie",
    alias: "Relief Star",
    keywords: ["burden easing", "release", "resolution", "lightening", "help"],
  },
  earthrelief: {
    pinyin: "Di Jie",
    alias: "Earth Relief Star",
    keywords: ["practical help", "tangible support", "grounding", "solution", "aid"],
  },
};

// ═══════════════════════════════════════════════════════════════════════
// Archetype Label → iztro Key Reverse Map
//
// The daily horoscope API returns human-readable archetype labels
// (e.g. "Architect", "Catalyst") rather than raw iztro keys (e.g.
// "emperor", "wolf"). This reverse map lets naming lookups resolve
// through either path — pass "Architect" or "emperor", same result.
// ═══════════════════════════════════════════════════════════════════════

const ARCHETYPE_TO_KEY: Record<string, string> = {
  // 14 Major
  architect: "emperor",
  synthesizer: "advisor",
  radiator: "sun",
  executor: "general",
  harmonizer: "fortunate",
  intensifier: "upright",
  stabilizer: "empress",
  resonator: "moon",
  catalyst: "wolf",
  interrogator: "judge",
  facilitator: "minister",
  anchor: "sage",
  disruptor: "sevenkillings",
  reconstructor: "rebel",
  // 6 Auspicious
  scholar: "wenchang",
  artist: "wenqu",
  patron: "tiankui",
  benefactor: "tianyue",
  lefthand: "zuofu",
  righthand: "youbi",
  // 6 Inauspicious
  kindler: "mars",
  smolderer: "lingxing",
  ram: "qingyang",
  spinner: "tuoluo",
  void: "dikong",
  breaker: "dijie",
  // 4 Transformation
  abundance: "hualu",
  command: "huaquan",
  recognition: "huake",
  contraction: "huaji",
  // Batch 1
  treasurer: "lucun",
  traveler: "tianma",
  dignitary: "tianguan",
  blessed: "tianfu",
  enduring: "tianshou",
  prodigy: "tiancai",
  noble: "tiangui",
  illuminated: "enguang",
  romancer: "hongluan",
  celebrant: "tianxi",
  seductress: "xianchi",
  refresher: "muyu",
  ascender: "santai",
  statesman: "bazuo",
  councillor: "taifu",
  commended: "fenggao",
  adjudicator: "tianxing",
  enchantress: "tianyao",
  mourner: "tianku",
  hollow: "tianxu",
  lunarbenevolence: "yuede",
  virtuous: "tiande",
  dragonborn: "longchi",
  phoenixborne: "fengge",
  nourisher: "tianchu",
  mystic: "tianwu",
  // Batch 2 — Life-Cycle
  birth: "changsheng",
  initiate: "guandai",
  officiate: "linguan",
  peak: "diwang",
  wane: "shuai",
  ail: "bing",
  end: "si",
  entomb: "mu",
  extinguish: "jue",
  conceive: "tai",
  nurture: "yang",
  // Batch 2 — Annual Sha & Auxiliary
  courier: "suiyi",
  hermit: "huagai",
  robber: "jiesha",
  calamity: "zaisha",
  heavenlysha: "tiansha",
  accuser: "zhibei",
  commander: "jiangxing",
  ascendant: "panan",
  yearbreaker: "suipo",
  dragonvirtue: "longde",
  whitetiger: "baihu",
  mournerguest: "diaoke",
  sickcharm: "bingfu",
  bigloss: "dahao",
  smallloss: "xiaohao",
  // Batch 3
  solitary: "guchen",
  widower: "guasu",
  gossiper: "feilian",
  shattered: "posui",
  blocker: "jielu",
  intervalvoid: "xunkong",
  ambush: "fubing",
  officialdom: "guanfu",
  erudite: "boshi",
  strongman: "lishi",
  greendragon: "qinglong",
  generalstar: "jiangjun",
  memorialist: "zoushu",
  joygod: "xishen",
  yearbuilder: "suijian",
  gloom: "huiqi",
  mourninggate: "sangmen",
  binder: "guansuo",
  shadowsha: "yinsha",
  skyvoid: "tiankong",
  reliever: "tianjie",
  earthrelief: "earthrelief",
};

/**
 * Raw iztro variant names that don't match either the canonical key
 * or the archetype label. Maps iztro's English output → canonical key.
 * Mirrors STAR_ALIASES in zwdsKnowledge.ts for naming-only lookups.
 */
const RAW_ALIAS_TO_KEY: Record<string, string> = {
  horse: "tianma",
  advocator: "minister",
  marshal: "general",
  literary: "wenchang",
  literature: "wenqu",
  leaderstar: "tiankui",
  halberd: "tianyue",
  leftassist: "zuofu",
  rightassist: "youbi",
  firestar: "mars",
  goat: "qingyang",
  topstar: "tuoluo",
  earthvoid: "dikong",
  earthcalamity: "dijie",
  prosperitystar: "hualu",
  authoritystar: "huaquan",
  famestar: "huake",
  taboostar: "huaji",
  allure: "tianyao",
  cry: "tianku",
  lovebird: "hongluan",
  treasury: "lucun",
};

// ═══════════════════════════════════════════════════════════════════════
// Lookup Utilities
// ═══════════════════════════════════════════════════════════════════════

/**
 * Case-insensitive, whitespace-insensitive lookup of a star name to its
 * naming entry. Resolves through three paths:
 *   1. Direct iztro canonical key ("emperor", "wolf")
 *   2. Archetype label reverse lookup ("Architect", "Catalyst")
 *   3. Raw iztro variant name ("horse", "advocator")
 * Returns null if no entry exists.
 */
export function getStarNaming(rawName: string): StarNaming | null {
  const key = rawName.toLowerCase().replace(/\s+/g, "");
  // Try direct, then archetype, then raw alias
  const resolvedKey =
    ZWDS_NAMING[key] ? key :
    ARCHETYPE_TO_KEY[key] ??
    RAW_ALIAS_TO_KEY[key] ??
    null;
  return resolvedKey ? ZWDS_NAMING[resolvedKey] ?? null : null;
}

/** Return the pinyin name for a star, or the original name if unknown. */
export function getStarPinyin(rawName: string): string {
  return getStarNaming(rawName)?.pinyin ?? rawName;
}

/** Return the English alias for a star, or empty string if unknown. */
export function getStarAlias(rawName: string): string {
  return getStarNaming(rawName)?.alias ?? "";
}

/** Return the keywords array for a star, or empty array if unknown. */
export function getStarKeywords(rawName: string): string[] {
  return getStarNaming(rawName)?.keywords ?? [];
}

/**
 * Display-formatted star name: "Tan Lang · Desire Star"
 * Falls back gracefully — if no alias, just pinyin; if no pinyin, just raw name.
 */
export function formatStarName(rawName: string): string {
  const naming = getStarNaming(rawName);
  if (!naming) return rawName;
  return `${naming.pinyin} · ${naming.alias}`;
}

/**
 * Two-line display format, returning {pinyin, alias} for flexible layout.
 * Ideal for UI where pinyin and alias render on separate lines.
 */
export function starDisplayParts(rawName: string): { pinyin: string; alias: string } {
  const naming = getStarNaming(rawName);
  return {
    pinyin: naming?.pinyin ?? rawName,
    alias: naming?.alias ?? "",
  };
}

/**
 * Reverse lookup: find all stars whose alias or pinyin contains the query string.
 * Case-insensitive. Useful for search/autocomplete.
 */
export function searchStars(query: string): Array<{ key: string } & StarNaming> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return Object.entries(ZWDS_NAMING)
    .filter(
      ([, v]) =>
        v.pinyin.toLowerCase().includes(q) ||
        v.alias.toLowerCase().includes(q) ||
        v.keywords.some((k) => k.toLowerCase().includes(q)),
    )
    .map(([key, value]) => ({ key, ...value }));
}

/**
 * Get all stars grouped by their class for documentation / reference pages.
 */
export type StarClass =
  | "major"
  | "auspicious"
  | "inauspicious"
  | "transformation"
  | "minor";

const STAR_CLASS_MAP: Record<string, StarClass> = {
  // Major (14)
  emperor: "major", advisor: "major", sun: "major", general: "major",
  fortunate: "major", upright: "major", empress: "major", moon: "major",
  wolf: "major", judge: "major", minister: "major", sage: "major",
  sevenkillings: "major", rebel: "major",
  // Auspicious (6)
  wenchang: "auspicious", wenqu: "auspicious", tiankui: "auspicious",
  tianyue: "auspicious", zuofu: "auspicious", youbi: "auspicious",
  // Inauspicious (6)
  mars: "inauspicious", lingxing: "inauspicious", qingyang: "inauspicious",
  tuoluo: "inauspicious", dikong: "inauspicious", dijie: "inauspicious",
  // Transformation (4)
  hualu: "transformation", huaquan: "transformation",
  huake: "transformation", huaji: "transformation",
  // Everything else is minor
};

export function getStarClass(rawName: string): StarClass {
  const key = rawName.toLowerCase().replace(/\s+/g, "");
  return STAR_CLASS_MAP[key] ?? "minor";
}
