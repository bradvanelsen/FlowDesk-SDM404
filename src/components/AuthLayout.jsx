import Logo from './Logo';

// Centered, sidebar-free layout for the pre-auth screens, on a subtle
// teal-tinted background with the FlowDesk logo above the card.
export default function AuthLayout({ children, footer }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-teal-light blur-3xl opacity-60" />
        <div className="absolute -bottom-48 -right-32 h-[360px] w-[360px] rounded-full bg-teal-brand/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-7">
          <Logo size="lg" />
        </div>
        <div className="w-full max-w-md">{children}</div>
        {footer && <div className="mt-6 text-center text-[13px] text-slate-500">{footer}</div>}
        <p className="mt-8 text-center text-xs text-slate-400">
          © 2026 FlowDesk · Incident management for modern teams
        </p>
      </div>
    </div>
  );
}
