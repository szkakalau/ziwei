import type { Metadata } from "next";
import Link from "next/link";
import {
  BLOG_CATEGORIES,
  getAllPosts,
  type BlogCategory,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides on Chinese zodiac, five elements, compatibility, and how AI reads classical astrology.",
};

type Props = {
  searchParams: { category?: string | string[] };
};

function isCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value);
}

export default function BlogPage({ searchParams }: Props) {
  const raw = searchParams.category;
  const categoryParam = Array.isArray(raw) ? raw[0] : raw;
  const activeCategory =
    categoryParam && isCategory(categoryParam) ? categoryParam : null;

  const posts = getAllPosts().filter((p) =>
    activeCategory ? p.category === activeCategory : true,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Blog
        </h1>
        <p className="mt-4 max-w-2xl font-body text-lg text-ink-muted">
          SEO + GEO-friendly guides on Chinese astrology themes—definitions,
          FAQs, and structured lists for readers and AI systems.
        </p>
      </header>

      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`rounded-sm px-4 py-1.5 font-mono text-sm font-medium uppercase tracking-wide ${
            !activeCategory
              ? "border border-gold/40 bg-cinnabar/20 text-gold"
              : "border border-white/10 bg-void/50 text-ink-muted hover:border-gold/25 hover:text-ink"
          }`}
        >
          All
        </Link>
        {BLOG_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/blog?category=${encodeURIComponent(c)}`}
            className={`rounded-sm px-4 py-1.5 font-mono text-sm font-medium ${
              activeCategory === c
                ? "border border-gold/40 bg-cinnabar/20 text-gold"
                : "border border-white/10 bg-void/50 text-ink-muted hover:border-gold/25 hover:text-ink"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <ul className="mt-12 space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="rounded-sm border border-white/10 bg-panel p-6 shadow-panel backdrop-blur-sm transition hover:border-gold/30">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-jade">
                {post.category}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">
                <Link href={`/blog/${post.slug}`} className="hover:text-gold">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 font-body text-sm text-ink-muted">
                {post.description}
              </p>
              <time
                className="mt-3 block font-mono text-xs text-ink-dim"
                dateTime={post.date}
              >
                {post.date}
              </time>
            </article>
          </li>
        ))}
      </ul>

      {posts.length === 0 && (
        <p className="mt-12 font-body text-ink-dim">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
