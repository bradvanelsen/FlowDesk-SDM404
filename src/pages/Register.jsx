import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, User, Mail, ArrowRight, Loader2, MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { Card, Input, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { registerOrganization, fieldErrorsFrom } from '../services/api';

// Spinner that spins — Button's `icon` prop renders a plain icon.
function Spinner(props) {
  return <Loader2 {...props} className={cn(props.className, 'animate-spin')} />;
}

// API field names → our form state keys, for mapping 422 envelope errors.
const FIELD_MAP = {
  organization_name: 'org',
  admin_name: 'name',
  admin_email: 'email',
};

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registration takes exactly the three fields POST /organizations accepts
// (contract §4.2). There is deliberately no password field: the admin sets
// their password later via the Supabase invite email (§2.6).
export default function Register() {
  const [form, setForm] = useState({ org: '', name: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null); // 201 payload → success panel

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const errs = {};
    if (form.org.trim().length < 2) errs.org = 'Organisation name must be at least 2 characters.';
    if (!form.name.trim()) errs.name = 'Please enter the admin’s full name.';
    if (!EMAIL_SHAPE.test(form.email.trim())) errs.email = 'Please enter a valid email address.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // double-submit guard
    setFormError('');

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const result = await registerOrganization({
        organizationName: form.org.trim(),
        adminName: form.name.trim(),
        adminEmail: form.email.trim(),
      });
      setCreated(result);
    } catch (err) {
      if (err?.status === 422) {
        const mapped = fieldErrorsFrom(err, FIELD_MAP);
        setFieldErrors(mapped);
        // Unmappable entries (integer loc, absent body) land on _form; if
        // nothing mapped at all, fall back to the envelope message.
        setFormError(mapped._form ?? (Object.keys(mapped).length ? '' : err.message));
      } else if (err?.status === 409) {
        // Duplicate organisation name or already-registered email — the API's
        // own message says which (§4.2).
        setFormError(err.message);
      } else if (err?.status >= 500) {
        setFormError('Something went wrong on our side. Please try again.');
      } else {
        setFormError(err?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <>
      Already have an account?{' '}
      <Link to="/login" className="font-medium text-teal-brand hover:text-teal-dark">
        Sign in
      </Link>
    </>
  );

  // 201 → success panel. No session exists yet (the password is set via the
  // invite email), so we do NOT navigate into the app — RequireAuth would
  // bounce it straight back to /login anyway.
  if (created) {
    // Echo the server's copy of the email: it is normalised on storage and can
    // differ from what was typed (§4.2 note 2).
    const email = created?.admin_user?.email ?? form.email.trim();
    return (
      <AuthLayout footer={footer}>
        <Card className="p-7 text-center">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
            <MailCheck size={22} />
          </span>
          <h1 className="text-lg font-semibold text-slate-900">
            Organisation created — check your email
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            We&rsquo;ve sent <span className="font-medium text-slate-700">{email}</span> a link to
            set your password. Follow it to activate your admin account, then sign in.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-block text-sm font-medium text-teal-brand hover:text-teal-dark"
          >
            Go to sign in →
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout footer={footer}>
      <Card className="p-7">
        <h1 className="text-xl font-semibold text-slate-900">Register your organisation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a workspace and admin account to get started.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {formError}
            </div>
          )}

          <div>
            <Input
              id="org"
              label="Organisation name"
              leftIcon={Building2}
              value={form.org}
              onChange={set('org')}
              placeholder="e.g. Acme Corporation"
              autoComplete="organization"
            />
            {fieldErrors.org && (
              <p className="mt-1 text-[12px] text-red-600">{fieldErrors.org}</p>
            )}
          </div>
          <div>
            <Input
              id="name"
              label="Admin full name"
              leftIcon={User}
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Jordan Smith"
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[12px] text-red-600">{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <Input
              id="adminemail"
              label="Admin email"
              type="email"
              leftIcon={Mail}
              value={form.email}
              onChange={set('email')}
              placeholder="you@organisation.au"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-[12px] text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <p className="text-[12px] leading-relaxed text-slate-400">
            No password needed now — we&rsquo;ll email the admin a secure link to set one.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            icon={submitting ? Spinner : undefined}
            iconRight={submitting ? undefined : ArrowRight}
          >
            {submitting ? 'Creating organisation…' : 'Create organisation'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
