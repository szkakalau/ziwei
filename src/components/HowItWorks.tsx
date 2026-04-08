export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-12 text-center text-3xl font-bold">
        How your reading is created
      </h2>

      <div className="grid gap-10 text-center md:grid-cols-3">
        <div>
          <h3 className="mb-2 font-semibold">1. Enter birth details</h3>
          <p className="text-gray-600">Takes less than 60 seconds.</p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">2. AI maps your chart</h3>
          <p className="text-gray-600">
            Uses classical Purple Star (Zi Wei) placement rules.
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">3. Get your report</h3>
          <p className="text-gray-600">
            See an instant preview; upgrade for the full report.
          </p>
        </div>
      </div>
    </section>
  );
}
