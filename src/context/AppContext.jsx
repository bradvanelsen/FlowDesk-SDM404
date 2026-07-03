import { createContext, useContext, useMemo, useState } from 'react';
import { getNotifications, getUserById } from '../data/mock';

const AppContext = createContext(null);

// Representative signed-in user for each role, so screens can show a real
// name/avatar and the role switcher can flip the whole experience.
export const ROLES = ['System Admin', 'Tenant Admin', 'Staff', 'Reviewer'];

const ROLE_USER = {
  'System Admin': 'u-101', // Marcus Webb
  'Tenant Admin': 'u-102', // Priya Nair
  Staff: 'u-103',          // Liam O'Connor
  Reviewer: 'u-106',       // Hannah Fitzgerald
};

export function AppProvider({ children }) {
  const [role, setRole] = useState('Tenant Admin');
  const [notifications, setNotifications] = useState(() => getNotifications());

  const currentUser = useMemo(() => getUserById(ROLE_USER[role]), [role]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const value = {
    role,
    setRole,
    currentUser,
    notifications,
    unreadCount,
    markAllRead,
    markRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
