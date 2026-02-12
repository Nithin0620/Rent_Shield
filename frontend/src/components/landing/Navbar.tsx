import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#timeline" },
  { label: "Features", href: "#features" },
  { label: "Why Us", href: "#usp" },
  { label: "Audience", href: "#audience" },
  { label: "Tech", href: "#tech" }
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-midnight-900/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <a href="#hero" className="text-lg font-semibold tracking-wide text-white">
          RentShield
        </a>
        <div className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-neon-500 transition">
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-neon-500 hover:text-neon-500 transition">
            See How It Works
          </button>
          <button className="rounded-full bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 glow hover:bg-neon-600 transition">
            Protect My Deposit
          </button>
        </div>
        <button
          className="md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-white/10 px-6 pb-4 md:hidden"
        >
          <div className="flex flex-col gap-3 pt-4 text-sm text-slate-200">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
              See How It Works
            </button>
            <button className="rounded-full bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900">
              Protect My Deposit
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
