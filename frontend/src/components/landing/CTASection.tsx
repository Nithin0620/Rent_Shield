import Reveal from "./Reveal";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="px-6 py-20">
      <Reveal>
        <div className="mx-auto w-full max-w-5xl rounded-3xl bg-gradient-to-br from-neon-500/20 via-sky-500/10 to-transparent p-10 text-center glass">
          <h2 className="text-3xl font-semibold text-white">Make Rentals Fair. Make Deposits Safe.</h2>
          <p className="mt-3 text-slate-300">
            Start protecting deposits with evidence-backed escrow and AI-assisted resolution.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/register"
              className="rounded-full bg-neon-500 px-6 py-3 text-sm font-semibold text-midnight-900 glow hover:bg-neon-600 transition"
            >
              Start Using RentShield
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default CTASection;
