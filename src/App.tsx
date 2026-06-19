import { Loader } from "./components/Loader";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Organizations } from "./components/Organizations";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="bp-root relative min-h-screen">
      <Loader />
      <Navigation />
      <main className="relative z-10">
        <Hero />
        <Organizations />
        <Projects />
        <Experience />
      </main>
      <Footer />
    </div>
  );
}
