import { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Recommendations from './components/Recommendations';
import Contact from './components/Contact';
import content from './data/content';

const SECTION_IDS = [
  'hero',
  'about',
  'experience',
  'projects',
  'recommendations',
  'contact',
];

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowScroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress(windowScroll / windowHeight || 0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen text-neo-ink">
      <NavBar
        name={content.profile.name}
        scrollProgress={scrollProgress}
        activeSection={activeSection}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-24 sm:pt-32 pb-20 sm:pb-24 space-y-16 sm:space-y-24 lg:space-y-28">
        <section id="hero" className="scroll-mt-24 sm:scroll-mt-28">
          <Hero profile={content.profile} />
        </section>
        <section id="about" className="scroll-mt-24 sm:scroll-mt-28">
          <About about={content.about} />
        </section>
        <section id="experience" className="scroll-mt-24 sm:scroll-mt-28">
          <Experience experiences={content.experiences} />
        </section>
        <section id="projects" className="scroll-mt-24 sm:scroll-mt-28">
          <Projects projects={content.projects} />
        </section>
        <section id="recommendations" className="scroll-mt-24 sm:scroll-mt-28">
          <Recommendations recommendations={content.recommendations} />
        </section>
        <section id="contact" className="scroll-mt-24 sm:scroll-mt-28">
          <Contact contact={content.contact} />
        </section>
      </main>

      <footer className="no-print border-t-4 border-black bg-neo-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-bold uppercase tracking-widest text-sm">
            © {new Date().getFullYear()} {content.profile.name}. All rights
            reserved.
          </p>
          <p className="font-bold uppercase tracking-widest text-xs">
            Built with React + TanStack · Hand-stamped pixels
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
