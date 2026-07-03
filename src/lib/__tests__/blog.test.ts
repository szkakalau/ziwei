import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════
// Fixture: temporary MDX files for testing
// ═══════════════════════════════════════════════════════════════════════

const postsDir = path.join(process.cwd(), "content/blog");

// Restore originals after all tests
let originalExistsSync: typeof fs.existsSync;
let originalReaddirSync: typeof fs.readdirSync;
let originalReadFileSync: typeof fs.readFileSync;

beforeEach(() => {
  originalExistsSync = fs.existsSync;
  originalReaddirSync = fs.readdirSync;
  originalReadFileSync = fs.readFileSync;
});

afterEach(() => {
  fs.existsSync = originalExistsSync;
  fs.readdirSync = originalReaddirSync;
  fs.readFileSync = originalReadFileSync;
});

function mockDir(...slugs: string[]) {
  // Mock the directory check to pass
  vi.spyOn(fs, "existsSync").mockImplementation((p: fs.PathLike) => {
    const sp = String(p);
    if (sp === postsDir || sp.endsWith(path.join("content", "blog"))) return true;
    if (slugs.some((s) => sp.endsWith(`${s}.mdx`))) return true;
    return false;
  });

  vi.spyOn(fs, "readdirSync").mockReturnValue(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slugs.map((s) => `${s}.mdx`) as any,
  );
}

function mockFile(content: string) {
  vi.spyOn(fs, "readFileSync").mockReturnValue(content);
}

// ═══════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════

describe("getPostSlugs", () => {
  it("returns slug list from content/blog directory", async () => {
    vi.resetModules();
    mockDir("dragon-2026", "tiger-love");

    const { getPostSlugs } = await import("@/lib/blog");
    const slugs = getPostSlugs();
    expect(slugs).toContain("dragon-2026");
    expect(slugs).toContain("tiger-love");
    expect(slugs.length).toBe(2);
  });

  it("returns empty array when directory does not exist", async () => {
    vi.resetModules();
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    const { getPostSlugs } = await import("@/lib/blog");
    const slugs = getPostSlugs();
    expect(slugs).toEqual([]);
  });
});

describe("getPostBySlug", () => {
  it("returns meta and content for existing post", async () => {
    vi.resetModules();
    mockDir("dragon-2026");
    mockFile(`---
title: Dragon Horoscope 2026
description: Year of the Dragon forecast
date: "2026-06-15"
category: Chinese Zodiac
---
Full article content here.`);

    const { getPostBySlug } = await import("@/lib/blog");
    const post = getPostBySlug("dragon-2026");
    expect(post).toBeTruthy();
    expect(post?.meta.title).toBe("Dragon Horoscope 2026");
    expect(post?.meta.slug).toBe("dragon-2026");
    expect(post?.meta.date).toBe("2026-06-15");
    expect(post?.meta.category).toBe("Chinese Zodiac");
    expect(post?.content).toContain("Full article content here.");
  });

  it("returns null for non-existent slug", async () => {
    vi.resetModules();
    vi.spyOn(fs, "existsSync").mockImplementation((p: fs.PathLike) => {
      return String(p) === postsDir || String(p).endsWith(path.join("content", "blog"));
    });
    vi.spyOn(fs, "readdirSync").mockReturnValue([]);

    const { getPostBySlug } = await import("@/lib/blog");
    const post = getPostBySlug("no-such-post");
    expect(post).toBeNull();
  });

  it("provides default values for missing frontmatter fields", async () => {
    vi.resetModules();
    mockDir("minimal");
    mockFile(`---
title: ""
---
Minimal content with no metadata.`);

    const { getPostBySlug } = await import("@/lib/blog");
    const post = getPostBySlug("minimal");
    expect(post?.meta.description).toBe("");
    expect(post?.meta.date).toBe("");
  });
});

describe("getAllPosts", () => {
  it("returns posts sorted by date descending", async () => {
    vi.resetModules();
    mockDir("dragon-2026", "tiger-love");

    // Mock file reads to return different dates
    const files: Record<string, string> = {
      "dragon-2026.mdx": `---
title: Dragon
description: D
date: "2026-06-15"
category: Chinese Zodiac
---
Content`,
      "tiger-love.mdx": `---
title: Tiger
description: T
date: "2026-06-10"
category: Relationship astrology
---
Content`,
    };

    vi.spyOn(fs, "readFileSync").mockImplementation((p: fs.PathOrFileDescriptor) => {
      const sp = String(p);
      for (const [key, content] of Object.entries(files)) {
        if (sp.endsWith(key)) return content;
      }
      return "";
    });

    const { getAllPosts } = await import("@/lib/blog");
    const posts = getAllPosts();
    // Dragon (2026-06-15) should come before Tiger (2026-06-10)
    expect(posts[0].slug).toBe("dragon-2026");
    expect(posts[1].slug).toBe("tiger-love");
    expect(posts[0].date).toBe("2026-06-15");
    expect(posts[1].date).toBe("2026-06-10");
  });
});

describe("parseFrontmatter", () => {
  it("handles missing fields with defaults", async () => {
    vi.resetModules();
    mockDir("bare");
    mockFile(`---
title: ""
---
Just content, no frontmatter.`);

    const { getPostBySlug } = await import("@/lib/blog");
    const post = getPostBySlug("bare");
    expect(post?.meta.title).toBe("");
    expect(post?.meta.description).toBe("");
    expect(post?.meta.date).toBe("");
  });
});
