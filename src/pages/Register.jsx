import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { Card, Input, Select, Button } from '../components/ui';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    org: 'Demo Organisation',
    name: 'Priya Nair',
    email: 'priya.nair@demoorg.example',
    password: 'demo-password',
    confirm: 'demo-password',
    plan: 'Pro',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthLayout
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-brand hover:text-teal-dark">
            Sign in
          </Link>
        </>
      }
    >
      <Card className="p-7">
        <h1 className="text-xl font-semibold text-slate-900">Register your organisation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a workspace and admin account to get started.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
        >
          <Input
            id="org"
            label="Organisation name"
            leftIcon={Building2}
            value={form.org}
            onChange={set('org')}
          />
          <Input
            id="name"
            label="Admin full name"
            leftIcon={User}
            value={form.name}
            onChange={set('name')}
          />
          <Input
            id="adminemail"
            label="Admin email"
            type="email"
            leftIcon={Mail}
            value={form.email}
            onChange={set('email')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="pw"
              label="Password"
              type="password"
              leftIcon={Lock}
              value={form.password}
              onChange={set('password')}
            />
            <Input
              id="confirm"
              label="Confirm password"
              type="password"
              leftIcon={Lock}
              value={form.confirm}
              onChange={set('confirm')}
            />
          </div>
          <Select id="plan" label="Plan" value={form.plan} onChange={set('plan')}>
            <option value="Basic">Basic — up to 10 users</option>
            <option value="Pro">Pro — unlimited users + analytics</option>
          </Select>

          <Button type="submit" className="w-full">
            Create organisation
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
