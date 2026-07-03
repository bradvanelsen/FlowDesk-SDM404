import { useState } from 'react';
import { Plus, Search, Trash2, Check } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, Badge, Avatar, Input, Select, Textarea,
  StatCard, Modal, Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { ClipboardList } from 'lucide-react';

function Section({ title, children }) {
  return (
    <Card padded={false} className="mb-6">
      <CardHeader title={title} />
      <div className="p-5 flex flex-wrap items-center gap-4">{children}</div>
    </Card>
  );
}

export default function Styleguide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader title="Style guide" subtitle="FlowDesk design-system primitives" />

      <Section title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger" icon={Trash2}>Danger</Button>
        <Button icon={Plus}>With icon</Button>
        <Button size="sm">Small</Button>
        <Button size="sm" variant="secondary" icon={Check}>Small icon</Button>
      </Section>

      <Section title="Severity badges">
        <Badge severity="Low" dot />
        <Badge severity="Medium" dot />
        <Badge severity="High" dot />
        <Badge severity="Critical" dot />
      </Section>

      <Section title="Status badges">
        <Badge status="Open" />
        <Badge status="In Review" />
        <Badge status="Closed" />
        <Badge tone="teal">Teal tone</Badge>
        <Badge tone="neutral">Neutral</Badge>
      </Section>

      <Section title="Avatars">
        <Avatar name="Priya Nair" size="xs" />
        <Avatar name="Liam O'Connor" size="sm" />
        <Avatar name="Hannah Fitzgerald" size="md" />
        <Avatar name="Daniel Kovač" size="lg" />
      </Section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Incidents" value={16} icon={ClipboardList} accent="teal" hint="All time" />
        <StatCard label="Open" value={4} accent="blue" />
        <StatCard label="Closed" value={7} accent="green" />
      </div>

      <Card padded={false} className="mb-6">
        <CardHeader title="Form controls" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input id="sg-1" label="Text input" placeholder="Type here…" leftIcon={Search} />
          <Select id="sg-2" label="Select">
            <option>Option A</option>
            <option>Option B</option>
          </Select>
          <Textarea id="sg-3" label="Textarea" rows={3} placeholder="Longer text…" className="sm:col-span-2" />
        </div>
      </Card>

      <Card padded={false} className="mb-6">
        <CardHeader title="Table" actions={<Button size="sm" onClick={() => setOpen(true)}>Open modal</Button>} />
        <Table className="rounded-none border-0 shadow-none">
          <THead>
            <TR><TH>Reference</TH><TH>Severity</TH><TH>Status</TH><TH align="right">Action</TH></TR>
          </THead>
          <TBody>
            <TR onClick={() => {}}>
              <TD className="font-medium text-teal-brand">INC-1042</TD>
              <TD><Badge severity="Medium" dot /></TD>
              <TD><Badge status="Open" /></TD>
              <TD align="right"><Button size="sm" variant="secondary">View</Button></TD>
            </TR>
            <TR onClick={() => {}}>
              <TD className="font-medium text-teal-brand">INC-1034</TD>
              <TD><Badge severity="Critical" dot /></TD>
              <TD><Badge status="Closed" /></TD>
              <TD align="right"><Button size="sm" variant="secondary">View</Button></TD>
            </TR>
          </TBody>
        </Table>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Example modal"
        subtitle="A simple visual modal."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <Input id="sg-modal" label="Name" placeholder="Enter a name" />
      </Modal>
    </>
  );
}
