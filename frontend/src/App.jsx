import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import SessionsPage from './pages/SessionsPage';
import SettingsPage from './pages/SettingsPage';
import { DataCacheProvider } from './services/DataCacheContext';

const App = () => {
  return (
    <DataCacheProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth (no layout) */}
          <Route path="/" element={<LoginPage />} />

          {/* App (with layout) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schedule"  element={<SchedulePage />} />
            <Route path="/sessions"  element={<SessionsPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataCacheProvider>
  );
};

export default App;

