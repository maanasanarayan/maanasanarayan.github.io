import { createPortal } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';

function Toast({ message, isVisible }) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] no-print',
        'border-4 border-black bg-neo-secondary px-5 py-3',
        'font-bold uppercase tracking-widest text-sm shadow-[6px_6px_0_0_#000]',
        'inline-flex items-center gap-2 transition-all duration-200',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
      ].join(' ')}
    >
      <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
      {message || ' '}
    </div>,
    document.body,
  );
}

export default Toast;
