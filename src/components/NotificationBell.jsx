import { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRelative } from '../lib/utils';
import { useNow } from '../lib/useNow';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead, refreshNotifications } = useApp();
  const now = useNow(); // D-23: relative times tick while the dropdown is mounted
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Re-pull on open so the dropdown reflects transitions since page load.
  useEffect(() => {
    if (open) refreshNotifications();
  }, [open, refreshNotifications]);

  const latest = notifications.slice(0, 5);

  async function onMarkAll() {
    const marked = await markAllRead();
    if (marked !== null) {
      setConfirmation(`${marked} marked as read`);
      setTimeout(() => setConfirmation(''), 4000);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-brand px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-teal-light px-1.5 py-0.5 text-[10px] font-semibold text-teal-dark">
                  {unreadCount} new
                </span>
              )}
            </div>
            {confirmation ? (
              <span className="text-xs font-medium text-green-700">{confirmation}</span>
            ) : (
              <button
                onClick={onMarkAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-brand hover:text-teal-dark cursor-pointer"
              >
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {latest.length === 0 && (
              <li className="px-4 py-6 text-center text-[13px] text-slate-400">
                No notifications yet.
              </li>
            )}
            {latest.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                    navigate(`/incidents/${n.incidentId}`);
                  }}
                  className="flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                >
                  <span className="mt-1.5 shrink-0">
                    <span
                      className={`block h-2 w-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-teal-brand'}`}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-[13px] leading-snug ${n.read ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
                      {n.message}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {formatRelative(n.createdAt, now)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
            className="block w-full border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-center text-xs font-medium text-teal-brand hover:bg-slate-50 cursor-pointer"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
