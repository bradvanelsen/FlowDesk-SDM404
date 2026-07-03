import { cn } from '../../lib/utils';

// Single source of truth for the severity + status colour mapping.
// Used everywhere so the palette is identical across all screens.
export const SEVERITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Critical: 'bg-red-50 text-red-700 ring-red-200',
};

export const STATUS_STYLES = {
  Open: 'bg-blue-50 text-blue-700 ring-blue-200',
  'In Review': 'bg-amber-50 text-amber-700 ring-amber-200',
  Closed: 'bg-green-50 text-green-700 ring-green-200',
};

// Dot colours that pair with the badges (for legends / timelines).
export const SEVERITY_DOT = {
  Low: '#94A3B8',
  Medium: '#D97706',
  High: '#EA580C',
  Critical: '#DC2626',
};

export const STATUS_DOT = {
  Open: '#2563EB',
  'In Review': '#D97706',
  Closed: '#16A34A',
};

const TONES = {
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  teal: 'bg-teal-light text-teal-dark ring-teal-mid',
};

export default function Badge({
  children,
  severity,
  status,
  tone = 'neutral',
  dot = false,
  className,
}) {
  const styles = severity
    ? SEVERITY_STYLES[severity]
    : status
    ? STATUS_STYLES[status]
    : TONES[tone];

  const dotColor = severity ? SEVERITY_DOT[severity] : status ? STATUS_DOT[status] : null;
  const label = children ?? severity ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        styles,
        className,
      )}
    >
      {dot && dotColor && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {label}
    </span>
  );
}
