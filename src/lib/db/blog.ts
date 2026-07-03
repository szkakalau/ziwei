import { sql } from "./client";

// ---------------------------------------------------------------------------
// Blog post CRUD (auto-generated daily posts)
// ---------------------------------------------------------------------------

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  topic_key: string | null;
  seo_keywords: string[];
  date: string;
  created_at: string;
};

/** BlogPostRow without the heavy `content` column — for list views. */
export type BlogPostMeta = Omit<BlogPostRow, "content">;

// The Neon driver parses DATE (oid 1082) into JS Date objects, not strings.
// Normalize to YYYY-MM-DD using local date components — toISOString().slice(0,10)
// would shift UTC+8 local-midnight back one day. Same pattern as updateStreak().
function normBlogDate(v: unknown): string {
  if (v instanceof Date) {
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
  }
  return String(v ?? "");
}

// TIMESTAMPTZ is an absolute point in time — toISOString() preserves UTC.
function normBlogTs(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? "");
}

function normalizeBlogPostRow(row: Record<string, unknown>): BlogPostRow {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    content: String(row.content ?? ""),
    category: String(row.category ?? ""),
    topic_key: row.topic_key != null ? String(row.topic_key) : null,
    seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords.map(String) : [],
    date: normBlogDate(row.date),
    created_at: normBlogTs(row.created_at),
  };
}

/** Insert a generated blog post. Returns null on slug conflict (idempotent). */
export async function insertBlogPost(params: {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  topicKey: string;
  seoKeywords: string[];
  date: string;
}): Promise<BlogPostRow | null> {
  if (!params.slug?.trim()) throw new Error("slug is required");
  if (!params.title?.trim()) throw new Error("title is required");
  if (!params.content?.trim()) throw new Error("content is required");
  if (!params.date) throw new Error("date is required");

  const rows = await sql`
    INSERT INTO blog_posts (slug, title, description, content, category, topic_key, seo_keywords, date)
    VALUES (
      ${params.slug},
      ${params.title},
      ${params.description},
      ${params.content},
      ${params.category},
      ${params.topicKey},
      ${params.seoKeywords},
      ${params.date}::date
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING *
  `;
  return rows[0] ? normalizeBlogPostRow(rows[0]) : null;
}

/** Get all generated blog posts, newest first.
 *  Includes the full `content` column — prefer getAllGeneratedPostMetas() for list views. */
export async function getAllGeneratedPosts(
  limit = 50,
  offset = 0,
): Promise<BlogPostRow[]> {
  const rows = await sql`
    SELECT id, slug, title, description, content, category, topic_key, seo_keywords, date, created_at
    FROM blog_posts
    ORDER BY date DESC, created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows.map(normalizeBlogPostRow);
}

/** Get all generated blog post metadata (without content body), newest first.
 *  Use this for listing pages; use getAllGeneratedPosts() only when content is needed. */
export async function getAllGeneratedPostMetas(
  limit = 50,
  offset = 0,
): Promise<BlogPostMeta[]> {
  const rows = await sql`
    SELECT id, slug, title, description, category, topic_key, seo_keywords, date, created_at
    FROM blog_posts
    ORDER BY date DESC, created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  ` as Array<Record<string, unknown>>;
  // Reuse normalizeBlogPostRow so normalization logic lives in one place.
  // Strip the `content` field (not in the SELECT) to match BlogPostMeta.
  return rows.map((r) => {
    const full = normalizeBlogPostRow(r as Record<string, unknown>);
    const { content: _, ...meta } = full;
    return meta;
  });
}

/** Get a single generated post by slug. */
export async function getGeneratedPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const rows = await sql`
    SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1
  `;
  return rows[0] ? normalizeBlogPostRow(rows[0]) : null;
}

/** Check whether a topic key has already been used (for duplicate prevention).
 *  Uses SELECT EXISTS for O(1) index lookup — stops at first match. */
export async function isTopicKeyUsed(topicKey: string): Promise<boolean> {
  const rows = await sql`
    SELECT EXISTS (
      SELECT 1 FROM blog_posts WHERE topic_key = ${topicKey} LIMIT 1
    ) as used
  `;
  return Boolean(rows[0]?.used);
}

/** Get a generated post for a specific date (for duplicate-prevention).
 *
 *  NOTE: The caller pattern of check-then-insert (isTopicKeyUsed + insertBlogPost,
 *  or this function + insertBlogPost) is NOT atomic — a TOCTOU race is theoretically
 *  possible between two concurrent cron invocations. At single-invocation-per-day
 *  cron scale this is acceptable. If stricter once-only semantics are needed, add
 *  a UNIQUE constraint on (topic_key, date) and rely on ON CONFLICT DO NOTHING
 *  instead of pre-checking. */
export async function getGeneratedPostByDate(date: string): Promise<BlogPostRow | null> {
  const rows = await sql`
    SELECT * FROM blog_posts
    WHERE date = ${date}::date
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows[0] ? normalizeBlogPostRow(rows[0]) : null;
}
