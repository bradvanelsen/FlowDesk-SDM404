import { cn } from '../../lib/utils';

export function Table({ children, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-teal-light/70">
      {children}
    </thead>
  );
}

export function TH({ children, align = 'left', className }) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-teal-dark/80',
        'border-b border-teal-mid/60 whitespace-nowrap',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TR({ children, onClick, muted = false, className }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'even:bg-slate-50/50 transition-colors',
        onClick && 'cursor-pointer hover:bg-teal-light/40',
        muted && 'opacity-60',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TD({ children, align = 'left', className }) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-slate-700 align-middle',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  );
}
