import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { Card, Input, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { getSession, onAuthChange, updatePassword, isSupabaseConfigured } from '../services/auth';

const MIN_PASSWORD_LENGTH = 8;

// Spinner that spins — the Button's `icon` prop renders a plain icon, so we wrap
// Loader2 to add the spin animation.
function Spinner(props) {
  return <Loader2 {...props} className={cn(props.className, 'animate-spin')} />;
}

// Small centred status card used for the non-form states (resolving / invalid /
// success / unconfigured).
function StatusCard({ icon: Icon, iconClass, title, children }) {
  return (
    <Card className="p-7 text-center">
      <span className={cn('mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full', iconClass)}>
        <Icon size={22} />
      </span>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="mt-1.5 text-sm text-slate-500">{children}</div>
    </Card>
  );
}

// Set-Password page (Sprint 2).
// New users are invited via Supabase with no password; the invite email links
// here. Supabase resolves the temporary session from the URL, the user sets a
// password (sent only to Supabase via the auth service), then enters the app.
export default function SetPassword() {
  const navigate = useNavigate();
  // 'resolving' | 'ready' | 'invalid' | 'success' | 'unconfigured'
  const [phase, setPhase] = useState('resolving');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Resolve the invite session from the URL. The Supabase client parses the
  // link on load (detectSessionInUrl) and fires an auth event once the session
  // is established; we also check immediately in case it already resolved.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setPhase('unconfigured');
      return undefined;
    }

    let active = true;
    const { data: sub } = onAuthChange((_event, session) => {
      if (active && session) setPhase('ready');
    });
    getSession().then(({ data }) => {
      if (active && data?.session) setPhase('ready');
    });

    // If no session appears shortly, the link is invalid or expired.
    const timer = setTimeout(async () => {
      const { data } = await getSession();
      if (active && !data?.session) setPhase('invalid');
    }, 2500);

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message || 'Could not set your password. Please try again.');
      return;
    }

    setPhase('success');
    setTimeout(() => navigate('/dashboard'), 1200);
  }

  const signInFooter = (
    <>
      Already activated?{' '}
      <Link to="/login" className="font-medium text-teal-brand hover:text-teal-dark">
        Sign in
      </Link>
    </>
  );

  if (phase === 'resolving') {
    return (
      <AuthLayout>
        <StatusCard icon={Spinner} iconClass="bg-teal-light text-teal-brand" title="Verifying your invitation…">
          One moment while we confirm your invite link.
        </StatusCard>
      </AuthLayout>
    );
  }

  if (phase === 'unconfigured') {
    return (
      <AuthLayout footer={signInFooter}>
        <StatusCard icon={AlertTriangle} iconClass="bg-amber-50 text-amber-600" title="Sign-in isn't configured">
          The Supabase connection hasn't been set up in this environment. Create a{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-600">.env.local</code>{' '}
          from <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-600">.env.example</code> and reload.
        </StatusCard>
      </AuthLayout>
    );
  }

  if (phase === 'invalid') {
    return (
      <AuthLayout footer={signInFooter}>
        <StatusCard icon={AlertTriangle} iconClass="bg-red-50 text-red-600" title="Invitation link invalid or expired">
          This link may have already been used or has expired. Ask your administrator to resend your invitation.
        </StatusCard>
      </AuthLayout>
    );
  }

  if (phase === 'success') {
    return (
      <AuthLayout>
        <StatusCard icon={CheckCircle2} iconClass="bg-green-50 text-green-600" title="Password set">
          Signing you in…
        </StatusCard>
      </AuthLayout>
    );
  }

  // phase === 'ready' — show the password form.
  return (
    <AuthLayout footer={signInFooter}>
      <Card className="p-7">
        <h1 className="text-xl font-semibold text-slate-900">Set your password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a password to activate your FlowDesk account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <Input
            id="new-password"
            label="New password"
            hint={`min ${MIN_PASSWORD_LENGTH} characters`}
            type="password"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a new password"
            autoComplete="new-password"
          />
          <Input
            id="confirm-password"
            label="Confirm password"
            type="password"
            leftIcon={Lock}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            icon={submitting ? Spinner : undefined}
            iconRight={submitting ? undefined : ArrowRight}
          >
            {submitting ? 'Setting password…' : 'Set password & continue'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
