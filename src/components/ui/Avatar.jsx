import { cn, initials } from '../../lib/utils';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
};

// Deterministic subtle tint per person so avatars aren't all identical,
// while staying within the teal/neutral brand family.
const TINTS = [
  'bg-teal-light text-teal-dark',
  'bg-teal-brand text-white',
  'bg-slate-200 text-slate-700',
  'bg-teal-dark text-white',
];

function tintFor(name = '') {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return TINTS[sum % TINTS.length];
}

export default function Avatar({ name = '', size = 'md', className }) {
  return (
    <span
      title={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold shrink-0 select-none',
        SIZES[size],
        tintFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
