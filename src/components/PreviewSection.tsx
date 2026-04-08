export default function PreviewSection() {
  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Your free preview includes
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded bg-white p-6 shadow">
            <h4 className="mb-2 font-semibold">Personality Snapshot</h4>
            <p className="text-sm text-gray-600">
              You are naturally analytical and observant. You prefer depth over
              surface-level connections and feel energized when pursuing
              meaningful goals.
            </p>
          </div>

          <div className="rounded bg-white p-6 shadow">
            <h4 className="mb-2 font-semibold">Love Style Insight</h4>
            <p className="text-sm text-gray-600">
              You value loyalty and emotional safety. You open up slowly but
              form deep long-term bonds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
