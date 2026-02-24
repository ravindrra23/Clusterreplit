import { useStats } from "@/hooks/use-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export default function Analytics() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Mock data for chart since backend might not provide full timeseries yet
  const chartData = [
    { name: 'Mon', redemptions: 12, generated: 45 },
    { name: 'Tue', redemptions: 19, generated: 30 },
    { name: 'Wed', redemptions: 15, generated: 60 },
    { name: 'Thu', redemptions: 22, generated: 40 },
    { name: 'Fri', redemptions: 30, generated: 80 },
    { name: 'Sat', redemptions: 45, generated: 100 },
    { name: 'Sun', redemptions: 38, generated: 90 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-display">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your coupon performance and ROI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{stats?.couponsGenerated || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Redeemed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{stats?.couponsRedeemed || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate bg-primary text-primary-foreground border-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary-foreground/80">Net Revenue Boost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">${(stats?.revenueNet || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dx={-10} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                  contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))'}}
                />
                <Bar dataKey="generated" name="Generated" fill="hsl(var(--primary)/0.3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="redemptions" name="Redeemed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
