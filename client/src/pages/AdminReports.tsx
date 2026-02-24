
import React, { useEffect, useState } from 'react';
import { mockService } from '../services/mockService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { IndianRupee, TrendingUp, Activity, Map, Download } from 'lucide-react';

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444'];

const AdminReports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchReports = async () => {
    const liveData = await mockService.getPlatformAnalytics();
    setData(liveData);
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await mockService.downloadClusterData();
    } catch (e) {
      console.error(e);
      alert("Failed to download data");
    } finally {
      setDownloading(false);
    }
  };

  if (!data) return <div className="p-10 text-center">Loading live reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Revenue Hub</h1>
          <p className="text-slate-500">Live analysis of platform growth and monetization from all clusters.</p>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
        >
           <Download size={18} />
           <span>{downloading ? 'Downloading...' : 'Export Platform Data'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <IndianRupee size={20} className="mr-2 text-indigo-600"/>
                Live Revenue Trends
              </h2>
              <p className="text-sm text-slate-500">Aggregated transaction value over the last 6 months</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <TrendingUp size={14} className="mr-1" /> Real-time
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
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="mb-6">
             <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Map size={20} className="mr-2 text-indigo-600"/>
                Revenue by Cluster
              </h2>
              <p className="text-sm text-slate-500">Market share distribution across regions</p>
          </div>
           <div className="h-80 flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.clusterPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.clusterPerformance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-6">
             <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Activity size={20} className="mr-2 text-indigo-600"/>
                Network Coupon Lifecycle
              </h2>
              <p className="text-sm text-slate-500">Real-time status of all digital coupons</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.distribution} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 'bold'}} />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={30}>
                    {data.distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Bar>
               </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
