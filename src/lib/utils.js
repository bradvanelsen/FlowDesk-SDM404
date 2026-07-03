// Small shared helpers used across the prototype.

// Deterministic "now" so relative timestamps are stable for screenshots.
export const NOW = new Date('2026-06-29T10:30:00');

export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${formatDate(value)}, ${h}:${m} ${ampm}`;
}

// Relative to the fixed NOW above, so timestamps stay stable for screenshots.
export function formatRelative(value) {
  if (!value) return '';
  const then = new Date(value);
  const diffMs = NOW - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return formatDate(value);
}
