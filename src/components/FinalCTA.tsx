import BirthFormModal from "@/components/BirthFormModal";

export default function FinalCTA() {
  return (
    <section className="py-20 text-center">
      <h2 className="mb-6 text-3xl font-bold">Ready when you are</h2>

      <div className="flex justify-center">
        <BirthFormModal />
      </div>
    </section>
  );
}
