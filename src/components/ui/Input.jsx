import { cn } from '../../lib/utils';

const fieldBase =
  'w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 ' +
  'shadow-sm transition-colors focus:outline-none focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/25';

export function FieldLabel({ htmlFor, children, hint }) {
  if (!children) return null;
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-slate-700">
      {children}
      {hint && <span className="font-normal text-slate-400">· {hint}</span>}
    </label>
  );
}

export default function Input({ label, hint, id, leftIcon: LeftIcon, className, ...props }) {
  return (
    <div className="w-full">
      <FieldLabel htmlFor={id} hint={hint}>{label}</FieldLabel>
      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          id={id}
          className={cn(fieldBase, 'h-10 text-sm px-3', LeftIcon && 'pl-9', className)}
          {...props}
        />
      </div>
    </div>
  );
}
