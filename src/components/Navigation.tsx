import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Navigation() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full card-glass z-50 border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <span className="font-mono font-bold text-xl tracking-tighter text-gray-900 dark:text-white">
              MANFRED SIEW
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#about"
                className="micro-label hover:border-[#4ea8de] dark:hover:border-[#4ea8de] hover:text-[#4ea8de] dark:hover:text-[#4ea8de] transition-colors"
              >
                01 / IMPACT
              </a>
              <a
                href="#projects"
                className="micro-label hover:border-[#4ea8de] dark:hover:border-[#4ea8de] hover:text-[#4ea8de] dark:hover:text-[#4ea8de] transition-colors"
              >
                02 / PORTFOLIO
              </a>
              <a
                href="#experience"
                className="micro-label hover:border-[#4ea8de] dark:hover:border-[#4ea8de] hover:text-[#4ea8de] dark:hover:text-[#4ea8de] transition-colors"
              >
                03 / HISTORY
              </a>
            </div>
          </div>
          <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/10 dark:border-white/10">
            <button
              onClick={() => setTheme("light")}
              className={`p-2 rounded-md transition-colors ${theme === "light" ? "bg-black/10 dark:bg-white/10 text-[#4ea8de]" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"}`}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-2 rounded-md transition-colors ${theme === "dark" ? "bg-black/10 dark:bg-white/10 text-[#4ea8de]" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"}`}
            >
              <Moon size={14} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
