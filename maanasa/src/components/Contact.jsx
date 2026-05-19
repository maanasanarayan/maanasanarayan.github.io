import { useState } from 'react';
import { Mail, Phone, Copy } from 'lucide-react';
import Toast from './Toast';

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

function ContactTile({ as: Tag = 'a', tone, icon, label, value, ...rest }) {
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
        'group flex items-center gap-4 border-4 border-neo-bg p-4 sm:p-5',
        'shadow-[6px_6px_0_0_#fff] hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#fff]',
        'active:translate-x-1.5 active:translate-y-1.5 active:shadow-none',
        'transition-all duration-100 text-left min-w-0',
        t.bg,
        t.text,
      ].join(' ')}
    >
      <span
        className={`grid place-items-center h-12 w-12 border-2 ${t.iconBorder} ${t.iconBg} shrink-0`}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className={`block font-bold uppercase tracking-widest text-[11px] ${t.labelOpacity}`}
        >
          {label}
        </span>
        <span className="block font-display uppercase tracking-tight text-base sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </span>
      </span>
      {rest['data-copy'] && (
        <Copy className="h-4 w-4 stroke-[3px] opacity-70 group-hover:opacity-100 shrink-0" />
      )}
    </Tag>
  );
}

function Contact({ contact }) {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setToastMessage('Email copied!');
    } catch {
      setToastMessage('Failed to copy email');
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <div>
      <SectionHeader kicker="05 · Say hello" title="Contact." />

      <div className="border-4 border-black bg-black text-neo-bg shadow-[12px_12px_0_0_#FFD93D] p-8 sm:p-10 lg:p-12 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#FFD93D 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-base sm:text-lg leading-snug font-medium max-w-md">
              Let&apos;s talk &mdash; projects, technical challenges, or just a
              hello.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <ContactTile
              as="button"
              type="button"
              onClick={handleCopyEmail}
              aria-label={`Copy email address ${contact.email}`}
              tone="accent"
              icon={<Mail className="h-5 w-5 stroke-[3px] text-white" />}
              label="Email · click to copy"
              value={contact.email}
              data-copy="true"
              className="no-print"
            />

            <ContactTile
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              tone="secondary"
              icon={<Linkedin className="h-5 w-5 stroke-[3px]" />}
              label="Network"
              value="LinkedIn"
            />

            <ContactTile
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              tone="muted"
              icon={<Github className="h-5 w-5 stroke-[3px]" />}
              label="Code"
              value="GitHub"
            />

            <ContactTile
              href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
              tone="mint"
              icon={<Phone className="h-5 w-5 stroke-[3px]" />}
              label="Phone"
              value={contact.phone}
            />
          </div>
        </div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} />
    </div>
  );
}

export default Contact;
