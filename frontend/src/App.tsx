import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';

// Public
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import SubscribePage from './pages/SubscribePage';

// User
import DashboardPage from './pages/user/DashboardPage';
import ScoresPage from './pages/user/ScoresPage';
import CharitiesPage from './pages/user/CharitiesPage';
import DrawsPage from './pages/user/DrawsPage';
import WinningsPage from './pages/user/WinningsPage';
import SettingsPage from './pages/user/SettingsPage';

// Admin
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDrawsPage from './pages/admin/AdminDrawsPage';
import AdminCharitiesPage from './pages/admin/AdminCharitiesPage';
import AdminWinnersPage from './pages/admin/AdminWinnersPage';

export default function App() {
  const location = useLocation();
  return (
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/subscribe" element={
              <ProtectedRoute><SubscribePage /></ProtectedRoute>
            } />

            {/* User routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/scores" element={
              <ProtectedRoute><ScoresPage /></ProtectedRoute>
            } />
            <Route path="/charities" element={
              <ProtectedRoute><CharitiesPage /></ProtectedRoute>
            } />
            <Route path="/draws" element={
              <ProtectedRoute><DrawsPage /></ProtectedRoute>
            } />
            <Route path="/winnings" element={
              <ProtectedRoute><WinningsPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminAnalyticsPage /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>
            } />
            <Route path="/admin/draws" element={
              <ProtectedRoute adminOnly><AdminDrawsPage /></ProtectedRoute>
            } />
            <Route path="/admin/charities" element={
              <ProtectedRoute adminOnly><AdminCharitiesPage /></ProtectedRoute>
            } />
            <Route path="/admin/winners" element={
              <ProtectedRoute adminOnly><AdminWinnersPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
  );
}