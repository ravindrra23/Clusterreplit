import { useStats } from "@/hooks/use-stats";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Ticket, ScanLine, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Coupons Generated", value: stats?.couponsGenerated || 0, icon: Ticket, trend: "+12%", positive: true },
    { title: "Coupons Redeemed", value: stats?.couponsRedeemed || 0, icon: ScanLine, trend: "+8%", positive: true },
    { title: "Revenue Facilitated", value: `$${(stats?.revenueFacilitated || 0).toLocaleString()}`, icon: TrendingUp, trend: "+24%", positive: true },
    { title: "Active Clusters", value: stats?.activeClusters || 0, icon: Users, trend: "Stable", positive: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1 text-lg">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 hover-elevate font-medium" asChild>
            <Link href="/coupons/redeem">Redeem Coupon</Link>
          </Button>
          <Button className="h-10 hover-elevate shadow-md shadow-primary/20 font-medium" asChild>
            <Link href="/coupons/issue">Issue New Coupon</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="hover-elevate transition-all duration-300 border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="bg-primary/10 p-2 rounded-lg">
                <kpi.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{kpi.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {kpi.positive ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-rose-500" />
                )}
                <span className={`text-xs font-medium ${kpi.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {kpi.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 shadow-sm hover-elevate">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity?.length ? (
              <div className="space-y-4">
                {/* Map recent activity here */}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                <ActivityIcon className="w-8 h-8 mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover-elevate bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>💡 Issue bulk coupons to print and hand out at your register.</p>
            <p>💡 Engage with neighboring businesses to coordinate promotional days.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return <TrendingUp {...props} />;
}
