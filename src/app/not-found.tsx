import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold text-violet-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900">Page not found</h1>
      <p className="mt-4 text-zinc-600">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
      >
        Back to home
      </Link>
    </div>
  );
}
