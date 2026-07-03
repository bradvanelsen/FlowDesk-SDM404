import { cn } from '../../lib/utils';

export default function Card({ children, className, padded = true }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

// Optional header strip with a title + right-aligned actions slot.
export function CardHeader({ title, subtitle, actions, className }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-slate-900 truncate">{title}</h3>
        {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
