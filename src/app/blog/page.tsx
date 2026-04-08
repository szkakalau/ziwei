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
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Blog
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600">
          SEO + GEO-friendly guides on Chinese astrology themes—definitions,
          FAQs, and structured lists for readers and AI systems.
        </p>
      </header>

      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !activeCategory
              ? "bg-violet-700 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          All
        </Link>
        {BLOG_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/blog?category=${encodeURIComponent(c)}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              activeCategory === c
                ? "bg-violet-700 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <ul className="mt-12 space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-violet-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                {post.category}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-violet-800"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-zinc-600">{post.description}</p>
              <time
                className="mt-3 block text-xs text-zinc-400"
                dateTime={post.date}
              >
                {post.date}
              </time>
            </article>
          </li>
        ))}
      </ul>

      {posts.length === 0 && (
        <p className="mt-12 text-zinc-500">No posts in this category yet.</p>
      )}
    </div>
  );
}
