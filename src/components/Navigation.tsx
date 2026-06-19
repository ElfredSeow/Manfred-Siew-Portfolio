import { useState } from "react";
import { Menu, X } from "lucide-react";
import * as motion from "motion/react-client";

const NAV_LINKS = [
  { label: "01 / WORK",      href: "#projects"   },
  { label: "02 / HISTORY",   href: "#experience" },
  { label: "03 / GITHUB ↗", href: "https://github.com/ElfredSeow", external: true },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bp-nav bp-enter-nav">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <span className="font-mono font-bold text-[13px] tracking-[0.18em] uppercase text-bp-accent">
            M<span className="text-bp-muted">.</span>Siew
            <span className="hidden sm:inline text-bp-muted"> // Portfolio</span>
          </span>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="bp-nav-link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href="mailto:Manfredsiew@hotmail.sg" className="hidden md:inline-flex bp-nav-cta">
              Contact
            </a>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 border border-bp-border-subtle text-bp-body transition-colors hover:text-bp-accent hover:border-bp-border"
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="md:hidden border-t border-bp-border-subtle overflow-hidden bg-bp-bg/97"
        >
          <div className="px-6 py-5 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="font-mono text-[11px] tracking-[0.18em] uppercase py-3 text-center border border-bp-border-subtle text-bp-body hover:border-bp-border hover:text-bp-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:Manfredsiew@hotmail.sg"
              onClick={() => setOpen(false)}
              className="bp-nav-cta text-center"
            >
              Contact
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
