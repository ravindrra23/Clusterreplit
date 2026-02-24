import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Branding */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 overflow-hidden bg-primary text-primary-foreground">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">ClusterGrowth</span>
          </div>

          <div className="max-w-xl">
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              Grow your local business together.
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl font-medium leading-relaxed mb-12">
              Join local business clusters to share customers, issue cross-business coupons, and multiply your foot traffic effortlessly.
            </p>

            <div className="space-y-6">
              {[
                { icon: Users, text: "Share customers seamlessly within your cluster" },
                { icon: TrendingUp, text: "Increase revenue through mutual promotions" },
                { icon: ShieldCheck, text: "Secure, traceable coupon generation & redemption" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-primary-foreground/90">
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-16 text-sm text-primary-foreground/60 font-medium">
          © {new Date().getFullYear()} ClusterGrowth SaaS. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border/50 shadow-xl shadow-black/5 hover-elevate transition-all duration-300">
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-semibold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all group"
              onClick={handleLogin}
            >
              Continue with Replit
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our <br/>
                <a href="#" className="underline underline-offset-4 text-foreground hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline underline-offset-4 text-foreground hover:text-primary transition-colors">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
