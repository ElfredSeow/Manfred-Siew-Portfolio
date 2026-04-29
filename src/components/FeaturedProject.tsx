import * as motion from "motion/react-client";
import { featuredProject } from "../data/portfolio";
import { Layout, Database, Bot } from "lucide-react";

export function FeaturedProject() {
  return (
    <section
      id="featured"
      className="py-24 bg-[#fafafa] dark:bg-[#0A0A0A] border-t border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300"
    >
      <div className="absolute right-0 top-0 w-[800px] h-full bg-[#4ea8de]/5 blur-[150px] mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="micro-label mb-4">FEATURED WORK</div>
          <h2 className="text-4xl md:text-[80px] leading-[0.9] font-black tracking-tight mb-4 uppercase text-gray-900 dark:text-white">
            NO-CODE → <br className="hidden md:block" />
            <span className="accent-text">AI-OPS.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex w-full"
          >
            <div className="card-glass p-2 flex flex-col w-full relative overflow-hidden group border-black/10 dark:border-white/20">
              <div className="absolute -right-8 -top-8 w-64 h-64 bg-[#4ea8de]/20 rounded-full blur-[80px] transition-opacity group-hover:opacity-100 opacity-60 pointer-events-none"></div>
              
              <div className="relative z-10 w-full flex flex-col h-full min-h-[300px] items-center justify-center bg-gray-100 dark:bg-[#0A0A0A] rounded-lg overflow-hidden border border-black/5 dark:border-white/5 transition-colors duration-300">
                
                {/* Fallback state instructing user to upload */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-white/40 p-6 text-center">
                   <p className="mb-2 text-sm">Waiting for infographic image...</p>
                   <p className="text-[10px] uppercase font-mono tracking-widest text-[#4ea8de]/60 mb-2">Instructions</p>
                   <p className="text-xs">Drag and drop your infographic into the <b className="text-gray-900 dark:text-white">public</b> folder in the file explorer.</p>
                   <p className="text-xs">Name the image file exactly: <b className="text-gray-900 dark:text-white">facility-infographic.jpg</b></p>
                </div>

                <img 
                  src="/facility-infographic.jpg" 
                  alt="RSAF Facility Booking App Infographic" 
                  className="w-full h-auto relative z-10 rounded object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.1)] opacity-0 transition-opacity duration-500"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.previousElementSibling?.classList.add('hidden');
                  }}
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.previousElementSibling?.classList.remove('hidden');
                  }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-glass p-8 lg:p-12 flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="micro-label px-2 py-1 bg-black/5 dark:bg-white/10">
                PROJECT HIGHLIGHT
              </div>
              <div className="text-[10px] sm:text-xs font-mono text-[#4ea8de]">
                [ 2-DAY DELIVERY ]
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{featuredProject.title}</h3>
            <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed mb-8">
              {featuredProject.description}
            </p>

            <div className="space-y-3 mb-8 flex-1">
              {featuredProject.features?.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#4ea8de] mt-1.5 mr-3 shrink-0"></span>
                  <span className="text-sm text-gray-700 dark:text-white/80">{feature}</span>
                </div>
              ))}
            </div>

            <div className="card-glass border-[#4ea8de]/30 p-6 bg-[#4ea8de]/5 mb-8">
              <div className="micro-label accent-text mb-2">The Impact</div>
              <p className="text-xs sm:text-sm text-gray-800 dark:text-white/80 leading-relaxed">
                {featuredProject.learningPoints}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-black/10 dark:border-white/10 pt-6 mt-auto">
              {featuredProject.tools.slice(0, 6).map((tool, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="micro-label opacity-40">Tech {idx + 1}</div>
                  <div className="text-xs font-bold leading-tight text-gray-900 dark:text-white">{tool}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
