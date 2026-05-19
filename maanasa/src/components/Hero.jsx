import { Download, ArrowDown, Star, MapPin } from 'lucide-react';

function Hero({ profile }) {
  return (
    <div className="relative">
      {/* Decorative floating stickers */}
      <div
        aria-hidden
        className="hidden sm:block absolute -top-6 right-8 h-16 w-16 border-4 border-black bg-neo-mint shadow-[6px_6px_0_0_#000] rotate-12 z-10"
      />
      <div
        aria-hidden
        className="hidden sm:block absolute top-24 -left-4 h-10 w-10 rounded-full border-4 border-black bg-neo-accent shadow-[4px_4px_0_0_#000] animate-wiggle z-10"
      />

      <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000] sm:shadow-[12px_12px_0_0_#000] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: text */}
        <div className="relative p-6 sm:p-10 lg:p-16 grid-bg">
          {profile.location && (
            <span className="inline-flex items-center gap-2 border-4 border-black bg-neo-secondary px-3 py-1.5 font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0_0_#000] -rotate-2">
              <MapPin className="h-4 w-4 stroke-[3px]" />
              {profile.location}
            </span>
          )}

          <h1 className="mt-5 sm:mt-6 font-display uppercase leading-[0.9] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block">{profile.name.split(' ')[0]}</span>
            <span className="block text-white [-webkit-text-stroke:2px_#000]">
              {profile.name.split(' ').slice(1).join(' ')}
            </span>
          </h1>

          <div className="mt-5 sm:mt-6 inline-block border-4 border-black bg-neo-accent px-3 sm:px-4 py-1.5 sm:py-2 shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000] rotate-[-1deg]">
            <h2 className="font-display uppercase text-white text-xl sm:text-2xl lg:text-3xl tracking-tight">
              {profile.title}
            </h2>
          </div>

          <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg lg:text-xl leading-snug font-medium">
            {profile.summary}
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 no-print">
            <a
              href={profile.resumeUrl}
              download="MaanasaNarayan_Resume.pdf"
              aria-label="Download Resume as PDF"
              className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-5 sm:px-6 border-4 border-black bg-neo-accent text-white font-bold uppercase tracking-widest text-xs sm:text-sm shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-0.5 active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all duration-100"
            >
              <Download className="h-5 w-5 stroke-[3px]" />
              Download Resume
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('contact')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-5 sm:px-6 border-4 border-black bg-white font-bold uppercase tracking-widest text-xs sm:text-sm shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000] hover:bg-neo-secondary hover:-translate-y-0.5 active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all duration-100"
            >
              Say hello
              <ArrowDown className="h-5 w-5 stroke-[3px]" />
            </a>
          </div>
        </div>

        {/* Right: avatar collage */}
        <div className="relative border-t-4 lg:border-t-0 lg:border-l-4 border-black bg-neo-muted halftone-bg p-8 sm:p-10 lg:p-12 grid place-items-center min-h-[300px] sm:min-h-[360px]">
          <Star
            aria-hidden
            className="absolute top-4 right-4 sm:top-6 sm:right-6 h-10 w-10 sm:h-12 sm:w-12 fill-black text-black animate-spin-slow"
            strokeWidth={2}
          />
          <div className="absolute -bottom-3 -left-3 border-4 border-black bg-neo-secondary px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] sm:text-xs shadow-[4px_4px_0_0_#000] rotate-3">
            Hi! I&rsquo;m Maanasa 👋
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 translate-x-3 translate-y-3 bg-black"
              aria-hidden
            />
            <img
              src={profile.avatar}
              alt={`Portrait of ${profile.name}, Software Engineer`}
              width="288"
              height="288"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative h-48 w-48 sm:h-64 sm:w-64 lg:h-72 lg:w-72 object-cover border-4 border-black bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
