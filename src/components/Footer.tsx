import { Github, Linkedin, Mail } from "lucide-react";

const SOCIAL = [
  { icon: Github,   label: "GitHub",   href: "https://github.com/ElfredSeow" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/in/manfred-siew-25b4762aa" },
  { icon: Mail,     label: "Email",    href: "mailto:Manfredsiew@hotmail.sg" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-bp-border-subtle mt-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">

        {/* Main CTA block */}
        <div className="flex flex-col items-center text-center gap-6 mb-14">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-bp-muted">
            Available for collaboration
          </p>
          <h2 className="font-mono font-black text-4xl sm:text-5xl uppercase tracking-tight text-bp-text">
            Manfred Siew
          </h2>
          <p className="font-mono text-[13px] tracking-[0.1em] text-bp-muted">
            Solution Architect &nbsp;·&nbsp; RAiD PPCOE
          </p>
          <a
            href="mailto:Manfredsiew@hotmail.sg"
            className="bp-btn-primary inline-flex items-center gap-2 mt-2"
          >
            <Mail size={14} />
            Get in Touch
          </a>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 mb-14">
          {SOCIAL.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="flex items-center justify-center w-10 h-10 border border-bp-border-subtle text-bp-muted hover:text-bp-accent hover:border-bp-border transition-colors duration-150"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-bp-border-subtle">
          <span className="font-mono text-[10px] tracking-[0.14em] text-bp-muted">
            &copy; {new Date().getFullYear()} Manfred Siew &nbsp;·&nbsp; Built with React &amp; Vite
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-bp-muted">
            Singapore / SG
          </span>
        </div>
      </div>
    </footer>
  );
}
