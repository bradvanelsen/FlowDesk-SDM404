import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Tenants from './pages/Tenants';
import Settings from './pages/Settings';
import IncidentNew from './pages/IncidentNew';
import IncidentList from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import Styleguide from './pages/Styleguide';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Pre-auth (no app shell) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated app */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/users" element={<Users />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/new" element={<IncidentNew />} />
            <Route path="/incidents/:ref" element={<IncidentDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/styleguide" element={<Styleguide />} />
          </Route>

          {/* Entry point */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
