import * as motion from "motion/react-client";
import { User, Users, Globe2 } from "lucide-react";

export function ThreeCircles() {
  const circles = [
    {
      title: "Individual Impact",
      icon: <User className="w-6 h-6" />,
      description:
        "Delivering direct value through technical expertise. Building enterprise solutions like RAiD Air 2.0 that replace legacy systems.",
    },
    {
      title: "Community Scaling",
      icon: <Globe2 className="w-6 h-6" />,
      description:
        "Integrating best practices. Explored Vibe-Coding to reduce dev time to days, leveraging open-source tools to solve gaps.",
    },
    {
      title: "Success Multiplication",
      icon: <Users className="w-6 h-6" />,
      description:
        "Empowering through Training and Consultancy. Delivered Bootcamps, consulted units RSAF-wide, and created guides.",
    },
  ];

  return (
    <section
      id="about"
      className="py-24 border-t border-black/10 dark:border-white/10 overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <div className="micro-label mb-4">THE FRAMEWORK</div>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-[80px] leading-[0.9] font-black uppercase tracking-tight mb-6 text-gray-900 dark:text-white"
          >
            Margin Of <br className="hidden sm:block" />
            <span className="accent-text">Impact.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm border-l border-black/20 dark:border-white/20 pl-4 text-gray-600 dark:text-white/60 max-w-2xl"
          >
            My tenure at RAiD is defined by a holistic approach safely
            navigating large-scale enterprise complexities through three
            intersecting areas of impact.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {circles.map((circle, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: 0.2 + idx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="card-glass p-8 group hover:bg-[#4ea8de]/5 transition-colors relative border-black/10 dark:border-white/10"
            >
              <div className="text-[#4ea8de] mb-8 opacity-70 group-hover:opacity-100 transition-opacity">
                {circle.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 uppercase tracking-wide text-gray-900 dark:text-white">
                {circle.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                {circle.description}
              </p>

              <div className="absolute top-8 right-8 micro-label opacity-30 text-[#4ea8de] font-mono border-none bg-transparent dark:bg-transparent px-0">
                0{idx + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
