import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Loader2 } from "lucide-react";

// Layout
import { MainLayout } from "./components/layout/main-layout";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/business/Dashboard";
import IssueCoupon from "@/pages/business/IssueCoupon";
import RedeemCoupon from "@/pages/business/RedeemCoupon";
import Analytics from "@/pages/business/Analytics";
import Settings from "@/pages/business/Settings";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClusters from "@/pages/admin/AdminClusters";
import AdminBusinesses from "@/pages/admin/AdminBusinesses";

// Auth Wrapper
function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [, setLocation] = useLocation();

  if (authLoading || (isAuthenticated && profileLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (adminOnly && profile?.role !== 'SUPER_ADMIN' && profile?.role !== 'SUB_ADMIN') {
    setLocation("/dashboard");
    return null;
  }

  return (
    <MainLayout>
      <Component {...rest} />
    </MainLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Business Routes */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/coupons/issue"><ProtectedRoute component={IssueCoupon} /></Route>
      <Route path="/coupons/redeem"><ProtectedRoute component={RedeemCoupon} /></Route>
      <Route path="/analytics"><ProtectedRoute component={Analytics} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>

      {/* Admin Routes */}
      <Route path="/admin"><ProtectedRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/clusters"><ProtectedRoute component={AdminClusters} adminOnly /></Route>
      <Route path="/admin/businesses"><ProtectedRoute component={AdminBusinesses} adminOnly /></Route>
      <Route path="/admin/reports"><ProtectedRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/settings"><ProtectedRoute component={AdminDashboard} adminOnly /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
