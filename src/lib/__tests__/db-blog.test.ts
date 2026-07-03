import { describe, it, expect, vi } from "vitest";

// ═══════════════════════════════════════════════════════════════════════
// Shared neon mock — simulates blog_posts table
// ═══════════════════════════════════════════════════════════════════════

const blogRows: Record<string, unknown>[] = [
  {
    id: "b1", slug: "dragon-2026", title: "Dragon Horoscope 2026",
    description: "Year of the Dragon forecast", content: "Full article content here…",
    category: "Chinese Zodiac", topic_key: "dragon-2026", seo_keywords: ["dragon", "2026"],
    date: new Date("2026-06-15"), created_at: new Date("2026-06-15T08:00:00Z"),
  },
  {
    id: "b2", slug: "tiger-love", title: "Tiger Love Compatibility",
    description: "Tiger relationship guide", content: "Relationship analysis here…",
    category: "Relationship astrology", topic_key: "tiger-love", seo_keywords: ["tiger", "love"],
    date: new Date("2026-06-10"), created_at: new Date("2026-06-10T08:00:00Z"),
  },
];

function mockNeonQuery(strings: TemplateStringsArray, ...values: unknown[]): unknown[] {
  const q = strings.join("?");

  // INSERT — must check first (specific)
  if (q.includes("INSERT INTO blog_posts")) {
    const slug = values[0] as string;
    // Simulate ON CONFLICT DO NOTHING
    if (blogRows.some((r) => r.slug === slug)) return [];
    const newRow = {
      id: "new-blog", slug, title: values[1], description: values[2],
      content: values[3], category: values[4], topic_key: values[5],
      seo_keywords: values[6], date: new Date((values[7] as string)),
      created_at: new Date(),
    };
    return [newRow];
  }

  // SELECT EXISTS — used by isTopicKeyUsed
  if (q.includes("EXISTS")) {
    const key = values[0] as string;
    return [{ used: blogRows.some((r) => r.topic_key === key) }];
  }

  // Slug lookup — getGeneratedPostBySlug
  if (q.includes("blog_posts") && q.includes("WHERE slug")) {
    const slug = values[0] as string;
    return blogRows.filter((r) => r.slug === slug);
  }

  // Date lookup — getGeneratedPostByDate (must check before general listing)
  if (q.includes("blog_posts") && q.includes("WHERE date")) {
    // values[0] is the date string like "2026-06-15" (with ::date cast)
    const dateStr = String(values[0]).trim();
    return blogRows.filter((r) => {
      const d = r.date as Date;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` === dateStr;
    });
  }

  // General listing queries — getAllGeneratedPosts, getAllGeneratedPostMetas
  if (q.includes("FROM blog_posts")) {
    const sorted = [...blogRows].sort((a, b) => {
      const da = a.date as Date, db = b.date as Date;
      const d = db.getTime() - da.getTime();
      if (d !== 0) return d;
      return ((b.created_at as Date).getTime() - (a.created_at as Date).getTime());
    });
    // Extract LIMIT and OFFSET from values (they are the last 1-2 values)
    // The SQL has: LIMIT ${limit} OFFSET ${offset}
    const limit = typeof values[values.length - 2] === "number" ? values[values.length - 2] as number : undefined;
    const offset = typeof values[values.length - 1] === "number" ? values[values.length - 1] as number : 0;
    if (limit !== undefined) {
      return sorted.slice(offset, offset + limit);
    }
    return sorted;
  }

  return [];
}

vi.mock("@neondatabase/serverless", () => ({
  neon: () => mockNeonQuery,
}));

// ═══════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════

describe("insertBlogPost", () => {
  it("returns BlogPostRow on successful insert", async () => {
    const { insertBlogPost } = await import("@/lib/db");
    const post = await insertBlogPost({
      slug: "new-post", title: "New Title", description: "Desc",
      content: "Content here", category: "Five Elements", topicKey: "new-key",
      seoKeywords: ["tag"], date: "2026-07-01",
    });
    expect(post).toBeTruthy();
    expect(post?.slug).toBe("new-post");
    expect(post?.title).toBe("New Title");
    expect(post?.seo_keywords).toEqual(["tag"]);
  });

  it("returns null on slug conflict (ON CONFLICT DO NOTHING)", async () => {
    const { insertBlogPost } = await import("@/lib/db");
    // dragon-2026 already exists in blogRows
    const post = await insertBlogPost({
      slug: "dragon-2026", title: "Duplicate", description: "D",
      content: "C", category: "Five Elements", topicKey: "dup",
      seoKeywords: [], date: "2026-07-01",
    });
    expect(post).toBeNull();
  });

  it("throws when slug is empty", async () => {
    const { insertBlogPost } = await import("@/lib/db");
    await expect(insertBlogPost({
      slug: "", title: "T", description: "D", content: "C",
      category: "Five Elements", topicKey: "k", seoKeywords: [], date: "2026-01-01",
    })).rejects.toThrow("slug is required");
  });

  it("throws when title is empty", async () => {
    const { insertBlogPost } = await import("@/lib/db");
    await expect(insertBlogPost({
      slug: "slug", title: "", description: "D", content: "C",
      category: "Five Elements", topicKey: "k", seoKeywords: [], date: "2026-01-01",
    })).rejects.toThrow("title is required");
  });

  it("throws when content is empty", async () => {
    const { insertBlogPost } = await import("@/lib/db");
    await expect(insertBlogPost({
      slug: "slug", title: "T", description: "D", content: "",
      category: "Five Elements", topicKey: "k", seoKeywords: [], date: "2026-01-01",
    })).rejects.toThrow("content is required");
  });

  it("throws when date is empty", async () => {
    const { insertBlogPost } = await import("@/lib/db");
    await expect(insertBlogPost({
      slug: "slug", title: "T", description: "D", content: "C",
      category: "Five Elements", topicKey: "k", seoKeywords: [], date: "",
    })).rejects.toThrow("date is required");
  });
});

describe("getAllGeneratedPosts", () => {
  it("returns posts sorted by date descending", async () => {
    const { getAllGeneratedPosts } = await import("@/lib/db");
    const posts = await getAllGeneratedPosts();
    expect(posts.length).toBeGreaterThanOrEqual(2);
    // First post should be newest (2026-06-15 Dragon)
    expect(posts[0].slug).toBe("dragon-2026");
  });

  it("respects limit parameter", async () => {
    const { getAllGeneratedPosts } = await import("@/lib/db");
    const posts = await getAllGeneratedPosts(1);
    expect(posts.length).toBe(1);
  });
});

describe("getAllGeneratedPostMetas", () => {
  it("returns posts without content column", async () => {
    const { getAllGeneratedPostMetas } = await import("@/lib/db");
    const metas = await getAllGeneratedPostMetas();
    expect(metas.length).toBeGreaterThanOrEqual(2);
    // content should not be present in meta rows
    expect((metas[0] as { content?: unknown }).content).toBeUndefined();
    expect(typeof metas[0].title).toBe("string");
  });
});

describe("getGeneratedPostBySlug", () => {
  it("returns post when slug exists", async () => {
    const { getGeneratedPostBySlug } = await import("@/lib/db");
    const post = await getGeneratedPostBySlug("dragon-2026");
    expect(post).toBeTruthy();
    expect(post?.title).toBe("Dragon Horoscope 2026");
    expect(post?.content).toBe("Full article content here…");
  });

  it("returns null when slug does not exist", async () => {
    const { getGeneratedPostBySlug } = await import("@/lib/db");
    const post = await getGeneratedPostBySlug("no-such-post");
    expect(post).toBeNull();
  });
});

describe("isTopicKeyUsed", () => {
  it("returns true for existing topic key", async () => {
    const { isTopicKeyUsed } = await import("@/lib/db");
    expect(await isTopicKeyUsed("dragon-2026")).toBe(true);
  });

  it("returns false for unknown topic key", async () => {
    const { isTopicKeyUsed } = await import("@/lib/db");
    expect(await isTopicKeyUsed("never-used-key")).toBe(false);
  });
});

describe("getGeneratedPostByDate", () => {
  it("returns post for matching date", async () => {
    const { getGeneratedPostByDate } = await import("@/lib/db");
    const post = await getGeneratedPostByDate("2026-06-15");
    expect(post?.slug).toBe("dragon-2026");
  });

  it("returns null for unmatched date", async () => {
    const { getGeneratedPostByDate } = await import("@/lib/db");
    const none = await getGeneratedPostByDate("2099-01-01");
    expect(none).toBeNull();
  });
});
