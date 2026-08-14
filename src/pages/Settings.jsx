import { useEffect, useState } from 'react';
import { Building2, Workflow, Loader2 } from 'lucide-react';
import { PageHeader, Card, CardHeader, Button, Input, Select, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { getSettings, updateSettings } from '../services/settings';
import { fieldErrorsFrom } from '../services/api';

// The workspace settings screen (AB#31; closes D-18/D-19). Field set matches
// exactly what the v2.2 API exposes: organisation name + timezone. The old
// mock-era fields (plan, SSO, session timeout, 2FA, notification defaults)
// had no backend and are removed per D-19.
const TIMEZONES = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Adelaide',
  'Australia/Perth',
  'Australia/Hobart',
  'Australia/Darwin',
];

const FIELD_MAP = { name: 'name', timezone: 'timezone' };

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="sm:w-72">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { role, tenant, refreshIdentity } = useApp();
  const [baseline, setBaseline] = useState(null); // last-saved record
  const [form, setForm] = useState({ name: '', timezone: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  // Same lesson as D-26: before /me resolves, `role` falls back to the mock
  // preview default ("Tenant Admin"), so gating on role alone briefly treats
  // every user as an admin and fires a doomed request. Real tenant ids are
  // UUIDs — wait for the resolved identity before deciding anything.
  const identityResolved = (tenant?.id ?? '').length === 36;
  const isTenantAdmin = identityResolved && role === 'Tenant Admin';

  useEffect(() => {
    if (!identityResolved) return undefined; // still resolving — no request, no verdict
    if (!isTenantAdmin) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    getSettings()
      .then((s) => {
        if (!active) return;
        setBaseline(s);
        setForm({ name: s.name, timezone: s.timezone });
      })
      .catch((err) => {
        if (active) setLoadError(err?.message || 'Could not load settings.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [identityResolved, isTenantAdmin]);

  const dirty =
    baseline !== null &&
    (form.name !== baseline.name || form.timezone !== baseline.timezone);

  function cancel() {
    if (!baseline) return;
    setForm({ name: baseline.name, timezone: baseline.timezone });
    setFieldErrors({});
    setFormError('');
  }

  async function save() {
    if (saving || !dirty) return;
    setFormError('');
    setFieldErrors({});

    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Organisation name must be at least 2 characters.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Partial body is the norm — send only what changed (§4.10).
    const body = {};
    if (form.name !== baseline.name) body.name = form.name.trim();
    if (form.timezone !== baseline.timezone) body.timezone = form.timezone;

    setSaving(true);
    try {
      const saved = await updateSettings(body);
      // Render what was STORED, not what was typed — the D-18 distinction.
      setBaseline(saved);
      setForm({ name: saved.name, timezone: saved.timezone });
      setNotice('Settings saved.');
      setTimeout(() => setNotice(''), 5000);
      // The sidebar tenant chip comes from /me — refresh so a rename shows
      // immediately instead of on the next sign-in.
      if (body.name) refreshIdentity();
    } catch (err) {
      if (err?.status === 422) {
        // invalid_timezone is a business-rule 422 (details.reason, no field
        // list); framework 422s map per-field.
        if (err.reason === 'invalid_timezone') {
          setFieldErrors({ timezone: err.message });
        } else {
          const mapped = fieldErrorsFrom(err, FIELD_MAP);
          setFieldErrors(mapped);
          setFormError(mapped._form ?? (Object.keys(mapped).length ? '' : err.message));
        }
      } else if (err?.status === 409) {
        // organization_name_taken — global, case-insensitive. Show verbatim.
        setFieldErrors({ name: err.message });
      } else if (err?.status === 403) {
        setFormError(err.message);
      } else {
        setFormError(err?.message || 'Saving failed. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!identityResolved) {
    return (
      <>
        <PageHeader title="Settings" subtitle="Workspace configuration" />
        <Card className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </Card>
      </>
    );
  }

  if (!isTenantAdmin) {
    return (
      <>
        <PageHeader title="Settings" subtitle="Workspace configuration" />
        <Card className="py-14 text-center text-sm text-slate-500">
          Only the organisation&rsquo;s Tenant Admin can manage workspace settings.
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Workspace configuration for your organisation"
        actions={notice && <span className="text-[13px] font-medium text-green-700">{notice}</span>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padded={false}>
          <CardHeader
            title="Organisation profile"
            subtitle="Name and reporting timezone"
            actions={<Building2 size={18} className="text-slate-300" />}
          />
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" /> Loading settings…
            </div>
          ) : loadError ? (
            <p className="px-5 py-10 text-center text-sm text-red-600">{loadError}</p>
          ) : (
            <>
              <div className="divide-y divide-slate-100 px-5">
                {formError && (
                  <div className="my-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                    {formError}
                  </div>
                )}
                <Row label="Organisation name">
                  <div>
                    <Input
                      id="s-org"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-[12px] text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>
                </Row>
                <Row label="Reporting timezone">
                  <div>
                    <Select
                      id="s-tz"
                      value={form.timezone}
                      onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                    >
                      {!TIMEZONES.includes(form.timezone) && form.timezone && (
                        <option value={form.timezone}>{form.timezone}</option>
                      )}
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </Select>
                    {fieldErrors.timezone && (
                      <p className="mt-1 text-[12px] text-red-600">{fieldErrors.timezone}</p>
                    )}
                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
                      Not cosmetic: this sets the week boundaries for your organisation&rsquo;s
                      analytics. Changing it re-cuts the incident-volume chart on the next load.
                    </p>
                  </div>
                </Row>
              </div>
              <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-100">
                <Button variant="secondary" disabled={!dirty || saving} onClick={cancel}>
                  Cancel
                </Button>
                <Button disabled={!dirty || saving} onClick={save}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </>
          )}
        </Card>

        <Card padded={false}>
          <CardHeader
            title="Workflow states"
            subtitle="Incident lifecycle"
            actions={<Workflow size={18} className="text-slate-300" />}
          />
          <div className="px-5 py-5">
            <p className="text-[13px] text-slate-500">The incident workflow follows a fixed state machine:</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Badge status="Open" />
              <span className="text-slate-300">→</span>
              <Badge status="In Review" />
              <span className="text-slate-300">→</span>
              <Badge status="Closed" />
            </div>
            <p className="mt-4 text-[13px] text-slate-500">
              Closing requires a resolution note, and <span className="font-medium text-slate-700">Closed
              is a terminal state</span> — closed incidents cannot be reopened. Every transition is
              recorded in the audit trail.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
