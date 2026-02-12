import Reveal from "./Reveal";

const TargetAudience = () => {
  return (
    <section id="audience" className="px-6 py-20">
      <div className="mx-auto w-full max-w-6xl grid gap-8 md:grid-cols-2">
        <Reveal>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white">Primary users</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• Students</li>
              <li>• IT professionals</li>
              <li>• Migrant workers</li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white">Secondary partners</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• Ethical landlords</li>
              <li>• Rental platforms</li>
              <li>• Co-living operators</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default TargetAudience;
