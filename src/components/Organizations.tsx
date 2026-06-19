import * as motion from "motion/react-client";

const ORGS = [
  { name: "DSTA",           full: "Defence Science & Technology Agency" },
  { name: "RAiD PPCOE",     full: "Public Protection Centre of Excellence" },
  { name: "MINDEF",         full: "Ministry of Defence" },
  { name: "Singapore Army", full: "Republic of Singapore Army" },
  { name: "ST Engineering", full: "ST Engineering Ltd" },
  { name: "Accenture",      full: "Accenture Federal / Public Services" },
];

export function Organizations() {
  return (
    <section id="organizations" className="relative py-12 px-6 lg:px-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="bp-trust-panel py-8 px-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-bp-muted text-center mb-8">
            Trusted Partnerships
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {ORGS.map((org) => (
              <div key={org.name} className="bp-org-logo group relative">
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
                  {org.name}
                </span>
                {/* Tooltip */}
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-mono tracking-wide bg-bp-surface border border-bp-border text-bp-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                  {org.full}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
