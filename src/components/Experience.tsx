import * as motion from "motion/react-client";

interface Role {
  org: string;
  title: string;
  period: string;
  achievements: string[];
  techs: string[];
}

const ROLES: Role[] = [
  {
    org: "RAiD PPCOE",
    title: "Solution Architect",
    period: "2022 — Present",
    achievements: [
      "Architected cloud-native platform supporting defence operations across 3 countries",
      "Led cross-functional teams of 20+ engineers, QA, and security specialists",
      "Reduced infrastructure cost by 38% via multi-cloud FinOps and IaC standardisation",
      "Defined enterprise API gateway and service mesh strategy using Istio + Kong",
    ],
    techs: ["AWS", "Azure", "Kubernetes", "Terraform", "Istio", "ArgoCD"],
  },
  {
    org: "DSTA",
    title: "Senior Systems Engineer",
    period: "2019 — 2022",
    achievements: [
      "Designed distributed data platform ingesting >2M events/day for national defence analytics",
      "Built event-driven microservices architecture with Kafka and CDC pipelines",
      "Delivered secure full-stack systems (React + Node.js) under restricted network environments",
    ],
    techs: ["Kafka", "PostgreSQL", "React", "Node.js", "Python", "Docker"],
  },
  {
    org: "ST Engineering",
    title: "Software Engineer",
    period: "2016 — 2019",
    achievements: [
      "Implemented C2 system integrations across legacy and modern defence platforms",
      "Delivered RESTful API layer bridging proprietary hardware protocols to web clients",
      "Introduced CI/CD pipeline (Jenkins + Git) cutting deployment time from days to hours",
    ],
    techs: ["Java", "Python", "REST", "Jenkins", "Oracle DB"],
  },
];

const EASE = [0.23, 1, 0.32, 1] as const;

export function Experience() {
  return (
    <section id="experience" className="relative py-20 px-6 lg:px-10 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-14"
      >
        <div className="bp-section-eyebrow mb-4">
          <span className="bp-eyebrow-line" />
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bp-muted">
            03 / Work History
          </span>
        </div>
        <h2 className="font-mono font-black text-4xl sm:text-5xl uppercase tracking-tight text-bp-text">
          Experience
        </h2>
      </motion.div>

      {/* Timeline */}
      <div className="relative flex flex-col">
        {/* Vertical rail */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-bp-border-subtle" />

        {ROLES.map((role, idx) => (
          <motion.div
            key={role.org}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: EASE, delay: idx * 0.1 }}
            className="bp-timeline-item pl-10 pb-14 relative"
          >
            {/* Rail dot */}
            <span className="absolute left-[-4px] top-1 w-2 h-2 border border-bp-accent bg-bp-bg" />

            <div className="bp-card p-6 lg:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
                <div>
                  <h3 className="font-mono font-bold text-[18px] text-bp-text tracking-tight">
                    {role.title}
                  </h3>
                  <span className="font-mono text-[13px] text-bp-accent tracking-wide">
                    {role.org}
                  </span>
                </div>
                <span className="font-mono text-[11px] tracking-[0.15em] text-bp-muted whitespace-nowrap pt-0.5">
                  {role.period}
                </span>
              </div>

              {/* Achievements */}
              <ul className="flex flex-col gap-2 mb-6">
                {role.achievements.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-[14px] text-bp-body leading-relaxed"
                  >
                    <span className="text-bp-accent mt-1 shrink-0">—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2">
                {role.techs.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 border border-bp-border text-bp-muted bg-bp-surface2"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
