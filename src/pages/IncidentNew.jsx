import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import {
  PageHeader, Card, Button, Input, Select, Textarea, Badge, FieldLabel,
} from '../components/ui';
import { getCategories } from '../data/mock';

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function IncidentNew() {
  const navigate = useNavigate();
  const categories = getCategories();
  const [form, setForm] = useState({
    title: 'Customer portal timing out',
    category: 'IT / Systems',
    severity: 'High',
    description:
      'Staff are reporting that the customer portal times out when opening account records during the morning peak. The error appears after ~30 seconds with a 504 gateway message. Affecting multiple teams since approximately 07:30 today.',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Submit Incident"
        subtitle="Report a new incident for triage and review"
      />

      <div className="max-w-3xl">
        <Card className="p-6">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              navigate('/incidents');
            }}
          >
            <Input
              id="title"
              label="Title"
              hint="a short, descriptive summary"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Customer portal timing out"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Select id="category" label="Category" value={form.category} onChange={set('category')}>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </Select>

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

            <Textarea
              id="description"
              label="Description"
              hint="what happened, when, and who is affected"
              rows={6}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the incident in detail…"
            />

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <Button variant="secondary" type="button" onClick={() => navigate('/incidents')}>
                Cancel
              </Button>
              <Button type="submit" icon={Send}>Submit incident</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
