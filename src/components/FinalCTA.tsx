import BirthFormModal from "@/components/BirthFormModal";

export default function FinalCTA() {
  return (
    <section className="relative py-24 text-center">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-cinnabar/5 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade-dim blur-[80px]"
        aria-hidden
      />
      <h2 className="relative font-display text-3xl font-semibold text-ink md:text-4xl">
        Ready when you are
      </h2>

      <div className="relative mt-10 flex justify-center">
        <BirthFormModal />
      </div>
    </section>
  );
}
