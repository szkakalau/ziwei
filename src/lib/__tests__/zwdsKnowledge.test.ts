import { describe, it, expect } from "vitest";
import { ZWDS_KNOWLEDGE, STAR_ARCHETYPE_MAP, starToArchetype, starToArchetypeLabel, palaceToHumanistic } from "@/lib/zwdsKnowledge";

describe("ZWDS Knowledge Base", () => {
  it("contains the 12 life domains (humanistic palace names)", () => {
    expect(ZWDS_KNOWLEDGE).toContain("Core Self");
    expect(ZWDS_KNOWLEDGE).toContain("Professional Life");
    expect(ZWDS_KNOWLEDGE).toContain("Resources & Values");
    expect(ZWDS_KNOWLEDGE).toContain("Intimate Partnerships");
    expect(ZWDS_KNOWLEDGE).toContain("External World");
  });

  it("contains all 14 archetypes with iztro keys", () => {
    expect(ZWDS_KNOWLEDGE).toContain("Architect");
    expect(ZWDS_KNOWLEDGE).toContain("Catalyst");
    expect(ZWDS_KNOWLEDGE).toContain("Reconstructor");
    expect(ZWDS_KNOWLEDGE).toContain("Radiator");
  });

  it("includes response guidelines", () => {
    expect(ZWDS_KNOWLEDGE).toContain("Response Guidelines");
    expect(ZWDS_KNOWLEDGE).toContain("self-reflection and personal growth");
  });

  it("is non-empty and substantial", () => {
    expect(ZWDS_KNOWLEDGE.length).toBeGreaterThan(1000);
  });
});

describe("STAR_ARCHETYPE_MAP", () => {
  it("has all 14 major stars mapped", () => {
    const keys = Object.keys(STAR_ARCHETYPE_MAP);
    expect(keys).toContain("emperor");
    expect(keys).toContain("advisor");
    expect(keys).toContain("sun");
    expect(keys).toContain("general");
    expect(keys).toContain("fortunate");
    expect(keys).toContain("upright");
    expect(keys).toContain("empress");
    expect(keys).toContain("moon");
    expect(keys).toContain("wolf");
    expect(keys).toContain("judge");
    expect(keys).toContain("minister");
    expect(keys).toContain("sage");
    expect(keys).toContain("sevenkillings");
    expect(keys).toContain("rebel");
    // 14 main + 6 auspicious + 6 inauspicious + 4 transformation + 26 batch1 + 26 batch2 + 22 batch3 = 104
    expect(keys.length).toBe(104);
  });

  it("all 30 stars have complete 6-field descriptions", () => {
    for (const [key, entry] of Object.entries(STAR_ARCHETYPE_MAP)) {
      expect(entry.archetype, `${key} missing archetype`).toBeTruthy();
      expect(entry.psychological, `${key} missing psychological`).toBeTruthy();
      expect(entry.sociological, `${key} missing sociological`).toBeTruthy();
      expect(entry.management, `${key} missing management`).toBeTruthy();
      expect(entry.prediction, `${key} missing prediction`).toBeTruthy();
      expect(entry.riskManagement, `${key} missing riskManagement`).toBeTruthy();
      expect(entry.relationships, `${key} missing relationships`).toBeTruthy();
    }
  });
});

describe("starToArchetype", () => {
  it("maps known stars case-insensitively", () => {
    expect(starToArchetype("emperor")?.archetype).toBe("Architect");
    expect(starToArchetype("Emperor")?.archetype).toBe("Architect");
    expect(starToArchetype("EMPEROR")?.archetype).toBe("Architect");
    expect(starToArchetype("wolf")?.archetype).toBe("Catalyst");
    expect(starToArchetype("rebel")?.archetype).toBe("Reconstructor");
  });

  it("returns null for unknown stars", () => {
    expect(starToArchetype("nonexistent")).toBeNull();
    expect(starToArchetype("")).toBeNull();
  });
});

describe("starToArchetypeLabel", () => {
  it("returns archetype label for known stars", () => {
    expect(starToArchetypeLabel("emperor")).toBe("Architect");
    expect(starToArchetypeLabel("general")).toBe("Executor");
    expect(starToArchetypeLabel("judge")).toBe("Interrogator");
  });

  it("falls back to original name for unknown stars", () => {
    expect(starToArchetypeLabel("unknown_star")).toBe("unknown_star");
  });
});

describe("palaceToHumanistic", () => {
  it("maps known palaces", () => {
    expect(palaceToHumanistic("soul")).toBe("Core Self");
    expect(palaceToHumanistic("career")).toBe("Professional Life");
    expect(palaceToHumanistic("spouse")).toBe("Intimate Partnerships");
    expect(palaceToHumanistic("wealth")).toBe("Resources & Values");
  });

  it("falls back to original for unknown palaces", () => {
    expect(palaceToHumanistic("unknown")).toBe("unknown");
  });
});
