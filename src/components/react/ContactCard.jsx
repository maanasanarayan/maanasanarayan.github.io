import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Phone, Copy, CheckCircle2 } from 'lucide-react';

function Linkedin({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Github({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function Toast({ message, isVisible }) {
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={[
        'no-print fixed bottom-6 left-1/2 z-[100] -translate-x-1/2',
        'bg-neo-secondary border-4 border-black px-5 py-3',
        'text-sm font-bold tracking-widest uppercase shadow-[6px_6px_0_0_#000]',
        'inline-flex items-center gap-2 transition-all duration-200',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
      ].join(' ')}
    >
      <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
      {message || ' '}
    </div>,
    document.body,
  );
}

function Tile({ as: Tag = 'a', tone, icon, label, value, copyHint, ...rest }) {
  const tones = {
    accent: {
      bg: 'bg-neo-accent',
      text: 'text-white',
      iconBg: 'bg-black',
      iconBorder: 'border-neo-bg',
      labelOpacity: 'opacity-90',
    },
    secondary: {
      bg: 'bg-neo-secondary',
      text: 'text-black',
      iconBg: 'bg-white',
      iconBorder: 'border-black',
      labelOpacity: 'opacity-80',
    },
    muted: {
      bg: 'bg-neo-muted',
      text: 'text-black',
      iconBg: 'bg-white',
      iconBorder: 'border-black',
      labelOpacity: 'opacity-80',
    },
    mint: {
      bg: 'bg-neo-mint',
      text: 'text-black',
      iconBg: 'bg-white',
      iconBorder: 'border-black',
      labelOpacity: 'opacity-80',
    },
  };
  const t = tones[tone];
  return (
    <Tag
      {...rest}
      className={[
        'group border-neo-bg flex min-w-0 items-center gap-4 border-4 p-4 text-left sm:p-5',
        'shadow-[6px_6px_0_0_#fff] transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#fff]',
        'active:translate-x-1.5 active:translate-y-1.5 active:shadow-none',
        t.bg,
        t.text,
      ].join(' ')}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center border-2 ${t.iconBorder} ${t.iconBg}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[11px] font-bold tracking-widest uppercase ${t.labelOpacity}`}
        >
          {label}
        </span>
        <span className="font-display block overflow-hidden text-base tracking-tight text-ellipsis whitespace-nowrap uppercase sm:text-lg">
          {value}
        </span>
      </span>
      {copyHint && (
        <Copy className="h-4 w-4 shrink-0 stroke-[3px] opacity-70 group-hover:opacity-100" />
      )}
    </Tag>
  );
}

function maskPhone(p) {
  // Keep country code and the last 4 digits visible; mask the rest with •.
  // Example: "REDACTED" -> "+1 (•••) •••-8729"
  return p.replace(/\d/g, (d, i, s) => {
    const total = (s.match(/\d/g) || []).length;
    const seenSoFar = s.slice(0, i).match(/\d/g)?.length ?? 0;
    return seenSoFar < 1 || seenSoFar >= total - 4 ? d : '•';
  });
}

export default function ContactCard({ contact }) {
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setMsg('Email copied!');
    } catch {
      setMsg('Failed to copy email');
    }
    setOpen(true);
    setTimeout(() => setOpen(false), 2500);
  };

  const handlePhoneCopy = async (e) => {
    const isCoarse =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) return;
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(contact.phone);
      setMsg('Phone copied!');
    } catch {
      setMsg('Failed to copy phone');
    }
    setOpen(true);
    setTimeout(() => setOpen(false), 2500);
  };

  return (
    <>
      <div className="text-neo-bg relative overflow-hidden border-4 border-black bg-black p-8 shadow-[12px_12px_0_0_#FFD93D] sm:p-10 lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(#FFD93D 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-12">
          <div>
            <p className="max-w-md text-base leading-snug font-medium sm:text-lg">
              Let&apos;s talk &mdash; projects, technical challenges, or just a
              hello.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <Tile
              as="button"
              type="button"
              onClick={handleCopy}
              aria-label={`Copy email address ${contact.email}`}
              tone="accent"
              icon={<Mail className="h-5 w-5 stroke-[3px] text-white" />}
              label="Email · click to copy"
              value={contact.email}
              copyHint
              className="no-print"
            />
            <Tile
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              tone="secondary"
              icon={<Linkedin className="h-5 w-5 stroke-[3px]" />}
              label="Network"
              value="LinkedIn"
            />
            <Tile
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              tone="muted"
              icon={<Github className="h-5 w-5 stroke-[3px]" />}
              label="Code"
              value="GitHub"
            />
            <Tile
              href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
              onClick={handlePhoneCopy}
              tone="mint"
              icon={<Phone className="h-5 w-5 stroke-[3px]" />}
              label="Phone · click to copy"
              value={maskPhone(contact.phone)}
            />
          </div>
        </div>
      </div>
      <Toast message={msg} isVisible={open} />
    </>
  );
}
