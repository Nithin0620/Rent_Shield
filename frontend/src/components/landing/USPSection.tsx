import Reveal from "./Reveal";

const bullets = [
  "Money-first protection via escrow",
  "Proof-driven rentals",
  "Rule-based fairness",
  "AI-assisted resolution in minutes",
  "Works even without AI",
  "Nationwide rental standard"
];

const USPSection = () => {
  return (
    <section id="usp" className="px-6 py-20">
      <div className="mx-auto w-full max-w-5xl text-center">
        <Reveal>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">Why RentShield is different</p>
            <h2 className="text-3xl font-semibold text-white">Built for fairness, not friction.</h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {bullets.map((item, index) => (
            <Reveal key={item} delay={index * 0.04}>
              <div className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow">
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPSection;
