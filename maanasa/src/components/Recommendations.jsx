import { Quote, Star } from 'lucide-react';

const CARD_BG = [
  'bg-neo-secondary',
  'bg-neo-muted',
  'bg-neo-mint',
  'bg-neo-sky',
  'bg-neo-accent',
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

function RecCard({ rec, idx }) {
  return (
    <div
      className={[
        'shrink-0 w-[320px] sm:w-[380px] border-4 border-black shadow-[8px_8px_0_0_#000]',
        'flex flex-col',
        CARD_BG[idx % CARD_BG.length],
        idx % 2 === 0 ? 'rotate-[-0.6deg]' : 'rotate-[0.6deg]',
      ].join(' ')}
    >
      <div className="px-5 py-3 border-b-4 border-black bg-white flex items-center gap-2">
        <Quote className="h-5 w-5 stroke-[3px]" />
        <div className="flex items-center gap-0.5 ml-auto" aria-hidden>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-black text-black"
              strokeWidth={0}
            />
          ))}
        </div>
      </div>
      <blockquote className="px-5 pt-5 pb-4 flex-1 text-lg leading-snug font-medium">
        “{rec.quote}”
      </blockquote>
      <div className="px-5 pb-5 flex items-center gap-3">
        <span className="grid place-items-center h-11 w-11 border-2 border-black bg-white shrink-0">
          <img
            src={rec.logo}
            alt={`${rec.name} company logo`}
            width="28"
            height="28"
            loading="lazy"
            decoding="async"
            className="h-7 w-7 object-contain"
          />
        </span>
        <div>
          <div className="font-display uppercase tracking-tight text-base">
            {rec.name}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest">
            {rec.role}
          </div>
        </div>
      </div>
    </div>
  );
}

function Recommendations({ recommendations }) {
  return (
    <div>
      <SectionHeader kicker="04 · Kind words" title="Recommendations." />

      {/* Print-friendly stack */}
      <div className="hidden print:grid grid-cols-1 gap-4">
        {recommendations.map((rec, i) => (
          <RecCard key={i} rec={rec} idx={i} />
        ))}
      </div>

      {/* Interactive marquee */}
      <div className="no-print relative border-4 border-black bg-white shadow-[10px_10px_0_0_#000] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
          aria-hidden
        />

        <div
          className="flex gap-6 py-8 px-6 w-max animate-marquee"
          style={{ animationDuration: '40s' }}
        >
          {[...recommendations, ...recommendations].map((rec, i) => (
            <RecCard key={i} rec={rec} idx={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
