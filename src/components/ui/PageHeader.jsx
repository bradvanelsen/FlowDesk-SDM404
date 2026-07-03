import { cn } from '../../lib/utils';

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4 mb-6', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
