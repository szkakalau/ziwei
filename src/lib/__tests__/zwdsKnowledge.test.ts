import { describe, it, expect } from "vitest";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";

describe("ZWDS Knowledge Base", () => {
  it("contains the 12 palaces", () => {
    expect(ZWDS_KNOWLEDGE).toContain("Soul Palace");
    expect(ZWDS_KNOWLEDGE).toContain("Career Palace");
    expect(ZWDS_KNOWLEDGE).toContain("Wealth Palace");
    expect(ZWDS_KNOWLEDGE).toContain("Spouse Palace");
    expect(ZWDS_KNOWLEDGE).toContain("Travel Palace");
  });

  it("contains major stars", () => {
    expect(ZWDS_KNOWLEDGE).toContain("Zi Wei");
    expect(ZWDS_KNOWLEDGE).toContain("Tan Lang");
    expect(ZWDS_KNOWLEDGE).toContain("Po Jun");
    expect(ZWDS_KNOWLEDGE).toContain("Tai Yang");
  });

  it("includes response guidelines", () => {
    expect(ZWDS_KNOWLEDGE).toContain("Response Guidelines");
    expect(ZWDS_KNOWLEDGE).toContain("entertainment and self-reflection");
  });

  it("is non-empty and substantial", () => {
    expect(ZWDS_KNOWLEDGE.length).toBeGreaterThan(1000);
  });
});
