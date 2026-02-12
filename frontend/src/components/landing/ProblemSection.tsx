import { ArrowDownRight, WalletCards } from "lucide-react";
import Reveal from "./Reveal";

const ProblemSection = () => {
  return (
    <section id="problem" className="px-6 py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2">
        <Reveal>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">The Problem</p>
            <h2 className="text-3xl font-semibold text-white">Security Deposit Abuse is Normalized.</h2>
            <p className="text-slate-300">
              Landlords delay or deduct unfairly, tenants lose ₹20,000–₹2,00,000 per move, and legal
              options are slow, intimidating, and impractical.
            </p>
            <div className="glass rounded-2xl p-5">
              <p className="text-sm text-slate-300">Average deposit loss</p>
              <p className="text-2xl font-semibold text-white">₹58,000 per household</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <WalletCards size={18} className="text-neon-500" />
                Tenant payout
              </div>
              <span className="text-xs text-neon-500">-42%</span>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-white/10">
              <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-neon-500 to-emerald-400" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              {[
                "Unilateral deductions",
                "Zero transparency",
                "No evidence trail"
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <ArrowDownRight size={16} className="text-neon-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ProblemSection;
