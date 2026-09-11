import { Routes, Route, BrowserRouter } from 'react-router-dom';
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
import  Settings  from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
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
          <Route path="settings" element={<Settings/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
