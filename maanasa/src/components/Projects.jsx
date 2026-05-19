import { ArrowUpRight, Hammer } from 'lucide-react';

const PROJECT_BG = [
  'bg-neo-mint',
  'bg-neo-sky',
  'bg-neo-secondary',
  'bg-neo-muted',
];

function SectionHeader({ kicker, title }) {
  return (
    <div className="mb-10">
      <span className="inline-block border-4 border-black bg-black text-neo-bg px-3 py-1 font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0_0_#FFD93D]">
        {kicker}
      </span>
      <h2 className="mt-4 font-display uppercase leading-none tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
        {title}
      </h2>
    </div>
  );
}

function Projects({ projects }) {
  return (
    <div>
      <SectionHeader
        kicker="03 · Things I’ve built"
        title="Featured Projects."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((proj, idx) => (
          <article
            key={`${proj.title}-${idx}`}
            className={[
              'group relative border-4 border-black bg-white shadow-[10px_10px_0_0_#000]',
              'hover:-translate-y-1.5 hover:shadow-[14px_14px_0_0_#000] transition-all duration-200',
              idx % 2 === 0 ? 'md:rotate-[-0.4deg]' : 'md:rotate-[0.4deg]',
            ].join(' ')}
          >
            <div
              className={`relative border-b-4 border-black ${PROJECT_BG[idx % PROJECT_BG.length]} px-5 py-4`}
            >
              <span
                aria-hidden
                className="absolute -top-4 -right-4 grid place-items-center h-10 w-10 border-4 border-black bg-black text-neo-bg font-display text-base shadow-[3px_3px_0_0_#FFD93D] rotate-12"
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex items-start gap-3 pr-10">
                <Hammer className="h-5 w-5 mt-1 stroke-[3px] shrink-0" />
                <div>
                  <h3 className="font-display uppercase tracking-tight text-xl sm:text-2xl leading-tight">
                    {proj.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                    <span>{proj.org}</span>
                    <span aria-hidden>•</span>
                    <span>{proj.period}</span>
                  </div>
                </div>
              </div>
            </div>

            <ul className="p-5 space-y-3">
              {proj.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 leading-snug">
                  <span
                    aria-hidden
                    className="mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-neo-accent shrink-0"
                  />
                  <span className="text-base font-medium">{bullet}</span>
                </li>
              ))}
            </ul>

            {proj.links && proj.links.length > 0 && (
              <div className="px-5 pb-5 flex flex-wrap gap-2 no-print">
                {proj.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border-[3px] border-black bg-white px-3 py-1.5 font-bold uppercase tracking-widest text-[11px] shadow-[3px_3px_0_0_#000] hover:bg-neo-secondary hover:shadow-[5px_5px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-100"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[3px]" />
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default Projects;
