import { useState } from "react";
import * as motion from "motion/react-client";
import { projects, Project } from "../data/portfolio";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [filterOrg, setFilterOrg] = useState<string>("All");

  const orgCategories = ["All", "RAiD", "Temasek Polytechnic", "Freelance"];

  const filteredProjects = projects.filter((p) => {
    return filterOrg === "All" || p.organization === filterOrg;
  });

  return (
    <section
      id="projects"
      className="py-24 bg-[#fafafa] dark:bg-[#0A0A0A] border-t border-black/10 dark:border-white/10 relative transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div>
            <div className="micro-label mb-4">PORTFOLIO v2.4</div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
              Tech Portfolio
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {orgCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterOrg(cat)}
                className={cn(
                  "micro-label px-4 py-2 border transition-all",
                  filterOrg === cat
                    ? "border-[#4ea8de] bg-[#4ea8de]/10 text-[#4ea8de] dark:text-[#4ea8de]"
                    : "border-black/10 dark:border-white/10 bg-transparent hover:border-black/30 dark:hover:border-white/30 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white",
                )}
              >
                {cat === "All"
                  ? "ALL PROJECTS"
                  : cat === "RAiD"
                    ? "RSAF (RAiD)"
                    : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              layoutId={`card-${project.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedProject(project)}
              className="card-glass p-8 cursor-pointer flex flex-col h-full hover:border-[#4ea8de]/50 transition-colors group border-black/10 dark:border-white/10"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="micro-label px-2 py-1 bg-black/5 dark:bg-white/10">
                  {project.category}
                </div>
                <div className="text-[10px] font-mono text-gray-500 dark:text-white/50 uppercase">
                  {project.organization}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-[#4ea8de] transition-colors uppercase pr-4 text-gray-900 dark:text-white">
                {project.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-white/60 mb-8 line-clamp-3 flex-grow leading-relaxed">
                {project.description}
              </p>

              <div className="mt-auto border-t border-black/10 dark:border-white/10 pt-4 flex items-center justify-between">
                <div className="text-[10px] font-mono text-gray-500 dark:text-white/50 uppercase tracking-widest truncate w-full">
                  {project.tools.slice(0, 3).join(" / ")}
                  {project.tools.length > 3 &&
                    ` / +${project.tools.length - 3}`}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Overlay */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            layoutId={`card-${selectedProject.id}`}
            className="relative w-full max-w-3xl card-glass bg-white dark:bg-[#0A0A0A] overflow-hidden flex flex-col max-h-[90vh] rounded-none border border-[#4ea8de]/30 transition-colors duration-300"
          >
            <div className="sticky top-0 right-0 z-10 flex justify-end p-4 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white hover:border-[#4ea8de] hover:text-[#4ea8de] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 md:p-12 overflow-y-auto">
              <div className="mb-6 flex flex-wrap gap-3 items-center">
                <span className="micro-label px-2 py-1 bg-[#4ea8de]/10 text-[#4ea8de]">
                  {selectedProject.category}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 dark:text-white/50 border border-black/10 dark:border-white/10 px-2 py-1">
                  ORG // {selectedProject.organization}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase text-gray-900 dark:text-white">
                {selectedProject.title}
              </h2>

              {selectedProject.imageSource && (
                <div 
                  className="mb-10 card-glass overflow-hidden border-black/10 dark:border-white/10 cursor-zoom-in group relative"
                  onClick={() => setZoomedImage(selectedProject.imageSource || null)}
                >
                  <img
                    src={selectedProject.imageSource}
                    alt={selectedProject.title}
                    className="w-full h-auto object-cover max-h-[400px] transition-transform duration-500 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="micro-label bg-white/90 dark:bg-black/90 border-none">Click to enlarge</span>
                  </div>
                </div>
              )}

              <p className="text-sm sm:text-base text-gray-700 dark:text-white/70 mb-10 leading-relaxed border-l-2 border-[#4ea8de] pl-4 sm:pl-6 py-2 bg-black/5 dark:bg-white/5">
                {selectedProject.description}
              </p>

              {selectedProject.learningPoints && (
                <div className="mb-10">
                  <div className="micro-label mb-4">Key Learnings & Output</div>
                  <div className="card-glass border-black/10 dark:border-white/10 p-6 bg-black/5 dark:bg-white/5">
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-white/80 leading-relaxed">
                      {selectedProject.learningPoints}
                    </p>
                  </div>
                </div>
              )}

              {selectedProject.features &&
                selectedProject.features.length > 0 && (
                  <div className="mb-10">
                    <div className="micro-label mb-4">Key Features</div>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-white/70 space-y-2">
                      {selectedProject.features.map((feature, idx) => (
                        <li key={idx}>
                          <span className="ml-2">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div>
                <div className="micro-label mb-4">Tech Specs</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase px-3 py-1.5 border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-black text-gray-800 dark:text-white/80 hover:border-[#4ea8de] transition-colors"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={() => setZoomedImage(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-[95vw] max-h-[95vh] z-10"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors flex items-center gap-2 micro-label border-none bg-transparent"
            >
              <X size={18} /> CLOSE PREVIEW
            </button>
            <img
              src={zoomedImage}
              alt="High Resolution Preview"
              className="w-full h-auto max-h-[85vh] object-contain shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      )}
    </section>
  );
}
