import { MapPin, Calendar, Briefcase } from 'lucide-react';

const ALT_COLORS = [
  'bg-neo-secondary',
  'bg-neo-muted',
  'bg-neo-mint',
  'bg-neo-accent',
  'bg-neo-sky',
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

function Experience({ experiences }) {
  return (
    <div>
      <SectionHeader
        kicker="02 · Where I’ve shipped"
        title="Work Experience."
      />

      <ol className="space-y-8">
        {experiences.map((exp, idx) => (
          <li
            key={`${exp.company}-${idx}`}
            className="border-4 border-black bg-white shadow-[10px_10px_0_0_#000] hover:-translate-y-1 hover:shadow-[14px_14px_0_0_#000] transition-all duration-200"
          >
            <div
              className={`border-b-4 border-black ${ALT_COLORS[idx % ALT_COLORS.length]} px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-4">
                <span className="grid place-items-center h-14 w-14 border-4 border-black bg-white shrink-0 shadow-[3px_3px_0_0_#000]">
                  <img
                    src={exp.logo}
                    alt={`${exp.company} logo`}
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 object-contain"
                  />
                </span>
                <div>
                  <h3 className="font-display uppercase text-xl sm:text-2xl tracking-tight">
                    {exp.role}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm font-bold uppercase tracking-widest">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 stroke-[3px]" />
                      {exp.company}
                    </span>
                    <span aria-hidden>•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 stroke-[3px]" />
                      {exp.location}
                    </span>
                  </div>
                </div>
              </div>

              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 font-bold uppercase tracking-widest text-[11px] shadow-[3px_3px_0_0_#000]">
                <Calendar className="h-3.5 w-3.5 stroke-[3px]" />
                {exp.period}
              </span>
            </div>

            <ul className="p-5 sm:p-6 space-y-3 list-none">
              {exp.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 leading-snug">
                  <span
                    aria-hidden
                    className="mt-2 h-3 w-3 border-2 border-black bg-neo-accent shrink-0"
                  />
                  <span className="text-base sm:text-lg font-medium">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Experience;
