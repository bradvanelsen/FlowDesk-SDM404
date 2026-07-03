import { cn } from '../lib/utils';

// FlowDesk wordmark: teal dot + "FlowDesk". `prototype` shows a small pill
// so screenshots clearly read as a prototype, not a live system.
export default function Logo({ size = 'md', prototype = false, className }) {
  const text = size === 'lg' ? 'text-2xl' : 'text-lg';
  const dot = size === 'lg' ? 'h-7 w-7' : 'h-6 w-6';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className={cn('relative inline-flex items-center justify-center rounded-lg bg-teal-brand shrink-0', dot)}>
        <span className="h-2 w-2 rounded-full bg-teal-light" />
        <span className="absolute h-[5px] w-[5px] rounded-full bg-teal-brand" />
      </span>
      <span className={cn('font-semibold tracking-tight text-slate-900', text)}>
        Flow<span className="text-teal-brand">Desk</span>
      </span>
      {prototype && (
        <span className="ml-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200">
          Prototype
        </span>
      )}
    </div>
  );
}
