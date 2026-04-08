import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-mono text-sm font-semibold uppercase tracking-widest text-cinnabar">
        404
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
        Page not found
      </h1>
      <p className="mt-4 font-body text-ink-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-sm border border-gold/35 bg-gradient-to-br from-cinnabar to-cinnabar-deep px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition hover:brightness-110"
      >
        Back to home
      </Link>
    </div>
  );
}
