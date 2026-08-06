import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { Card, Input, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { signInWithPassword } from '../services/auth';
import { useApp } from '../context/AppContext';

// Spinner that spins — Button's `icon` prop renders a plain icon.
function Spinner(props) {
  return <Loader2 {...props} className={cn(props.className, 'animate-spin')} />;
}

// Turn Supabase's technical auth errors into plain English.
function friendlyAuthError(error) {
  const m = (error?.message || '').toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Incorrect email or password.';
  }
  if (m.includes('email not confirmed')) {
    return 'Your email address hasn’t been confirmed yet.';
  }
  if (m.includes('not configured')) return error.message;
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Could not reach the sign-in service. Check your connection.';
  }
  return error?.message || 'Sign-in failed. Please try again.';
}

export default function Login() {
  const navigate = useNavigate();
  // authNotice: forced-sign-out message (e.g. account deactivated, F-02),
  // set by AppContext before it cleared the session.
  const { authNotice, clearAuthNotice } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // guard against double-submit
    setError('');
    if (authNotice) clearAuthNotice();
    setSubmitting(true);

    const { error: signInError } = await signInWithPassword(email.trim(), password);
    if (signInError) {
      setSubmitting(false);
      setError(friendlyAuthError(signInError));
      return;
    }
    // Session established; AppContext resolves /me. Enter the app.
    navigate('/dashboard');
  }

  return (
    <AuthLayout
      footer={
        <>
          New organisation?{' '}
          <Link to="/register" className="font-medium text-teal-brand hover:text-teal-dark">
            Register here
          </Link>
        </>
      }
    >
      <Card className="p-7">
        <h1 className="text-xl font-semibold text-slate-900">Sign in to FlowDesk</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Sign in to manage your incidents.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {authNotice && !error && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              {authNotice}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organisation.au"
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-teal-brand focus:ring-teal-brand/30 cursor-pointer accent-teal-brand"
              />
              Remember me
            </label>
            <a href="#" className="text-[13px] font-medium text-teal-brand hover:text-teal-dark">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            icon={submitting ? Spinner : undefined}
            iconRight={submitting ? undefined : ArrowRight}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
