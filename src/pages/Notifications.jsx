import { Link } from 'react-router-dom';
import { Check, BellRing, Bell } from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatRelative, formatDateTime, cn } from '../lib/utils';

function NotificationRow({ n, onRead }) {
  return (
    <Link
      to={`/incidents/${n.incidentRef}`}
      onClick={() => onRead(n.id)}
      className={cn(
        'flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-slate-50',
        !n.read && 'bg-teal-light/30',
      )}
    >
      <span className="mt-1.5 shrink-0">
        <span className={cn('block h-2.5 w-2.5 rounded-full', n.read ? 'bg-slate-200' : 'bg-teal-brand')} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm leading-snug', n.read ? 'text-slate-500' : 'font-medium text-slate-800')}>
          {n.message}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Badge tone="teal" className="scale-90 origin-left">{n.incidentRef}</Badge>
          <span title={formatDateTime(n.createdAt)}>{formatRelative(n.createdAt)}</span>
        </div>
      </div>
      {!n.read && (
        <span className="mt-1 shrink-0 rounded-full bg-teal-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-dark">
          New
        </span>
      )}
    </Link>
  );
}

function Group({ title, icon: Icon, items, onRead, empty }) {
  return (
    <Card padded={false}>
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
        <Icon size={16} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={onRead} />
          ))}
        </div>
      )}
    </Card>
  );
}

export default function Notifications() {
  const { notifications, unreadCount, markAllRead, markRead } = useApp();
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}
        actions={
          <Button variant="secondary" icon={Check} onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        }
      />

      <div className="max-w-3xl space-y-6">
        <Group title="Unread" icon={BellRing} items={unread} onRead={markRead} empty="No unread notifications." />
        <Group title="Earlier" icon={Bell} items={read} onRead={markRead} empty="Nothing here yet." />
      </div>
    </>
  );
}
