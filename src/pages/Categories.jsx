import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, Modal, Input, Textarea,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { getCategories } from '../data/mock';

export default function Categories() {
  const categories = getCategories();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Incident Categories"
        subtitle="Define the categories staff can use when reporting incidents"
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add category</Button>}
      />

      <Card padded={false}>
        <Table className="rounded-none border-0 shadow-none">
          <THead>
            <TR>
              <TH>Category</TH>
              <TH>Description</TH>
              <TH align="center">Incidents</TH>
              <TH align="right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {categories.map((c) => (
              <TR key={c.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-light text-teal-brand">
                      <Tag size={15} />
                    </span>
                    <span className="font-medium text-slate-800">{c.name}</span>
                  </div>
                </TD>
                <TD className="max-w-md text-slate-500">{c.description}</TD>
                <TD align="center">
                  <Badge tone="teal">{c.incidentCount}</Badge>
                </TD>
                <TD align="right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" icon={Pencil}>Edit</Button>
                    <Button variant="danger" size="sm" icon={Trash2}>Delete</Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add category"
        subtitle="Create a new incident category for your organisation."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => setAddOpen(false)}>Add category</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="cat-name" label="Name" placeholder="e.g. Cyber Security" />
          <Textarea id="cat-desc" label="Description" rows={3} placeholder="Short description of what belongs in this category" />
        </div>
      </Modal>
    </>
  );
}
