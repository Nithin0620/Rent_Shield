import Reveal from "./Reveal";

const steps = [
  {
    title: "Before Move-In",
    desc: ["Deposit goes to escrow", "Agreement auto-generated", "Move-in proof uploaded"]
  },
  {
    title: "During Stay",
    desc: ["Deposit remains neutral", "Evidence stored immutably", "Escrow rules locked"]
  },
  {
    title: "At Exit",
    desc: ["Exit request", "AI compares move-in vs move-out", "Funds released fairly"]
  }
];

const TimelineSection = () => {
  return (
    <section id="timeline" className="px-6 py-20">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <Reveal>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">How RentShield works</p>
            <h2 className="text-3xl font-semibold text-white">A transparent escrow timeline.</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.05}>
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-500/10 text-neon-500">
                    0{index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {step.desc.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
