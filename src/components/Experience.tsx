import * as motion from "motion/react-client";
import { experience } from "../data/portfolio";

export function Experience() {
  return (
    <section
      id="experience"
      className="py-24 bg-[#fafafa] dark:bg-[#0A0A0A] border-t border-black/10 dark:border-white/10 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="micro-label mb-4">HISTORY</div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6 text-gray-900 dark:text-white">
            Transition <br className="hidden sm:block" />
            <span className="accent-text">Path.</span>
          </h2>
        </motion.div>

        <div className="space-y-0">
          {experience.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-6 md:pl-0"
            >
              <div className="md:grid md:grid-cols-4 md:gap-8 items-start py-8 border-l border-black/20 dark:border-white/20 md:border-none group">
                <div className="hidden md:flex flex-col items-end text-right pr-8 border-r-2 border-black/20 dark:border-white/20 group-hover:border-[#4ea8de] dark:group-hover:border-[#4ea8de] transition-colors pt-2 h-full">
                  <span className="micro-label text-right">{exp.period}</span>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-white/40 mt-2 uppercase">
                    {exp.location}
                  </span>
                </div>

                <div className="md:col-span-3 relative pb-8 md:pb-0 md:pl-8">
                  {/* Mobile Date */}
                  <div className="md:hidden mb-4">
                    <span className="micro-label text-[#4ea8de]">
                      {exp.period}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2 text-gray-900 dark:text-white group-hover:text-[#4ea8de] transition-colors">
                    {exp.role}
                  </h3>
                  <div className="text-xs sm:text-sm font-mono text-gray-600 dark:text-white/60 mb-4 uppercase">
                    // {exp.company}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-white/70 leading-relaxed card-glass p-6 bg-black/5 dark:bg-white/5 border-l-2 border-transparent group-hover:border-l-[#4ea8de] transition-all">
                    {exp.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
