const Footer = () => {
  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-4">
        <div>
          <h4 className="text-lg font-semibold text-white">RentShield</h4>
          <p className="mt-3 text-sm text-slate-400">
            Trust infrastructure for rentals. Evidence-first escrow protection.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">About</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>Features</li>
            <li>Privacy Policy</li>
            <li>Terms</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Team</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>Aryan Das</li>
            <li>Dimple Kanwar</li>
            <li>Jaspreet Singh</li>
            <li>KS Nitin</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Disclaimer</p>
          <p className="mt-3 text-sm text-slate-400">
            RentShield acts as an escrow intermediary. AI analysis is advisory only and does not
            provide legal authority. Final decisions may require legal escalation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
