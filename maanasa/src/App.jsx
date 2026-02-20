import { useEffect, useState } from 'react';
import './index.css';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Recommendations from './components/Recommendations';
import Contact from './components/Contact';
import content from './data/content';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return 'light'; // Default to light mode heavily per user request
    }
    return 'light';
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(windowScroll / windowHeight || 0);
    };

    const sectionIds = ['hero', 'about', 'experience', 'projects', 'recommendations', 'contact'];

    // Observer for active nav links
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  return (
    <div className="app-wrapper">
      <NavBar
        name={content.profile.name}
        toggleTheme={toggleTheme}
        theme={theme}
        scrollProgress={scrollProgress}
        activeSection={activeSection}
      />

      <main className="container section-container">
        <section id="hero"><Hero profile={content.profile} /></section>
        <section id="about"><About about={content.about} /></section>
        <section id="experience"><Experience experiences={content.experiences} /></section>
        <section id="projects"><Projects projects={content.projects} /></section>
        <section id="recommendations"><Recommendations recommendations={content.recommendations} /></section>
        <section id="contact"><Contact contact={content.contact} /></section>
      </main>

      <footer className="footer container no-print">
        <p>© {new Date().getFullYear()} {content.profile.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
