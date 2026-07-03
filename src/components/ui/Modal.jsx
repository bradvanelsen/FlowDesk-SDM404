import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Lightweight, visual-only modal. Renders nothing when closed.
export default function Modal({ open, onClose, title, subtitle, children, footer, className }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200',
          'animate-[fadeIn_120ms_ease-out]',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-200 bg-slate-50/60 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
