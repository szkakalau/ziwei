# Ziwei AI — Marketing site

Next.js 14 (App Router) + Tailwind CSS + MDX blog (`content/blog`). CTA buttons use `NEXT_PUBLIC_READING_URL`.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [.env.example](.env.example). Set `NEXT_PUBLIC_SITE_URL` to your production origin (no trailing slash) before launch so metadata, `sitemap.xml`, and Open Graph URLs are correct.

## Blog (MDX)

Add files under `content/blog/*.mdx` with frontmatter:

- `title`, `description`, `date` (ISO date string), `category` (one of the values in `lib/blog.ts`).

Use clear `h2`/`h3` headings, short definitions, lists, and FAQ-style sections so posts are easy to scan.

## Deploy on Vercel

1. Create a GitHub repository and push this project.
2. In [Vercel](https://vercel.com), **Add New Project** → Import the repo.
3. Framework preset: **Next.js**. Root directory: repository root.
4. Add environment variables: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_READING_URL` (and future Stripe/MailerLite keys when integrated).
5. Deploy, then attach your custom domain under **Project → Settings → Domains**.
6. Update `NEXT_PUBLIC_SITE_URL` to the production URL and redeploy if needed.

Official docs: [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs).

## Scripts

| Command        | Action              |
| -------------- | ------------------- |
| `npm run dev`  | Dev server          |
| `npm run build`| Production build    |
| `npm run start`| Start production    |
| `npm run lint` | ESLint              |
