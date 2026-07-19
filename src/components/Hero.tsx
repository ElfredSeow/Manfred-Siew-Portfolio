import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight, ArrowDownToLine } from "lucide-react";

const cinematicEase = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const glowUpperY = useTransform(scrollY, [0, 900], [0, 140]);
  const glowLowerY = useTransform(scrollY, [0, 900], [0, -100]);
  const portraitY = useTransform(scrollY, [0, 900], [0, 70]);

  return (
    <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={prefersReducedMotion ? undefined : { y: glowUpperY }}
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#4ea8de]/10 blur-[100px] opacity-60 translate-x-1/3 translate-y-1/3 mix-blend-screen"
        />
        <motion.div
          style={prefersReducedMotion ? undefined : { y: glowLowerY }}
          className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#4ea8de]/5 blur-[120px] opacity-40 -translate-x-1/3 translate-y-1/3 mix-blend-screen"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12 lg:gap-8">
          <div className="max-w-5xl lg:max-w-3xl flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: cinematicEase }}
              className="mb-8 hidden lg:block"
            >
              <span className="micro-label">
                Transitioning: Aerospace → AI Engineering
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: cinematicEase }}
              className="huge-text mb-8 uppercase"
            >
              MANFRED <br className="hidden lg:block" />
              <span className="accent-text flex-col flex sm:inline-block mt-2 sm:mt-0">
                SIEW.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: cinematicEase }}
              className="text-xl md:text-2xl text-gray-700 dark:text-white/60 mb-12 font-medium max-w-2xl mx-auto lg:mx-0"
            >
              Aspiring{" "}
              <strong className="text-black dark:text-white">AI & Software Engineer</strong>.
              Currently innovating at <span className="accent-text">RAiD</span>{" "}
              (RSAF Agile innovation Digital).
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: cinematicEase }}
              className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start lg:items-stretch gap-6"
            >
              <div className="flex items-center gap-4 card-glass p-4 pr-6 shrink-0 h-[64px]">
                <div className="flex justify-center items-start flex-col px-2 h-full">
                  <span className="micro-label mb-[2px]">Focus</span>
                  <div className="flex gap-4 items-center">
                    <span className="text-xs sm:text-sm font-bold opacity-80 border-r border-black/20 dark:border-white/20 pr-4 text-gray-900 dark:text-white">
                      AEROSPACE
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#4ea8de]" />
                    <span className="text-xs sm:text-sm font-bold text-[#4ea8de] pl-1 sm:pl-2">
                      AI ENG
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="#projects"
                className="inline-flex h-[64px] items-center justify-center px-8 border border-[#4ea8de]/50 hover:bg-[#4ea8de]/10 transition-all font-bold text-sm tracking-widest text-[#4ea8de] uppercase shrink-0"
              >
                Technical Specs <ArrowDownToLine className="ml-2 w-4 h-4" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: cinematicEase }}
            style={prefersReducedMotion ? undefined : { y: portraitY }}
            className="relative shrink-0 mx-auto lg:mx-0 w-64 h-64 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] xl:w-[480px] xl:h-[480px]"
          >
            {/* Buoyancy — a slow vertical bob, like floating in still water */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 p-2 relative z-10 flex items-center justify-center">
                {/* Blurred underlay layer to predict/fill any gaps if image has letterboxing or transparency */}
                <div className="absolute inset-0 rounded-full overflow-hidden z-0">
                  <img
                    src="/profile_picture.png"
                    alt=""
                    className="w-full h-full object-cover blur-2xl scale-[1.5] opacity-60 dark:opacity-40"
                  />
                </div>

                {/* Main Profile Image - Full Color */}
                <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                  <img
                    src="/profile_picture.png"
                    alt="Manfred Siew"
                    className="w-full h-full object-cover scale-[1.02] hover:scale-[1.08] transition-transform duration-700"
                  />
                </div>
              </div>
              {/* Outer ambient glow based on time of day */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full bg-[#4ea8de]/20 blur-[60px] lg:blur-[100px] -z-10 mix-blend-screen transition-all duration-1000"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.a
          href="#featured"
          aria-label="Scroll to featured work"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: cinematicEase }}
          className="mt-20 hidden lg:flex flex-col items-center gap-3 w-fit mx-auto group"
        >
          <span className="micro-label border-none bg-transparent dark:bg-transparent opacity-60 group-hover:opacity-100 group-hover:text-[#4ea8de] transition-all">
            Dive Deeper
          </span>
          <span className="relative h-12 w-px bg-black/10 dark:bg-white/10 overflow-hidden">
            <motion.span
              animate={
                prefersReducedMotion ? undefined : { y: ["-100%", "300%"] }
              }
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-0 h-4 w-px bg-[#4ea8de]"
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
