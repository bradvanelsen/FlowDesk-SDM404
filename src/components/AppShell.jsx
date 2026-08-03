import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users as UsersIcon, Settings, ClipboardList,
  Tags, Bell, PlusCircle, Inbox, ChevronsUpDown, Check, LogOut,
} from 'lucide-react';
import { useApp, ROLES } from '../context/AppContext';
import Logo from './Logo';
import Avatar from './ui/Avatar';
import NotificationBell from './NotificationBell';
import { cn } from '../lib/utils';

// Role-based navigation. The visible items change with the active role so the
// access model (UC-03 / UC-04) is obvious in screenshots. `match` controls the
// active-highlight independently of where each label routes.
const NAV = {
  'System Admin': [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
    { label: 'Tenants', to: '/tenants', icon: Building2, match: (p) => p.startsWith('/tenants') },
    { label: 'Users', to: '/users', icon: UsersIcon, match: (p) => p.startsWith('/users') },
    { label: 'Settings', to: '/settings', icon: Settings, match: (p) => p.startsWith('/settings') },
  ],
  'Tenant Admin': [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
    { label: 'Incidents', to: '/incidents', icon: ClipboardList, match: (p) => p === '/incidents' || /^\/incidents\/(?!new)/.test(p) },
    { label: 'Users', to: '/users', icon: UsersIcon, match: (p) => p.startsWith('/users') },
    { label: 'Categories', to: '/categories', icon: Tags, match: (p) => p.startsWith('/categories') },
    { label: 'Notifications', to: '/notifications', icon: Bell, match: (p) => p.startsWith('/notifications') },
  ],
  Staff: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
    { label: 'Submit Incident', to: '/incidents/new', icon: PlusCircle, match: (p) => p === '/incidents/new' },
    { label: 'My Incidents', to: '/incidents', icon: ClipboardList, match: (p) => p === '/incidents' || /^\/incidents\/(?!new)/.test(p) },
    { label: 'Notifications', to: '/notifications', icon: Bell, match: (p) => p.startsWith('/notifications') },
  ],
  Reviewer: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
    { label: 'Incident Queue', to: '/incidents', icon: Inbox, match: (p) => p === '/incidents' || /^\/incidents\/(?!new)/.test(p) },
    { label: 'Notifications', to: '/notifications', icon: Bell, match: (p) => p.startsWith('/notifications') },
  ],
};

function RoleSwitcher() {
  const { role, previewRole, setPreviewRole, isAuthenticated } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // When signed in, the real role from /me takes precedence. The switcher stays
  // visible (it's referenced in the A2 docs) but is locked to the real role.
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { if (!isAuthenticated) setOpen((o) => !o); }}
        disabled={isAuthenticated}
        title={
          isAuthenticated
            ? 'Your role comes from your signed-in account'
            : 'Switch role to preview access (demonstrates role-based access control)'
        }
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-9 text-[13px] font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-100 disabled:cursor-default disabled:hover:bg-white cursor-pointer"
      >
        <span className="text-slate-400">Viewing as</span>
        <span className="text-slate-900">{role}</span>
        {!isAuthenticated && <ChevronsUpDown size={14} className="text-slate-400" />}
      </button>
      {open && !isAuthenticated && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Preview role
          </p>
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => {
                setPreviewRole(r);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                r === previewRole ? 'bg-teal-light text-teal-dark font-medium' : 'text-slate-700 hover:bg-slate-50',
              )}
            >
              {r}
              {r === previewRole && <Check size={15} className="text-teal-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar() {
  const { role, tenant, signOut } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const items = NAV[role] ?? [];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-5 border-b border-slate-100">
        <Link to="/dashboard">
          <Logo prototype />
        </Link>
      </div>

      <div className="px-3 pt-4">
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-brand text-white">
            <Building2 size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-800">{tenant.name}</p>
            <p className="text-[11px] text-slate-400">{tenant.plan} plan</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Menu</p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-teal-light text-teal-brand'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <Icon size={18} className={active ? 'text-teal-brand' : 'text-slate-400 group-hover:text-slate-500'} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={async () => { await signOut(); navigate('/login'); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <LogOut size={18} className="text-slate-400" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  const { currentUser, role, meStatus } = useApp();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-6 backdrop-blur">
      <div className="text-sm text-slate-400">
        <span className="hidden sm:inline">Incident Management Workspace</span>
      </div>
      <div className="flex items-center gap-3">
        {meStatus === 'retrying' && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            Couldn&rsquo;t verify session — retrying…
          </span>
        )}
        <RoleSwitcher />
        <div className="h-6 w-px bg-slate-200" />
        <NotificationBell />
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2.5">
          <Avatar name={currentUser.name} size="sm" />
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-semibold leading-tight text-slate-800">{currentUser.name}</p>
            <p className="text-[11px] leading-tight text-slate-400">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppShell() {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="pl-60">
        <TopBar />
        <main className="mx-auto max-w-[1280px] px-6 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
