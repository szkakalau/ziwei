import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const site = getSiteUrl();
  const url = new URL(`/blog/${params.slug}`, site);

  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      type: "article",
      url,
      title: post.meta.title,
      description: post.meta.description,
      publishedTime: post.meta.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
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
      <div className="prose prose-invert prose-base mt-10 max-w-none sm:prose-lg prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:text-ink prose-p:font-body prose-p:text-ink-muted prose-strong:text-ink prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-li:text-ink-muted prose-blockquote:border-gold/30 prose-blockquote:text-ink-muted prose-code:rounded-sm prose-code:bg-void/80 prose-code:px-1 prose-code:text-jade">
        {content}
      </div>
    </div>
  );
}
