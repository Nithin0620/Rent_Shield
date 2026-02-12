import {
  ShieldCheck,
  FileLock,
  Wand2,
  Database,
  Sparkles,
  ClipboardList
} from "lucide-react";
import Reveal from "./Reveal";

const features = [
  {
    title: "Escrow-Based Deposit Lock",
    icon: ShieldCheck,
    points: ["Funds held neutrally", "Rules enforce release", "No unilateral deductions"]
  },
  {
    title: "Auto-Generated Smart Agreement",
    icon: Wand2,
    points: ["Standard clauses", "Digitally signed", "Audit-ready"]
  },
  {
    title: "Immutable Proof Vault",
    icon: FileLock,
    points: ["Hash-verified", "Move-in/out evidence", "Tamper detection"]
  },
  {
    title: "AI Dispute Resolution Engine",
    icon: Sparkles,
    points: ["Evidence comparison", "Severity analysis", "Payout guidance"]
  },
  {
    title: "Sustainability Trust Score",
    icon: Database,
    points: ["Landlord credibility", "Tenant responsibility", "Market signals"]
  },
  {
    title: "Exit Checklist System",
    icon: ClipboardList,
    points: ["Structured move-out", "Instant gaps detection", "Zero blind spots"]
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="px-6 py-20">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <Reveal>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">Core features</p>
            <h2 className="text-3xl font-semibold text-white">Six pillars of trust.</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.05}>
                <div className="glass rounded-2xl p-6 transition hover:-translate-y-2 hover:shadow-glow">
                  <Icon size={26} className="text-neon-500" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {feature.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
