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
        className="text-sm font-medium text-violet-800 hover:underline"
      >
        ← Back to blog
      </Link>
      <header className="mt-8 border-b border-zinc-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          {post.meta.category}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
          {post.meta.title}
        </h1>
        <p className="mt-4 text-lg text-zinc-600">{post.meta.description}</p>
        <time
          className="mt-4 block text-sm text-zinc-400"
          dateTime={post.meta.date}
        >
          {post.meta.date}
        </time>
      </header>
      <div className="prose prose-zinc prose-lg mt-10 max-w-none prose-headings:scroll-mt-24 prose-a:text-violet-800">
        {content}
      </div>
    </div>
  );
}
