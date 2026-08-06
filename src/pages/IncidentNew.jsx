import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';
import {
  PageHeader, Card, Button, Input, Select, Textarea, Badge, FieldLabel,
} from '../components/ui';
import { cn } from '../lib/utils';
import { listCategories } from '../services/categories';
import { createIncident } from '../services/incidents';
import { fieldErrorsFrom } from '../services/api';
import { SEVERITY_LABELS, toApiSeverity } from '../lib/incidentLabels';

function Spinner(props) {
  return <Loader2 {...props} className={cn(props.className, 'animate-spin')} />;
}

const SEVERITIES = Object.values(SEVERITY_LABELS); // Low | Medium | High | Critical

// API field names → our form state keys, for 422 envelope mapping.
const FIELD_MAP = {
  title: 'title',
  description: 'description',
  category_id: 'category',
  severity: 'severity',
};

// Submission is staff-only (contract §4.5) — every other role gets 403 from
// the API; the nav only offers this page to Staff.
export default function IncidentNew() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', severity: 'Medium', description: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    let active = true;
    listCategories({ limit: 100 })
      .then(({ categories: rows }) => {
        if (!active) return;
        setCategories(rows);
        // Default to the first category so the select is never empty-invalid.
        setForm((f) => (f.category === '' && rows.length ? { ...f, category: rows[0].id } : f));
      })
      .catch(() => { if (active) setFormError('Could not load categories — reload to try again.'); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setFormError('');

    const errs = {};
    if (!form.title.trim()) errs.title = 'Please enter a title.';
    if (!form.description.trim()) errs.description = 'Please describe the incident.';
    if (!form.category) errs.category = 'Please choose a category.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createIncident({
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: form.category,
        severity: toApiSeverity(form.severity),
      });
      navigate(`/incidents/${created.id}`);
    } catch (err) {
      if (err?.status === 422) {
        const mapped = fieldErrorsFrom(err, FIELD_MAP);
        setFieldErrors(mapped);
        // Business-rule 422 (e.g. category_not_in_tenant) has no errors list —
        // surface the API's message at form level.
        setFormError(mapped._form ?? (Object.keys(mapped).length ? '' : err.message));
      } else if (err?.status === 403) {
        setFormError('Only staff members can submit incidents.');
      } else if (err?.status >= 500) {
        setFormError('Something went wrong on our side. Please try again.');
      } else {
        setFormError(err?.message || 'Submission failed. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Submit Incident"
        subtitle="Report a new incident for triage and review"
      />

      <div className="max-w-3xl">
        <Card className="p-6">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                {formError}
              </div>
            )}

            <div>
              <Input
                id="title"
                label="Title"
                hint="a short, descriptive summary"
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Customer portal timing out"
              />
              {fieldErrors.title && <p className="mt-1 text-[12px] text-red-600">{fieldErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Select id="category" label="Category" value={form.category} onChange={set('category')}>
                  {categories.length === 0 && <option value="">Loading categories…</option>}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                {fieldErrors.category && <p className="mt-1 text-[12px] text-red-600">{fieldErrors.category}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="severity">Severity</FieldLabel>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Select id="severity" value={form.severity} onChange={set('severity')}>
                      {SEVERITIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </div>
                  <Badge severity={form.severity} dot />
                </div>
              </div>
            </div>

            <div>
              <Textarea
                id="description"
                label="Description"
                hint="what happened, when, and who is affected"
                rows={6}
                value={form.description}
                onChange={set('description')}
                placeholder="Describe the incident in detail…"
              />
              {fieldErrors.description && <p className="mt-1 text-[12px] text-red-600">{fieldErrors.description}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <Button variant="secondary" type="button" disabled={submitting} onClick={() => navigate('/incidents')}>
                Cancel
              </Button>
              <Button type="submit" icon={submitting ? Spinner : Send} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit incident'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
