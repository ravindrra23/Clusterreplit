
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/types';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import IssueCoupon from '@/pages/IssueCoupon';
import RedeemCoupon from '@/pages/RedeemCoupon';
import Settings from '@/pages/Settings';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminClusters from '@/pages/AdminClusters';
import AdminBusinesses from '@/pages/AdminBusinesses';
import AdminReports from '@/pages/AdminReports';
import AdminActivityLog from '@/pages/AdminActivityLog';
import AdminSettings from '@/pages/AdminSettings';
import Analytics from '@/pages/Analytics';
import ActivityLog from '@/pages/ActivityLog';
import Layout from '@/components/Layout';

const ProtectedRoute = ({ children, allowedRoles, loginPath = '/login-merchant-str' }: { children?: React.ReactNode; allowedRoles?: UserRole[]; loginPath?: string }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
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
      <Route path="/login-merchant-str" element={!user ? <Login panelType="merchant" /> : <Navigate to="/" replace />} />
      <Route path="/superadmin-login-str" element={!user ? <Login panelType="admin" /> : <Navigate to="/" replace />} />
      <Route path="/login" element={<Navigate to="/login-merchant-str" replace />} />
      <Route path="/admin-login" element={<Navigate to="/superadmin-login-str" replace />} />
      
      <Route path="/" element={
        !user ? <Navigate to="/login-merchant-str" replace /> : 
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
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]} loginPath="/superadmin-login-str">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/clusters" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]} loginPath="/superadmin-login-str">
          <AdminClusters />
        </ProtectedRoute>
      } />
      <Route path="/admin/businesses" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]} loginPath="/superadmin-login-str">
          <AdminBusinesses />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]} loginPath="/superadmin-login-str">
          <AdminReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/activity" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN]} loginPath="/superadmin-login-str">
          <AdminActivityLog />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]} loginPath="/superadmin-login-str">
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
