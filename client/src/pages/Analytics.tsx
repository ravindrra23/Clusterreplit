
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { IndianRupee, TrendingUp, Activity } from 'lucide-react';

const COLORS = ['#4f46e5', '#22c55e', '#ef4444'];

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async () => {
    if (user?.businessId) {
      const analyticsData = await mockService.getAnalyticsData(user.businessId);
      setData(analyticsData);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Real-time updates: Poll every 5 seconds for live infographics
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (!data) return (
    <div className="p-20 text-center space-y-4">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Real-time Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500">Track your business growth and coupon performance in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <IndianRupee size={20} className="mr-2 text-indigo-600"/>
                Revenue from Cluster
              </h2>
              <p className="text-sm text-slate-500">Monthly revenue from partner coupon redemptions at your shop</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <TrendingUp size={14} className="mr-1" /> Live Feed
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue}>
                <defs>
                  <linearGradient id="colorRv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coupon Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-6">
             <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Activity size={20} className="mr-2 text-indigo-600"/>
                Issued Coupon Status
              </h2>
              <p className="text-sm text-slate-500">Current state of all coupons you've generated</p>
          </div>
          <div className="h-80 flex flex-col justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {data.distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{paddingTop: '20px', fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
