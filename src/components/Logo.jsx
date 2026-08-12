import { cn } from '../lib/utils';

// FlowDesk wordmark: teal dot + "FlowDesk".
export default function Logo({ size = 'md', className }) {
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
    </div>
  );
}
