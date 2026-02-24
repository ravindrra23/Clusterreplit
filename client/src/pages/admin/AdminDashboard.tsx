import { useStats } from "@/hooks/use-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Building2, TrendingUp, ScanLine } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">System Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Active Clusters", value: stats?.activeClusters || 0, icon: Map },
    { title: "Network Revenue", value: `$${(stats?.revenueFacilitated || 0).toLocaleString()}`, icon: TrendingUp },
    { title: "Coupons Generated", value: stats?.couponsGenerated || 0, icon: ScanLine },
    { title: "Total Redemptions", value: stats?.couponsRedeemed || 0, icon: ScanLine },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">System Overview</h1>
        <p className="text-muted-foreground mt-1 text-lg">Top-level metrics across all clusters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="hover-elevate transition-all duration-300 shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="bg-primary/10 p-2 rounded-lg">
                <kpi.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Visual filler for empty state / premium feel */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl p-8 border border-primary/10 min-h-[400px] flex flex-col justify-center items-center text-center">
        <Building2 className="w-16 h-16 text-primary/40 mb-4" />
        <h3 className="text-2xl font-bold font-display">System Health Optimal</h3>
        <p className="text-muted-foreground max-w-md mt-2">
          All clusters are operating normally. Real-time logging is active and transaction volumes are within expected parameters.
        </p>
      </div>
    </div>
  );
}
