import {
  createContext, useContext, useMemo, useState, useEffect, useRef, useCallback,
} from 'react';
import { getNotifications, getUserById, getPrimaryTenant } from '../data/mock';
import { roleLabel } from '../lib/roles';
import { getSession, onAuthChange, signOut as authSignOut } from '../services/auth';
import { getMe } from '../services/api';

const AppContext = createContext(null);

// Roles offered by the "Viewing as" preview switcher (display labels).
export const ROLES = ['System Admin', 'Tenant Admin', 'Staff', 'Reviewer'];

// Representative mock user per role — used only as a demo fallback before a real
// session exists. Once authenticated, the real /me identity takes over.
const ROLE_USER = {
  'System Admin': 'u-101',
  'Tenant Admin': 'u-102',
  Staff: 'u-103',
  Reviewer: 'u-106',
};

export function AppProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [authUser, setAuthUser] = useState(null); // GET /me result
  // 'ok' | 'retrying' | 'failed' — transient /me verification state, so a
  // Supabase JWKS blip can be surfaced without logging anyone out.
  const [meStatus, setMeStatus] = useState('ok');
  const [previewRole, setPreviewRole] = useState('Tenant Admin');
  const [notifications, setNotifications] = useState(() => getNotifications());
  const loadedToken = useRef(null); // dedupe /me across duplicate auth events

  // Resolve the session on load and whenever it changes, then fetch /me so the
  // app shows the real signed-in identity, role and tenant.
  useEffect(() => {
    let active = true;
    let retryTimer = null;

    async function fetchMe(isRetry = false) {
      try {
        const me = await getMe();
        if (!active) return;
        setAuthUser(me);
        setMeStatus('ok');
      } catch (err) {
        if (!active) return;
        if (err?.status === 401) {
          // Branch on the envelope reason, never on the status alone (§3.1.3).
          // invalid_token can be a transient Supabase JWKS outage, during which
          // a perfectly good token is indistinguishable from a forged one — so
          // it must NOT destroy the session. Retry once, then keep the session
          // and give up quietly.
          const transient =
            err.reason === 'invalid_token' || err.reason === 'verification_failed';
          if (transient) {
            if (!isRetry) {
              setMeStatus('retrying');
              retryTimer = setTimeout(() => fetchMe(true), 2000);
            } else {
              setMeStatus('failed');
              setAuthUser(null);
            }
            return;
          }
          // Fatal 401s: missing_token / token_expired (refresh already failed
          // upstream) / user_not_provisioned — and the reason-less 401, which
          // is GET /me's "User tenant not found." (D-12): the account itself is
          // broken, so treat it as fatal too. Clear the session; RequireAuth
          // routes to /login.
          setMeStatus('ok');
          setAuthUser(null);
          loadedToken.current = null;
          await authSignOut();
          return;
        }
        // Network error / 5xx is not an auth verdict — keep the session.
        setMeStatus('failed');
        setAuthUser(null);
      }
    }

    async function loadIdentity(sess) {
      setSession(sess);
      const token = sess?.access_token ?? null;
      if (!token) {
        loadedToken.current = null;
        setAuthUser(null);
        setMeStatus('ok');
        return;
      }
      if (token === loadedToken.current) return; // already loaded for this session
      loadedToken.current = token;
      await fetchMe();
    }

    getSession().then(async ({ data }) => {
      await loadIdentity(data.session);
      if (active) setAuthLoading(false);
    });

    const { data: sub } = onAuthChange(async (_event, sess) => {
      await loadIdentity(sess);
      if (active) setAuthLoading(false);
    });

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const isAuthenticated = Boolean(session);

  // The real authenticated role takes precedence over the preview switcher.
  const role = authUser ? roleLabel(authUser.role) : previewRole;

  // Identity for the topbar/avatar: real user when signed in, mock fallback only
  // in the pre-auth/demo path.
  const currentUser = useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: roleLabel(authUser.role),
      };
    }
    return getUserById(ROLE_USER[previewRole]);
  }, [authUser, previewRole]);

  // Sidebar tenant: the real tenant when signed in, else the mock one.
  const tenant = authUser?.tenant ?? getPrimaryTenant();

  const signOut = useCallback(async () => {
    await authSignOut();
    loadedToken.current = null;
    setSession(null);
    setAuthUser(null);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const value = {
    authLoading,
    isAuthenticated,
    meStatus,
    role,
    previewRole,
    setPreviewRole,
    currentUser,
    tenant,
    signOut,
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
