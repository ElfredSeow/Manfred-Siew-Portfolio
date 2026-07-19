import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

interface Particle {
  x: number;
  y: number;
  r: number;
  sink: number;
  sway: number;
  phase: number;
  parallax: number;
  alpha: number;
}

/**
 * Fixed, non-interactive atmospheric layers behind the page content:
 * drifting "marine snow" particles with scroll parallax, surface light
 * rays that fade as you descend, a depth tint that deepens toward the
 * footer, and a small depth-gauge HUD on wide screens.
 */
export function DepthAtmosphere() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY, scrollYProgress } = useScroll();

  const raysOpacity = useTransform(scrollY, [0, 700], [1, 0]);
  const abyssDark = useTransform(scrollYProgress, [0, 1], [0, 0.55]);
  const abyssLight = useTransform(scrollYProgress, [0, 1], [0, 0.14]);

  const [depth, setDepth] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setDepth(Math.round(v * 380) * 10);
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let running = true;
    let t = 0;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.max(30, Math.floor(width / 18)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.8,
        sink: 0.04 + Math.random() * 0.16,
        sway: 6 + Math.random() * 16,
        phase: Math.random() * Math.PI * 2,
        parallax: 0.04 + Math.random() * 0.22,
        alpha: 0.08 + Math.random() * 0.32,
      }));
    };

    const frame = () => {
      if (!running) return;
      t += 0.008;
      const offset = scrollY.get();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#9ecbeb";
      for (const p of particles) {
        p.y += p.sink;
        const x = p.x + Math.sin(t + p.phase) * p.sway;
        const y = (((p.y - offset * p.parallax) % height) + height) % height;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(((x % width) + width) % width, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      if (visible && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    init();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", init);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReducedMotion, scrollY]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Marine snow */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full opacity-40 dark:opacity-100"
        />
      )}

      {/* Surface light rays — fade out as the visitor descends */}
      <motion.div
        style={{ opacity: prefersReducedMotion ? 0.5 : raysOpacity }}
        className="absolute inset-x-0 top-0 h-[85vh]"
      >
        <div
          className="absolute inset-0 hidden dark:block mix-blend-screen"
          style={{
            background:
              "linear-gradient(100deg, transparent 18%, rgba(78,168,222,0.08) 25%, transparent 33%, transparent 45%, rgba(78,168,222,0.05) 53%, transparent 61%, transparent 72%, rgba(78,168,222,0.07) 79%, transparent 87%)",
            maskImage: "linear-gradient(to bottom, black 10%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 10%, transparent)",
          }}
        />
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(78,168,222,0.10), transparent 70%)",
          }}
        />
      </motion.div>

      {/* Depth tint — the page darkens as you dive */}
      <motion.div
        style={{ opacity: abyssDark }}
        className="absolute inset-0 hidden dark:block bg-gradient-to-b from-transparent via-[#04121f]/40 to-[#020b14]"
      />
      <motion.div
        style={{ opacity: abyssLight }}
        className="absolute inset-0 dark:hidden bg-gradient-to-b from-transparent to-[#9dbdd6]"
      />

      {/* Depth gauge HUD */}
      <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex">
        <span className="font-mono text-[9px] uppercase tracking-widest text-gray-400 dark:text-white/30 [writing-mode:vertical-rl]">
          Depth
        </span>
        <div className="relative h-28 w-px bg-black/10 dark:bg-white/10">
          <motion.div
            className="absolute left-0 top-0 h-full w-full origin-top bg-[#4ea8de]"
            style={{ scaleY: scrollYProgress }}
          />
        </div>
        <span className="font-mono text-[10px] tracking-widest text-[#4ea8de]/80 tabular-nums">
          -{String(depth).padStart(4, "0")}M
        </span>
      </div>
    </div>
  );
}
