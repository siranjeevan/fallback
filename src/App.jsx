import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useThemeStore from './store/themeStore';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SendNotificationPage from './pages/SendNotificationPage';
import NotificationHistoryPage from './pages/NotificationHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  const init = useThemeStore((s) => s.init);
  useEffect(() => init(), [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="send" element={<SendNotificationPage />} />
          <Route path="history" element={<NotificationHistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
