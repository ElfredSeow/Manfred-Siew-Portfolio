export function Footer() {
  return (
    <footer className="relative z-10 py-12 border-t border-black/10 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-mono font-bold text-xl tracking-tighter text-gray-900 dark:text-white">
              MANFRED SIEW
            </span>
            <p className="micro-label mt-3">
              TRANSITIONING: AEROSPACE → AI ENG.
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href="https://linkedin.com/in/manfred-siew-25b4762aa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-bold tracking-widest text-gray-500 dark:text-white/50 hover:text-[#4ea8de] dark:hover:text-[#4ea8de] transition-colors uppercase border border-black/10 dark:border-white/10 px-4 py-2 hover:bg-black/5 dark:hover:bg-[#4ea8de]/10"
            >
              LinkedIn
            </a>
            <a
              href="mailto:Manfredsiew@hotmail.sg"
              className="text-xs font-mono font-bold tracking-widest text-gray-500 dark:text-white/50 hover:text-[#4ea8de] dark:hover:text-[#4ea8de] transition-colors uppercase border border-black/10 dark:border-white/10 px-4 py-2 hover:bg-black/5 dark:hover:bg-[#4ea8de]/10"
            >
              Email
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="micro-label opacity-40">
            © {new Date().getFullYear()} MANFRED SIEW
          </p>
          <p className="text-[10px] font-mono text-gray-400 dark:opacity-30 text-center md:text-right">
            AEROSPACE ENGINEERING DIPLOMA / TEMASEK POLYTECHNIC
          </p>
        </div>
      </div>
    </footer>
  );
}
