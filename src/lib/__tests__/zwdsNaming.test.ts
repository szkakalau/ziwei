import { describe, it, expect } from "vitest";
import {
  ZWDS_NAMING,
  getStarNaming,
  getStarPinyin,
  getStarAlias,
  getStarKeywords,
  formatStarName,
  starDisplayParts,
  searchStars,
  getStarClass,
} from "@/lib/zwdsNaming";

describe("ZWDS_NAMING", () => {
  it("has all 104 star entries", () => {
    const keys = Object.keys(ZWDS_NAMING);
    expect(keys.length).toBe(104);
  });

  it("every entry has pinyin, alias, and at least 3 keywords", () => {
    for (const [key, entry] of Object.entries(ZWDS_NAMING)) {
      expect(entry.pinyin, `${key} missing pinyin`).toBeTruthy();
      expect(entry.alias, `${key} missing alias`).toBeTruthy();
      expect(
        entry.keywords.length,
        `${key} has ${entry.keywords.length} keywords (need ≥3)`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("14 major stars have correct pinyin", () => {
    expect(ZWDS_NAMING.emperor.pinyin).toBe("Zi Wei");
    expect(ZWDS_NAMING.advisor.pinyin).toBe("Tian Ji");
    expect(ZWDS_NAMING.sun.pinyin).toBe("Tai Yang");
    expect(ZWDS_NAMING.general.pinyin).toBe("Wu Qu");
    expect(ZWDS_NAMING.wolf.pinyin).toBe("Tan Lang");
    expect(ZWDS_NAMING.rebel.pinyin).toBe("Po Jun");
  });

  it("14 major stars have correct aliases", () => {
    expect(ZWDS_NAMING.emperor.alias).toBe("Emperor Star");
    expect(ZWDS_NAMING.advisor.alias).toBe("Strategist Star");
    expect(ZWDS_NAMING.sun.alias).toBe("Sun Star");
    expect(ZWDS_NAMING.wolf.alias).toBe("Desire Star");
    expect(ZWDS_NAMING.sevenkillings.alias).toBe("Warrior Star");
    expect(ZWDS_NAMING.rebel.alias).toBe("Reformer Star");
  });

  it("no star alias repeats across entries", () => {
    const aliases = Object.values(ZWDS_NAMING).map((v) => v.alias.toLowerCase());
    const uniq = new Set(aliases);
    expect(uniq.size).toBe(aliases.length);
  });
});

describe("getStarNaming", () => {
  it("looks up by iztro key", () => {
    const n = getStarNaming("emperor");
    expect(n?.pinyin).toBe("Zi Wei");
    expect(n?.alias).toBe("Emperor Star");
  });

  it("looks up case-insensitively", () => {
    expect(getStarNaming("Emperor")?.pinyin).toBe("Zi Wei");
    expect(getStarNaming("EMPEROR")?.pinyin).toBe("Zi Wei");
    expect(getStarNaming("Wolf")?.alias).toBe("Desire Star");
  });

  it("looks up by archetype label (reverse mapping)", () => {
    expect(getStarNaming("Architect")?.pinyin).toBe("Zi Wei");
    expect(getStarNaming("Catalyst")?.alias).toBe("Desire Star");
    expect(getStarNaming("Synthesizer")?.pinyin).toBe("Tian Ji");
  });

  it("handles archetype labels case-insensitively", () => {
    expect(getStarNaming("architect")?.pinyin).toBe("Zi Wei");
    expect(getStarNaming("ARCHITECT")?.alias).toBe("Emperor Star");
    expect(getStarNaming("catalyst")?.keywords).toContain("charisma");
  });

  it("returns null for unknown names", () => {
    expect(getStarNaming("nonexistent")).toBeNull();
    expect(getStarNaming("")).toBeNull();
    expect(getStarNaming("Mars Star")).toBeNull(); // Not a valid key or archetype
  });
});

describe("getStarPinyin", () => {
  it("returns pinyin for known stars", () => {
    expect(getStarPinyin("emperor")).toBe("Zi Wei");
    expect(getStarPinyin("wolf")).toBe("Tan Lang");
  });

  it("returns pinyin via archetype label", () => {
    expect(getStarPinyin("Architect")).toBe("Zi Wei");
    expect(getStarPinyin("Reconstructor")).toBe("Po Jun");
  });

  it("falls back to original name", () => {
    expect(getStarPinyin("unknown")).toBe("unknown");
  });
});

describe("getStarAlias", () => {
  it("returns alias for known stars", () => {
    expect(getStarAlias("judge")).toBe("Gate Star");
    expect(getStarAlias("general")).toBe("Marshal Star");
  });

  it("returns alias via archetype label", () => {
    expect(getStarAlias("Interrogator")).toBe("Gate Star");
    expect(getStarAlias("Executor")).toBe("Marshal Star");
  });

  it("returns empty string for unknown", () => {
    expect(getStarAlias("unknown")).toBe("");
  });
});

describe("getStarKeywords", () => {
  it("returns keywords array for known stars", () => {
    const kw = getStarKeywords("emperor");
    expect(kw).toContain("leadership");
    expect(kw).toContain("authority");
    expect(kw.length).toBeGreaterThanOrEqual(3);
  });

  it("returns empty array for unknown", () => {
    expect(getStarKeywords("unknown")).toEqual([]);
  });
});

describe("formatStarName", () => {
  it("formats as 'Pinyin · Alias'", () => {
    expect(formatStarName("emperor")).toBe("Zi Wei · Emperor Star");
    expect(formatStarName("wolf")).toBe("Tan Lang · Desire Star");
  });

  it("works via archetype label", () => {
    expect(formatStarName("Architect")).toBe("Zi Wei · Emperor Star");
    expect(formatStarName("Catalyst")).toBe("Tan Lang · Desire Star");
  });

  it("falls back to raw name for unknown stars", () => {
    expect(formatStarName("unknown_star")).toBe("unknown_star");
  });
});

describe("starDisplayParts", () => {
  it("returns pinyin and alias for known stars", () => {
    const parts = starDisplayParts("emperor");
    expect(parts.pinyin).toBe("Zi Wei");
    expect(parts.alias).toBe("Emperor Star");
  });

  it("returns empty alias for unknown stars", () => {
    const parts = starDisplayParts("unknown");
    expect(parts.pinyin).toBe("unknown");
    expect(parts.alias).toBe("");
  });
});

describe("searchStars", () => {
  it("finds stars by pinyin substring", () => {
    const results = searchStars("Zi Wei");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].pinyin).toBe("Zi Wei");
  });

  it("finds stars by alias substring", () => {
    const results = searchStars("Desire");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].alias).toBe("Desire Star");
  });

  it("finds stars by keyword", () => {
    const results = searchStars("leadership");
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("is case-insensitive", () => {
    const results = searchStars("EMPEROR");
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty array for empty query", () => {
    expect(searchStars("")).toEqual([]);
    expect(searchStars("  ")).toEqual([]);
  });
});

describe("getStarClass", () => {
  it("classifies major stars", () => {
    expect(getStarClass("emperor")).toBe("major");
    expect(getStarClass("wolf")).toBe("major");
    expect(getStarClass("rebel")).toBe("major");
  });

  it("classifies auspicious stars", () => {
    expect(getStarClass("wenchang")).toBe("auspicious");
    expect(getStarClass("zuofu")).toBe("auspicious");
  });

  it("classifies inauspicious stars", () => {
    expect(getStarClass("mars")).toBe("inauspicious");
    expect(getStarClass("dijie")).toBe("inauspicious");
  });

  it("classifies transformation stars", () => {
    expect(getStarClass("hualu")).toBe("transformation");
    expect(getStarClass("huaji")).toBe("transformation");
  });

  it("classifies everything else as minor", () => {
    expect(getStarClass("muyu")).toBe("minor");
    expect(getStarClass("unknown_star")).toBe("minor");
  });
});
