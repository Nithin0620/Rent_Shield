import Reveal from "./Reveal";

const RevenueSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <Reveal>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">Revenue model</p>
            <h2 className="text-3xl font-semibold text-white">Aligned with trust incentives.</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {["1–2% escrow fee", "Premium dispute resolution", "B2B partnerships", "Landlord trust badge"].map(
            (item, index) => (
              <Reveal key={item} delay={index * 0.05}>
                <div className="glass rounded-2xl p-6 text-sm text-slate-200">{item}</div>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default RevenueSection;
