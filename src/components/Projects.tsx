import { useState, useEffect, Fragment } from "react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { workProjects, personalProjects, Project } from "../data/portfolio";
import { AppMockup } from "./AppMockup";
import { X, ExternalLink, Github } from "lucide-react";
import { cn } from "../lib/utils";

// ─── Modal ────────────────────────────────────────────────────────────────────

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="bp-modal-overlay absolute inset-0"
        />
        <motion.div
          layoutId={`card-${project.id}`}
          transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
          className="bp-modal relative w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal header */}
          <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-bp-border bg-bp-bg/90 backdrop-blur-md">
            <div className="flex gap-2 items-center">
              <span className="font-mono text-[10px] tracking-[0.16em] uppercase px-2 py-1 bg-bp-accent/10 text-bp-accent border border-bp-accent/30">
                {project.category}
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase px-2 py-1 border border-bp-border text-bp-muted">
                {project.organization}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-bp-border text-bp-muted hover:border-bp-accent hover:text-bp-accent transition-colors flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:inline">GitHub</span>
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2 border border-bp-border text-bp-muted hover:border-bp-accent hover:text-bp-accent transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-8 md:p-10 overflow-y-auto bg-bp-bg">
            <h2 className="font-mono font-black text-2xl md:text-3xl uppercase text-bp-text mb-4 tracking-tight">
              {project.title}
            </h2>

            {/* CSS Mockup */}
            {project.mockupType && (
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted mb-3">
                  App Preview
                </p>
                <AppMockup mockupType={project.mockupType} />
              </div>
            )}

            {project.imageSource && (
              <div
                className="mb-8 border border-bp-border overflow-hidden cursor-zoom-in group relative"
                onClick={() => setZoomedImage(project.imageSource || null)}
              >
                <img
                  src={project.imageSource}
                  alt={project.title}
                  className="w-full h-auto object-cover max-h-[400px] transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-bp-accent/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="font-mono text-[10px] tracking-widest uppercase px-3 py-1 bg-bp-bg/90 border border-bp-border text-bp-muted">
                    Click to enlarge
                  </span>
                </div>
              </div>
            )}

            <p className="text-bp-body text-sm leading-relaxed mb-8 border-l-2 border-bp-accent pl-4 sm:pl-6 py-2 bg-bp-surface">
              {project.description}
            </p>

            {project.learningPoints && (
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted mb-4">
                  Key Learning &amp; Impact
                </p>
                <div className="border border-bp-border p-5 bg-bp-surface">
                  <p className="text-bp-body text-sm leading-relaxed">
                    {project.learningPoints}
                  </p>
                </div>
              </div>
            )}

            {project.features && project.features.length > 0 && (
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted mb-4">
                  Key Features
                </p>
                <ul className="flex flex-col gap-2">
                  {project.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-bp-body">
                      <span className="text-bp-accent mt-1 shrink-0">—</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted mb-4">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 border border-bp-border text-bp-muted bg-bp-surface2 hover:border-bp-accent hover:text-bp-accent transition-colors"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image zoom */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-bp-bg/95 backdrop-blur-md"
            onClick={() => setZoomedImage(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-[95vw] max-h-[95vh] z-10"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-50 p-2 border border-bp-border bg-bp-bg/80 hover:border-bp-accent text-bp-muted hover:text-bp-accent transition-colors"
            >
              <X size={18} />
            </button>
            <img
              src={zoomedImage}
              alt="Preview"
              className="w-full h-auto max-h-[85vh] object-contain border border-bp-border"
            />
          </motion.div>
        </div>
      )}
    </>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onSelect,
}: {
  project: Project;
  index: number;
  onSelect: (p: Project) => void;
}) {
  return (
    <motion.div
      layoutId={`card-${project.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      onClick={() => onSelect(project)}
      className="bp-card cursor-pointer flex flex-col hover:border-bp-accent transition-colors group"
    >
      {/* Mockup preview */}
      <div className="p-3 border-b border-bp-border-subtle">
        <AppMockup mockupType={project.mockupType} />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-1 bg-bp-surface2 border border-bp-border text-bp-muted">
            {project.category}
          </span>
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-bp-muted hover:text-bp-accent transition-colors"
                title="View on GitHub"
              >
                <Github size={12} />
              </a>
            )}
            <span className="font-mono text-[9px] text-bp-muted uppercase tracking-wide">
              {project.organization}
            </span>
          </div>
        </div>

        <h3 className="font-mono font-bold text-[14px] uppercase tracking-tight text-bp-text mb-2 group-hover:text-bp-accent transition-colors leading-tight">
          {project.title}
        </h3>

        <p className="text-[12px] text-bp-body mb-4 line-clamp-2 flex-grow leading-relaxed">
          {project.description}
        </p>

        <div className="mt-auto border-t border-bp-border-subtle pt-3 flex items-center justify-between">
          <span className="font-mono text-[9px] text-bp-muted uppercase tracking-widest truncate">
            {project.tools.slice(0, 3).join(" · ")}
            {project.tools.length > 3 && ` +${project.tools.length - 3}`}
          </span>
          <ExternalLink
            size={10}
            className="shrink-0 text-bp-muted group-hover:text-bp-accent transition-colors ml-2"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({
  project,
  index,
  onSelect,
}: {
  project: Project;
  index: number;
  onSelect: (p: Project) => void;
}) {
  return (
    <motion.div
      layoutId={`card-${project.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      onClick={() => onSelect(project)}
      className="bp-card cursor-pointer flex flex-col hover:border-bp-accent transition-colors group"
    >
      {/* Mockup */}
      <div className="p-4 border-b border-bp-border-subtle">
        <AppMockup mockupType={project.mockupType} />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 items-center">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-1 bg-bp-accent/10 text-bp-accent border border-bp-accent/30">
              FEATURED
            </span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-1 border border-bp-border text-bp-muted bg-bp-surface2">
              {project.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-bp-muted hover:text-bp-accent transition-colors"
              >
                <Github size={14} />
              </a>
            )}
            <span className="font-mono text-[10px] text-bp-muted uppercase tracking-wide">
              {project.organization}
            </span>
          </div>
        </div>

        <h3 className="font-mono font-bold text-[17px] uppercase tracking-tight text-bp-text mb-3 group-hover:text-bp-accent transition-colors">
          {project.title}
        </h3>

        <p className="text-[13px] text-bp-body mb-5 line-clamp-3 flex-grow leading-relaxed">
          {project.description}
        </p>

        {project.features && project.features.length > 0 && (
          <ul className="flex flex-col gap-1.5 mb-5">
            {project.features.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px] text-bp-body">
                <span className="w-1 h-1 bg-bp-accent shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto border-t border-bp-border-subtle pt-4 flex items-center justify-between">
          <span className="font-mono text-[9px] text-bp-muted uppercase tracking-widest">
            {project.tools.slice(0, 3).join(" · ")}
            {project.tools.length > 3 && ` +${project.tools.length - 3}`}
          </span>
          <span className="font-mono text-[10px] text-bp-accent group-hover:underline uppercase tracking-widest">
            View →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const WORK_ORGS = ["All", "RAiD", "Temasek Polytechnic", "Freelance"];

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"work" | "personal">("work");
  const [filterOrg, setFilterOrg] = useState("All");

  useEffect(() => {
    if (selectedProject) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const featuredWork     = workProjects.filter((p) => p.featured);
  const featuredPersonal = personalProjects.filter((p) => p.featured);
  const filteredWork     = workProjects.filter(
    (p) => !p.featured && (filterOrg === "All" || p.organization === filterOrg)
  );
  const filteredPersonal = personalProjects.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      className="py-24 border-t border-bp-border-subtle relative px-6 lg:px-10 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        className="mb-16"
      >
        <div className="bp-section-eyebrow mb-4">
          <span className="bp-eyebrow-line" />
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bp-muted">
            02 / Portfolio
          </span>
        </div>
        <h2 className="font-mono font-black text-4xl sm:text-5xl uppercase tracking-tight text-bp-text mb-4">
          Things I've<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-bp-accent to-sky-300">
            Shipped.
          </span>
        </h2>
        <p className="text-bp-body text-[15px] max-w-xl leading-relaxed">
          Enterprise systems, automation tools, and personal projects — from no-code to AI-orchestrated engineering.
        </p>
      </motion.div>

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-12">
        {(["work", "personal"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "font-mono text-[11px] tracking-[0.16em] uppercase px-5 py-2 border transition-colors",
              activeTab === tab
                ? "border-bp-accent bg-bp-accent/10 text-bp-accent"
                : "border-bp-border-subtle text-bp-muted hover:border-bp-border hover:text-bp-body"
            )}
          >
            {tab === "work" ? "Work Projects" : "Personal / Open Source"}
          </button>
        ))}
      </div>

      {/* Work Tab */}
      {activeTab === "work" && (
        <motion.div
          key="work"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted mb-6 opacity-70">
            Featured Work
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {featuredWork.map((project, idx) => (
              <Fragment key={project.id}>
                <FeaturedCard
                  project={project}
                  index={idx}
                  onSelect={(p) => setSelectedProject(p)}
                />
              </Fragment>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted opacity-70">
              All Work Projects
            </p>
            <div className="flex flex-wrap gap-2">
              {WORK_ORGS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFilterOrg(cat)}
                  className={cn(
                    "font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 border transition-colors",
                    filterOrg === cat
                      ? "border-bp-accent bg-bp-accent/10 text-bp-accent"
                      : "border-bp-border-subtle text-bp-muted hover:border-bp-border hover:text-bp-body"
                  )}
                >
                  {cat === "All" ? "ALL" : cat === "RAiD" ? "RSAF (RAiD)" : cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredWork.map((project, idx) => (
              <Fragment key={project.id}>
                <ProjectCard
                  project={project}
                  index={idx}
                  onSelect={(p) => setSelectedProject(p)}
                />
              </Fragment>
            ))}
          </div>
        </motion.div>
      )}

      {/* Personal Tab */}
      {activeTab === "personal" && (
        <motion.div
          key="personal"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted mb-6 opacity-70">
            Featured Personal Projects
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {featuredPersonal.map((project, idx) => (
              <Fragment key={project.id}>
                <FeaturedCard
                  project={project}
                  index={idx}
                  onSelect={(p) => setSelectedProject(p)}
                />
              </Fragment>
            ))}
          </div>

          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bp-muted mb-6 opacity-70">
            More Projects
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPersonal.map((project, idx) => (
              <Fragment key={project.id}>
                <ProjectCard
                  project={project}
                  index={idx}
                  onSelect={(p) => setSelectedProject(p)}
                />
              </Fragment>
            ))}
          </div>

          {/* Open source note */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="mt-12 bp-card p-6 border-bp-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-bp-accent mb-2">
                Open Source
              </p>
              <p className="text-[13px] text-bp-body leading-relaxed">
                Most personal projects are public on GitHub. Cards with the{" "}
                <Github className="inline-block mx-0.5" size={11} /> icon link
                directly to the repo.
              </p>
            </div>
            <a
              href="https://github.com/ElfredSeow"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-btn-ghost inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Github size={12} />
              View All Repos
            </a>
          </motion.div>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
