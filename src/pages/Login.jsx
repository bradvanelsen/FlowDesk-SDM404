import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { Card, Input, Button } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('priya.nair@demoorg.example');
  const [password, setPassword] = useState('demo-password');

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

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
        >
          <Input
            id="email"
            label="Email"
            type="email"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organisation.au"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
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

          <Button type="submit" className="w-full" iconRight={ArrowRight}>
            Sign in
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
