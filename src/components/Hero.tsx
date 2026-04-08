import BirthFormModal from "@/components/BirthFormModal";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 text-center">
      <h1 className="mb-6 text-5xl font-bold leading-tight">
        Purple Star Astrology,
        <br />
        Explained by AI
      </h1>

      <p className="mb-8 text-xl text-gray-600">
        Get a clear read on your personality, recurring life themes, and
        relationship style—grounded in classical Zi Wei (Purple Star) logic.
      </p>

      <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
        <span>✓ Rooted in a 1,000+ year tradition</span>
        <span>✓ Personalized with AI</span>
        <span>✓ Under a minute to start</span>
      </div>

      <BirthFormModal />

      <p className="mt-3 text-sm text-gray-400">
        Includes a free preview. No account required.
      </p>
    </section>
  );
}
