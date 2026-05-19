import { useState } from 'react';
import { Menu, X, Star } from 'lucide-react';

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'recommendations', label: 'Recs' },
  { id: 'contact', label: 'Contact' },
];

function NavBar({ name, scrollProgress, activeSection }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="no-print fixed top-0 left-0 right-0 z-50">
      <div className="border-b-4 border-black bg-neo-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          <a
            href="#hero"
            onClick={(e) => handleScroll(e, 'hero')}
            aria-label="Home"
            className="group inline-flex items-center gap-2 sm:gap-3 min-w-0"
          >
            <span className="grid place-items-center h-10 w-10 sm:h-12 sm:w-12 border-4 border-black bg-neo-accent shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] -rotate-3 group-hover:rotate-3 transition-transform duration-200 shrink-0">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3px] fill-black text-black" />
            </span>
            <span className="font-display text-base sm:text-xl tracking-tight uppercase truncate">
              {name}
            </span>
          </a>

          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleScroll(e, link.id)}
                  className={[
                    'px-3 py-2 font-bold uppercase tracking-widest text-sm border-2',
                    'transition-all duration-150',
                    isActive
                      ? 'bg-black text-neo-bg border-black shadow-[4px_4px_0_0_#FFD93D]'
                      : 'border-transparent hover:border-black hover:bg-neo-secondary hover:shadow-[3px_3px_0_0_#000]',
                  ].join(' ')}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/documents/MaanasaNarayan.pdf"
              download="MaanasaNarayan_Resume.pdf"
              className="hidden sm:inline-flex items-center gap-2 h-12 px-4 border-4 border-black bg-neo-secondary font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-100"
            >
              Resume ↓
            </a>

            <button
              type="button"
              className="md:hidden h-10 w-10 sm:h-12 sm:w-12 grid place-items-center border-4 border-black bg-white shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-100"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 stroke-[3px]" />
              ) : (
                <Menu className="h-6 w-6 stroke-[3px]" />
              )}
            </button>
          </div>
        </div>

        {/* scroll progress bar – hard, no gradient */}
        <div className="h-2 bg-black/10 border-t-2 border-black">
          <div
            className="h-full bg-neo-accent origin-left"
            style={{ transform: `scaleX(${scrollProgress})` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b-4 border-black bg-neo-muted shadow-[0_8px_0_0_#000]">
          <div className="mx-auto max-w-7xl px-4 py-4 grid gap-2">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleScroll(e, link.id)}
                className={[
                  'block px-4 py-3 border-4 border-black bg-white font-bold uppercase tracking-widest text-sm',
                  'shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none',
                  'transition-all duration-100',
                  i % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.5deg]',
                  activeSection === link.id ? 'bg-neo-accent' : '',
                ].join(' ')}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/documents/MaanasaNarayan.pdf"
              download="MaanasaNarayan_Resume.pdf"
              className="block px-4 py-3 border-4 border-black bg-neo-secondary font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-100 text-center"
            >
              Download Resume ↓
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
