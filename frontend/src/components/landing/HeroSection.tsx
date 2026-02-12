import { motion } from "framer-motion";
import { ShieldCheck, Vault, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

const HeroSection = () => {
  return (
    <section id="hero" className="relative overflow-hidden px-6 pt-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-neon-500/30 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-0 h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">RentShield Escrow</p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              End Rental Deposit Scams.
            </h1>
            <p className="text-lg text-slate-300">
              A trust layer for fair, fast, and evidence-based deposit returns.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-neon-500 px-6 py-3 text-sm font-semibold text-midnight-900 glow hover:bg-neon-600 transition">
                Protect My Deposit
              </button>
              <button className="rounded-full border border-white/20 px-6 py-3 text-sm text-white hover:border-neon-500 hover:text-neon-500 transition">
                See How It Works
              </button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-neon-500" />
                Escrow-backed protection
              </div>
              <div className="flex items-center gap-2">
                <Vault size={18} className="text-neon-500" />
                Immutable evidence vault
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-neon-500" />
                AI dispute analysis
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <motion.div
            className="glass relative rounded-3xl border border-white/10 p-6"
            whileHover={{ y: -6 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-slate-400">Escrow Vault</span>
                <span className="text-xs text-neon-500">Secured</span>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-midnight-800 to-midnight-700 p-6">
                <p className="text-sm text-slate-300">Protected Deposit Balance</p>
                <p className="text-3xl font-semibold text-white">₹1,25,000</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "Agreement verified",
                  "Move-in proof stored",
                  "AI review ready",
                  "Release rules locked"
                ].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-neon-500/30 bg-neon-500/10 p-4 text-xs text-neon-500">
                Funds never leave escrow until rules are satisfied.
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
