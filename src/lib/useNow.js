import { useEffect, useState } from 'react';

// Ticking clock for relative timestamps (D-23): re-renders the consumer every
// `intervalMs` so "2 mins ago" advances to "3 mins ago" without a reload.
// Call once per screen and pass the value into formatRelative(value, now) —
// one interval per screen, not one per row.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
