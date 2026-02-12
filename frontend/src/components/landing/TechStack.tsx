import Reveal from "./Reveal";

const stack = ["React", "Node", "Express", "MongoDB", "OpenCV", "HuggingFace"];

const TechStack = () => {
  return (
    <section id="tech" className="px-6 py-20">
      <div className="mx-auto w-full max-w-5xl text-center space-y-8">
        <Reveal>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neon-500">Tech stack</p>
            <h2 className="text-3xl font-semibold text-white">Built with production-grade tooling.</h2>
          </div>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-3">
          {stack.map((item, index) => (
            <Reveal key={item} delay={index * 0.03}>
              <span className="glass rounded-full px-4 py-2 text-sm text-slate-200">{item}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
