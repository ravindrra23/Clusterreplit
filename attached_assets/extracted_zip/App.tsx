
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueCoupon from './pages/IssueCoupon';
import RedeemCoupon from './pages/RedeemCoupon';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminClusters from './pages/AdminClusters';
import AdminBusinesses from './pages/AdminBusinesses';
import AdminReports from './pages/AdminReports';
import AdminActivityLog from './pages/AdminActivityLog';
import AdminSettings from './pages/AdminSettings';
import Analytics from './pages/Analytics';
import ActivityLog from './pages/ActivityLog';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode; allowedRoles?: UserRole[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role-based redirection for unauthorized access
    if (user.role === UserRole.SUB_ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === UserRole.SUB_MERCHANT) {
      return <Navigate to="/redeem" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> : 
        (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SUB_ADMIN) 
          ? <Navigate to="/admin" replace /> 
          : (user.role === UserRole.SUB_MERCHANT)
            ? <Navigate to="/redeem" replace />
            : <Navigate to="/dashboard" replace />
      } />

      {/* Merchant & Sub-Merchant (Counter) Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={[UserRole.BUSINESS_OWNER]}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/issue" element={
        <ProtectedRoute allowedRoles={[UserRole.BUSINESS_OWNER]}>
          <IssueCoupon />
        </ProtectedRoute>
      } />
      <Route path="/redeem" element={
        <ProtectedRoute allowedRoles={[UserRole.BUSINESS_OWNER, UserRole.SUB_MERCHANT]}>
          <RedeemCoupon />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={[UserRole.BUSINESS_OWNER]}>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={[UserRole.BUSINESS_OWNER]}>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/activity" element={
        <ProtectedRoute allowedRoles={[UserRole.BUSINESS_OWNER]}>
          <ActivityLog />
        </ProtectedRoute>
      } />

      {/* Admin & Sub-Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/clusters" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]}>
          <AdminClusters />
        </ProtectedRoute>
      } />
      <Route path="/admin/businesses" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]}>
          <AdminBusinesses />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]}>
          <AdminReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/activity" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]}>
          <AdminActivityLog />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
          <AdminSettings />
        </ProtectedRoute>
      } />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
