import { FileWarning, Gavel, Handshake, ShieldX } from "lucide-react";
import Reveal from "./Reveal";

const cards = [
  {
    title: "Legal Notice",
    desc: "Slow & expensive",
    icon: Gavel
  },
  {
    title: "Police Complaint",
    desc: "Escalatory & risky",
    icon: ShieldX
  },
  {
    title: "Verbal Agreement",
    desc: "No enforceability",
    icon: Handshake
  },
  {
    title: "Rental Apps",
    desc: "No post-exit protection",
    icon: FileWarning
  }
];

const WhyFailSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <Reveal>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">Why existing solutions fail</p>
            <h2 className="text-3xl font-semibold text-white">They protect neither money nor evidence.</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={index * 0.05}>
                <div className="glass rounded-2xl p-5 transition hover:-translate-y-2 hover:shadow-glow">
                  <Icon size={24} className="text-neon-500" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{card.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyFailSection;
