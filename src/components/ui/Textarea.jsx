import { cn } from '../../lib/utils';
import { FieldLabel } from './Input';

export default function Textarea({ label, hint, id, rows = 4, className, ...props }) {
  return (
    <div className="w-full">
      <FieldLabel htmlFor={id} hint={hint}>{label}</FieldLabel>
      <textarea
        id={id}
        rows={rows}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400 shadow-sm transition-colors resize-y',
          'focus:outline-none focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/25',
          className,
        )}
        {...props}
      />
    </div>
  );
}
