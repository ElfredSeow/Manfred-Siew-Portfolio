/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from "./components/ThemeProvider";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Organizations } from "./components/Organizations";
import { FeaturedProject } from "./components/FeaturedProject";
import { ThreeCircles } from "./components/ThreeCircles";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans selection:bg-[#4ea8de]/30 selection:text-white transition-colors duration-300">
        <Navigation />
        <main>
          <Hero />
          <Organizations />
          <FeaturedProject />
          <ThreeCircles />
          <Projects />
          <Experience />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
