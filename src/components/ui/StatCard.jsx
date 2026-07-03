import { cn } from '../../lib/utils';

// KPI tile: big number + label + small icon, with an optional accent colour.
export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'teal',
  hint,
  className,
}) {
  const accents = {
    teal: 'bg-teal-light text-teal-brand',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm p-5',
        'flex items-start justify-between gap-3',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <p className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      {Icon && (
        <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg shrink-0', accents[accent])}>
          <Icon size={20} strokeWidth={2} />
        </span>
      )}
    </div>
  );
}
