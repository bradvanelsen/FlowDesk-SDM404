import { Building2, Workflow, ShieldCheck, Bell } from 'lucide-react';
import { PageHeader, Card, CardHeader, Button, Input, Select, Badge } from '../components/ui';
import { getPrimaryTenant } from '../data/mock';

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="sm:w-72">{children}</div>
    </div>
  );
}

export default function Settings() {
  const tenant = getPrimaryTenant();
  return (
    <>
      <PageHeader title="Settings" subtitle="Platform and workspace configuration" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padded={false}>
          <CardHeader title="Organisation profile" subtitle="Workspace identity" actions={<Building2 size={18} className="text-slate-300" />} />
          <div className="divide-y divide-slate-100 px-5">
            <Row label="Organisation name"><Input id="s-org" defaultValue={tenant.name} /></Row>
            <Row label="Plan">
              <Select id="s-plan" defaultValue={tenant.plan}>
                <option>Basic</option>
                <option>Pro</option>
              </Select>
            </Row>
            <Row label="Time zone">
              <Select id="s-tz" defaultValue="Australia/Sydney">
                <option>Australia/Sydney</option>
                <option>Australia/Melbourne</option>
                <option>Australia/Perth</option>
              </Select>
            </Row>
          </div>
          <div className="flex justify-end px-5 py-4 border-t border-slate-100">
            <Button>Save changes</Button>
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader title="Workflow states" subtitle="Incident lifecycle" actions={<Workflow size={18} className="text-slate-300" />} />
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
              Reviewers can reopen a closed incident if it recurs. All transitions are recorded in the audit trail.
            </p>
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader title="Security" subtitle="Access & authentication" actions={<ShieldCheck size={18} className="text-slate-300" />} />
          <div className="divide-y divide-slate-100 px-5">
            <Row label="Enforce SSO"><Select id="s-sso" defaultValue="Optional"><option>Optional</option><option>Required</option></Select></Row>
            <Row label="Session timeout"><Select id="s-timeout" defaultValue="8 hours"><option>1 hour</option><option>8 hours</option><option>24 hours</option></Select></Row>
            <Row label="Two-factor authentication"><Select id="s-2fa" defaultValue="Required for admins"><option>Off</option><option>Required for admins</option><option>Required for all</option></Select></Row>
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader title="Notifications" subtitle="Platform defaults" actions={<Bell size={18} className="text-slate-300" />} />
          <div className="divide-y divide-slate-100 px-5">
            <Row label="Email on new incident"><Select id="s-n1" defaultValue="Admins & reviewers"><option>Off</option><option>Admins & reviewers</option><option>Everyone</option></Select></Row>
            <Row label="Critical escalation"><Select id="s-n2" defaultValue="Immediate"><option>Immediate</option><option>Hourly digest</option></Select></Row>
            <Row label="Weekly summary"><Select id="s-n3" defaultValue="Mondays 8am"><option>Off</option><option>Mondays 8am</option></Select></Row>
          </div>
        </Card>
      </div>
    </>
  );
}
