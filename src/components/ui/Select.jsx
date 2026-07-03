import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FieldLabel } from './Input';

export default function Select({ label, hint, id, children, className, size = 'md', ...props }) {
  const h = size === 'sm' ? 'h-8 text-[13px]' : 'h-10 text-sm';
  return (
    <div className="w-full">
      <FieldLabel htmlFor={id} hint={hint}>{label}</FieldLabel>
      <div className="relative">
        <select
          id={id}
          className={cn(
            'w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-9 text-slate-900',
            'shadow-sm transition-colors cursor-pointer',
            'focus:outline-none focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/25',
            h,
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}
