# FlowDesk — A2 Prototype

A self-contained **Vite + React + Tailwind** prototype for SDM404 Assessment 2,
Section 5 (GUI / Prototype Screens). **Mock data only — no backend.**

- 4 roles: System Admin, Tenant Admin, Staff, Reviewer (role switcher in the top bar)
- Workflow state machine: **Open → In Review → Closed** (with audit trail)
- 6-table data model, all hardcoded in `src/data/mock.js`
- FlowDesk teal brand (`#0E7C7B`), Inter typeface, light theme

## Run it

```bash
npm install
npm run dev      # http://localhost:5173  (starts at /login)
npm run build    # production build
```

## Screenshot checklist (Table 19 order)

Capture each at ~**1440px** wide. Use the **"Viewing as"** role switcher (top bar)
to match the role shown, so the role-based navigation appears in the screenshot.

| # | Screen | Route | Use case(s) | Capture as role |
|---|--------|-------|-------------|-----------------|
| 1 | Login | `/login` | UC-05 | — |
| 2 | Registration | `/register` | UC-02 | — |
| 3 | Dashboard | `/dashboard` | UC-03, UC-04 | Tenant Admin |
| 4 | Users | `/users` | UC-03 | Tenant Admin |
| 5 | Categories | `/categories` | UC-04 | Tenant Admin |
| 6 | Submit incident | `/incidents/new` | UC-06 | Staff |
| 7 | Incident list | `/incidents` | UC-07 | Tenant Admin / Reviewer |
| 8 | Incident detail | `/incidents/:ref` (e.g. `/incidents/INC-1041`) | UC-08, UC-11 | Reviewer |
| 9 | Notifications | `/notifications` | UC-09 | Tenant Admin |
| 10 | Analytics | `/analytics` | UC-10 | Tenant Admin |

Suggested filenames: `screen-01-login.png` … `screen-10-analytics.png`.

### Supporting screens (demonstrate role-based access control)

| Screen | Route | Role |
|--------|-------|------|
| Tenants | `/tenants` | System Admin |
| Settings | `/settings` | System Admin |
| Style guide | `/styleguide` | (design-system reference) |

## Role-based navigation (UC-03 / UC-04)

| Role | Visible nav |
|------|-------------|
| System Admin | Dashboard · Tenants · Users · Settings |
| Tenant Admin | Dashboard · Incidents · Users · Categories · Notifications |
| Staff | Dashboard · Submit Incident · My Incidents · Notifications |
| Reviewer | Dashboard · Incident Queue · Notifications |

## Project structure

```
src/
  data/mock.js            6-table mock dataset + selectors (single source of truth)
  lib/utils.js            cn(), date/relative-time formatting, initials
  context/AppContext.jsx  current role + user, notification read-state
  components/
    ui/                   design-system primitives (Button, Badge, Card, Table, …)
    AppShell.jsx          sidebar + top bar + role-based nav
    AuthLayout.jsx        centered pre-auth layout
    Logo.jsx, NotificationBell.jsx
  pages/                  the 10 screens + Tenants/Settings/Styleguide
```

> Scope note: mock data only by design. Real Supabase / FastAPI wiring belongs to the A4 build.
