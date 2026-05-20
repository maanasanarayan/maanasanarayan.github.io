import { useEffect, useState } from 'react';
import { Menu, X, Star } from 'lucide-react';

const HOME_LINKS = [
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'experience', label: 'Experience', href: '/#experience' },
  { id: 'projects', label: 'Projects', href: '/#projects' },
  { id: 'recommendations', label: 'Recs', href: '/#recommendations' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'lifestyle', label: 'Lifestyle', href: '/lifestyle' },
];

const SECTION_IDS = [
  'hero',
  'about',
  'experience',
  'projects',
  'recommendations',
  'contact',
];

function NavBar({ name, isHome = false }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    window.addEventListener('scroll', handleScroll, { passive: true });

    let observer;
    if (isHome) {
      observer = new IntersectionObserver(
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
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, [isHome]);

  const handleClick = (e, link) => {
    if (isHome && link.href.startsWith('/#')) {
      e.preventDefault();
      const id = link.href.slice(2);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `#${id}`);
    }
    setIsMobileMenuOpen(false);
  };

  const isLinkActive = (link) => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    if (link.href === '/blog') return path.startsWith('/blog');
    if (link.href === '/lifestyle') return path.startsWith('/lifestyle');
    if (isHome && link.href.startsWith('/#')) {
      return activeSection === link.id;
    }
    return false;
  };

  return (
    <header className="no-print fixed top-0 right-0 left-0 z-50">
      <div className="bg-neo-bg border-b-4 border-black">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-10">
          <a
            href="/"
            aria-label="Home"
            className="group inline-flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <span className="bg-neo-accent grid h-10 w-10 shrink-0 -rotate-3 place-items-center border-4 border-black shadow-[3px_3px_0_0_#000] transition-transform duration-200 group-hover:rotate-3 sm:h-12 sm:w-12 sm:shadow-[4px_4px_0_0_#000]">
              <Star className="h-5 w-5 fill-black stroke-[3px] text-black sm:h-6 sm:w-6" />
            </span>
            <span className="font-display truncate text-base tracking-tight uppercase sm:text-xl">
              {name}
            </span>
          </a>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {HOME_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleClick(e, link)}
                  className={[
                    'border-2 px-3 py-2 text-sm font-bold tracking-widest uppercase',
                    'transition-all duration-150',
                    active
                      ? 'text-neo-bg border-black bg-black shadow-[4px_4px_0_0_#FFD93D]'
                      : 'hover:bg-neo-secondary border-transparent hover:border-black hover:shadow-[3px_3px_0_0_#000]',
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
              className="bg-neo-secondary hidden h-12 items-center gap-2 border-4 border-black px-4 text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none sm:inline-flex"
            >
              Resume ↓
            </a>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center border-4 border-black bg-white shadow-[3px_3px_0_0_#000] transition-all duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none sm:h-12 sm:w-12 sm:shadow-[4px_4px_0_0_#000] md:hidden"
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

        <div className="h-2 border-t-2 border-black bg-black/10">
          <div
            className="bg-neo-accent h-full origin-left"
            style={{ transform: `scaleX(${scrollProgress})` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="bg-neo-muted border-b-4 border-black shadow-[0_8px_0_0_#000] md:hidden">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4">
            {HOME_LINKS.map((link, i) => {
              const active = isLinkActive(link);
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleClick(e, link)}
                  className={[
                    'block border-4 border-black bg-white px-4 py-3 text-sm font-bold tracking-widest uppercase',
                    'shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none',
                    'transition-all duration-100',
                    i % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.5deg]',
                    active ? 'bg-neo-accent' : '',
                  ].join(' ')}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href="/documents/MaanasaNarayan.pdf"
              download="MaanasaNarayan_Resume.pdf"
              className="bg-neo-secondary block border-4 border-black px-4 py-3 text-center text-sm font-bold tracking-widest uppercase shadow-[4px_4px_0_0_#000] transition-all duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none"
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
