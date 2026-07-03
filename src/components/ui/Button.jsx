import { cn } from '../../lib/utils';

const VARIANTS = {
  primary:
    'bg-teal-brand text-white border border-transparent shadow-sm hover:bg-teal-dark active:bg-teal-dark',
  secondary:
    'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-slate-400',
  ghost:
    'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-white text-red-600 border border-slate-300 shadow-sm hover:bg-red-50 hover:border-red-300',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap',
        'transition-colors duration-150 cursor-pointer select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-brand/40 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 15 : 16} strokeWidth={2} className="shrink-0" />}
      {children}
      {IconRight && <IconRight size={size === 'sm' ? 15 : 16} strokeWidth={2} className="shrink-0" />}
    </button>
  );
}
