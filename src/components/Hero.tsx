import { ArrowRight, ChevronRight } from "lucide-react";

const TECHS = [
  "AWS", "Azure", "GCP", "Kubernetes", "Terraform", "React", "Node.js",
  "Python", "Rust", "Go", "PostgreSQL", "Redis", "Kafka", "Docker",
  "TypeScript", "GraphQL", "Istio", "ArgoCD",
];

const STATS = [
  { value: "12 YRS", label: "EXPERIENCE",       cls: "bp-stat-1" },
  { value: "50+",    label: "SYSTEMS DEPLOYED",  cls: "bp-stat-2" },
  { value: "3",      label: "COUNTRIES",         cls: "bp-stat-3" },
  { value: "RAiD",   label: "PPCOE",             cls: "bp-stat-4" },
];

export function Hero() {
  return (
    <section id="hero" className="relative pt-32 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
      {/* Corner decorations */}
      <span className="bp-hero-corner-tl bp-enter-corner" />
      <span className="bp-hero-corner-br bp-enter-corner" />

      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* ── Left: Text ── */}
        <div className="flex flex-col gap-7">

          {/* Eyebrow */}
          <div className="bp-section-eyebrow bp-enter-1">
            <span className="bp-eyebrow-line" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bp-muted">
              Solution Architect · RAiD PPCOE
            </span>
            <span className="w-2 h-2 border border-bp-accent bg-bp-accent/20" />
          </div>

          {/* Headline */}
          <h1 className="bp-enter-2 font-mono font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-bp-text uppercase">
            Building<br />
            Systems —<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bp-accent to-sky-300">
              That Scale
            </span>
          </h1>

          {/* Subtitle */}
          <p className="bp-enter-3 text-bp-body text-[15px] leading-relaxed max-w-md">
            Manfred Siew is a Solution Architect at RAiD PPCOE designing
            enterprise-grade systems for Singapore's defence and public sector —
            cloud infrastructure, distributed platforms, and full-stack
            engineering across AWS, Azure, and Kubernetes.
          </p>

          {/* CTAs */}
          <div className="bp-enter-4 flex flex-wrap gap-3">
            <a href="#projects" className="bp-btn-primary inline-flex items-center gap-2">
              View Projects <ArrowRight size={14} />
            </a>
            <a href="#experience" className="bp-btn-ghost inline-flex items-center gap-2">
              See My Story <ChevronRight size={14} />
            </a>
          </div>

          {/* Stats bar */}
          <div className="bp-stats-bar bp-enter-5">
            {STATS.map((s) => (
              <div key={s.label} className={`bp-stat-item ${s.cls}`}>
                <span className="font-mono font-bold text-[22px] text-bp-accent leading-none">
                  {s.value}
                </span>
                <span className="font-mono text-[9px] tracking-[0.18em] text-bp-muted uppercase mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Profile ── */}
        <div className="bp-enter-3 relative flex items-center justify-center">
          <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px]">
            {/* Arch orbit ring */}
            <div className="absolute inset-[-20px] border border-bp-border-subtle rounded-full bp-node-pulse opacity-40" />
            <div className="absolute inset-[-44px] border border-bp-border-subtle rounded-full opacity-20" />

            {/* Profile photo */}
            <div className="w-full h-full overflow-hidden border border-bp-border">
              <img
                src="/profile_picture.png"
                alt="Manfred Siew"
                className="w-full h-full object-cover scale-[1.02] hover:scale-[1.06] transition-transform duration-700"
              />
            </div>

            {/* Corner ticks on photo */}
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-bp-accent" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-bp-accent" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-bp-accent" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-bp-accent" />

            {/* Floating node labels */}
            <div className="bp-arch-node bp-arch-node-lit bp-node-float absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-[0.14em] text-bp-accent uppercase whitespace-nowrap px-2 py-1">
              CLOUD INFRA
            </div>
            <div className="bp-arch-node bp-arch-node-lit bp-node-float-alt absolute top-1/2 -right-14 -translate-y-1/2 text-[8px] font-mono tracking-[0.14em] text-bp-accent uppercase whitespace-nowrap px-2 py-1">
              API LAYER
            </div>
            <div className="bp-arch-node bp-arch-node-lit bp-node-float absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-[0.14em] text-bp-accent uppercase whitespace-nowrap px-2 py-1">
              UI SYSTEM
            </div>
            <div className="bp-arch-node bp-arch-node-lit bp-node-float-alt absolute top-1/2 -left-14 -translate-y-1/2 text-[8px] font-mono tracking-[0.14em] text-bp-accent uppercase whitespace-nowrap px-2 py-1">
              SECURITY
            </div>
          </div>
        </div>
      </div>

      {/* Tech ticker */}
      <div className="bp-ticker-wrap bp-enter-5 mt-16">
        <div className="ticker-scroll flex gap-10">
          {[...TECHS, ...TECHS].map((tech, i) => (
            <span key={`${tech}-${i}`} className="bp-ticker-item">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
