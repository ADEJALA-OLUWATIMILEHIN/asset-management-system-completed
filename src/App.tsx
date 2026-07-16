import { Routes, Route, BrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from './pages/DashboadLayout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Documents from './pages/Documents';
import Calendar from './pages/Calendar';
import Users from './pages/Users';
import NewAsset from './pages/NewAsset';
import NewDocument from './pages/NewDocument';
import NewMaintenance from './pages/NewMaintenance';
import NewUser from './pages/NewUser';
import LoginPage from './pages/Login';
import { getAuthToken, login } from './api/LoginApi/LoginApi';
import { requestReminderPermission } from './components/ReminderAlerts';

function ProtectedLayout() {
  return getAuthToken() ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

function LoginRoute() {
  const navigate = useNavigate();

  if (getAuthToken()) return <Navigate to="/" replace />;

  return <LoginPage onSubmit={async (credentials) => {
    await login(credentials);
    requestReminderPermission();
    navigate("/", { replace: true });
  }} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
       <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/new" element={<NewAsset />} />
          <Route path="assets/:assetId/edit" element={<NewAsset />} />
          <Route path="documents/new" element={<NewDocument />} />
         

          <Route path="assets/:assetId" element={<Assets />} />
          <Route path="documents" element={<Documents />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="maintenance/schedule" element={<NewMaintenance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="users/new" element={<NewUser />} />
          <Route path="audit-logs" element={<AuditLogs />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
