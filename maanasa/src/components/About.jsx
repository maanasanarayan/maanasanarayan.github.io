import { GraduationCap, Wrench } from 'lucide-react';

const CARD_COLORS = [
  'bg-neo-secondary',
  'bg-neo-muted',
  'bg-neo-mint',
  'bg-neo-accent',
  'bg-neo-sky',
  'bg-white',
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

function About({ about }) {
  const { skills, education } = about;
  const skillEntries = Object.entries(skills);

  return (
    <div>
      <SectionHeader kicker="01 · About me" title="About & Skills." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillEntries.map(([category, items], idx) => (
          <div
            key={category}
            className={[
              'group border-4 border-black p-6 shadow-[8px_8px_0_0_#000]',
              'hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#000] transition-all duration-200',
              CARD_COLORS[idx % CARD_COLORS.length],
              idx % 3 === 1
                ? 'rotate-[-0.4deg]'
                : idx % 3 === 2
                  ? 'rotate-[0.5deg]'
                  : '',
            ].join(' ')}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center h-9 w-9 border-2 border-black bg-white">
                <Wrench className="h-4 w-4 stroke-[3px]" />
              </span>
              <h3 className="font-display uppercase text-xl tracking-tight">
                {category}
              </h3>
            </div>
            <p className="text-base leading-snug font-medium">{items}</p>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid place-items-center h-12 w-12 border-4 border-black bg-neo-accent shadow-[4px_4px_0_0_#000]">
            <GraduationCap className="h-6 w-6 stroke-[3px] text-white" />
          </span>
          <h3 className="font-display uppercase text-3xl sm:text-4xl tracking-tight">
            Education
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {education.map((edu, idx) => (
            <div
              key={idx}
              className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#000] transition-all duration-200"
            >
              <div className="border-b-4 border-black bg-neo-secondary px-5 py-3 flex items-center justify-between gap-3">
                <span className="font-display uppercase tracking-tight text-lg sm:text-xl">
                  {edu.degree}
                </span>
                <span className="shrink-0 border-2 border-black bg-white px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  {edu.period}
                </span>
              </div>
              <div className="p-5">
                <p className="text-lg font-bold uppercase tracking-tight">
                  {edu.school}
                </p>
                <p className="text-sm font-medium opacity-80 mt-1">
                  {edu.extra}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
