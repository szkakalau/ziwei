import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getPostSlugs, getAllPosts, type PostMeta } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const site = getSiteUrl();
  const url = new URL(`/blog/${slug}`, site);
  const ogImage = new URL("/opengraph-image", site);

  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: { canonical: url.toString() },
    openGraph: {
      type: "article",
      url,
      title: post.meta.title,
      description: post.meta.description,
      publishedTime: post.meta.date,
      images: [
        {
          url: ogImage.toString(),
          width: 1200,
          height: 630,
          alt: `${BRAND_NAME} — ${post.meta.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.description,
      images: [
        {
          url: ogImage.toString(),
          width: 1200,
          height: 630,
          alt: `${BRAND_NAME} — ${post.meta.title}`,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  const site = getSiteUrl();
  const postUrl = new URL(`/blog/${slug}`, site).toString();
  const blogUrl = new URL("/blog", site).toString();

  const articleJsonLd = {
    "@type": "Article",
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.date,
    author: { "@type": "Organization", name: BRAND_NAME },
    publisher: { "@type": "Organization", name: BRAND_NAME, url: site.toString() },
    url: postUrl,
  };

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.toString() },
      { "@type": "ListItem", position: 2, name: "Blog", item: blogUrl },
      { "@type": "ListItem", position: 3, name: post.meta.title, item: postUrl },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Link
        href="/blog"
        className="font-mono text-sm font-medium text-gold hover:underline"
      >
        ← Back to blog
      </Link>
      <header className="mt-8 border-b border-white/10 pb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-jade">
          {post.meta.category}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {post.meta.title}
        </h1>
        <p className="mt-4 font-body text-lg text-ink-muted">
          {post.meta.description}
        </p>
        <time
          className="mt-4 block font-mono text-sm text-ink-dim"
          dateTime={post.meta.date}
        >
          {post.meta.date}
        </time>
      </header>
      <div className="prose prose-base mt-10 max-w-none sm:prose-lg prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:text-ink prose-p:font-body prose-p:text-ink-muted prose-strong:text-ink prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-li:text-ink-muted prose-blockquote:border-gold/30 prose-blockquote:text-ink-muted prose-code:rounded-sm prose-code:bg-black/5 prose-code:px-1 prose-code:text-jade">
        {content}
      </div>

      {/* Related posts — internal linking boost for crawl depth */}
      <RelatedPosts currentSlug={slug} category={post.meta.category} />
    </main>
  );
}

function RelatedPosts({
  currentSlug,
  category,
}: {
  currentSlug: string;
  category: string;
}) {
  const all = getAllPosts();
  const related = all
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => {
      // Same-category posts first, then by date
      const aMatch = a.category === category ? 0 : 1;
      const bMatch = b.category === category ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return +new Date(b.date) - +new Date(a.date);
    })
    .slice(0, 3);

  if (!related.length) return null;

  return (
    <aside
      className="mt-16 border-t border-gold/[0.08] pt-10"
      aria-labelledby="related-heading"
    >
      <h2
        id="related-heading"
        className="font-display text-xl font-semibold text-ink"
      >
        Continue reading
      </h2>
      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {related.map((p: PostMeta) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block rounded-lg border border-gold/[0.06] bg-void/40 p-4 transition-all hover:border-gold/15 hover:bg-void/60"
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-jade">
                {p.category}
              </span>
              <h3 className="mt-1 font-body text-sm font-semibold text-ink group-hover:text-gold transition-colors line-clamp-2">
                {p.title}
              </h3>
              <p className="mt-1 font-body text-xs text-ink-dim line-clamp-2">
                {p.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
