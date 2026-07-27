import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Route guard for the authenticated app. Unauthenticated users are sent to
// /login; the session is resolved once on load (authLoading) before deciding,
// so we don't flash the login screen for an already-signed-in user.
export default function RequireAuth() {
  const { authLoading, isAuthenticated } = useApp();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 size={22} className="animate-spin text-teal-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
