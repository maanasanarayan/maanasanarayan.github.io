import './App.css';
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
  return (
    <div>
      <NavBar name={content.profile.name} />
      <main>
        <Hero profile={content.profile} />
        <About about={content.about} />
        <Experience experiences={content.experiences} />
        <Projects projects={content.projects} />
        <Recommendations recommendations={content.recommendations} />
        <Contact contact={content.contact} resumeUrl={content.profile.resumeUrl} />
      </main>
      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} {content.profile.name}</div>
      </footer>
    </div>
  );
}

export default App;
