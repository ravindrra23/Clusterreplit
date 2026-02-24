
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { Stats, Coupon, Notification } from '@/types/types';
import StatCard from '../components/StatCard';
import { Ticket, Users, IndianRupee, ExternalLink, X, Calendar, MapPin, Megaphone, Bell, Zap, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCoupons, setRecentCoupons] = useState<Coupon[]>([]);
  const [clusterLiveCoupons, setClusterLiveCoupons] = useState<Coupon[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'VISITS' | 'ISSUED' | null>(null);
  const [modalData, setModalData] = useState<Coupon[]>([]);
  const [activeBroadcast, setActiveBroadcast] = useState<Notification | null>(null);

  const fetchData = async () => {
    if (user?.businessId) {
      const liveStats = await mockService.getStats(user.role, user.businessId);
      setStats(liveStats);
      
      const recent = await mockService.getRecentCoupons(user.businessId);
      setRecentCoupons(recent);
      
      const clusterLive = await mockService.getClusterLiveCoupons(user.businessId);
      setClusterLiveCoupons(clusterLive);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time Polling: Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    if (user?.businessId) {
      mockService.getNotifications(user.businessId).then((notifs) => {
        const unreadBroadcast = notifs.find(n => n.type === 'SYSTEM' && !n.isRead);
        if (unreadBroadcast) setActiveBroadcast(unreadBroadcast);
      });
    }

    return () => clearInterval(interval);
  }, [user]);

  const handleStatClick = async (type: 'VISITS' | 'ISSUED') => {
    if (!user?.businessId) return;
    setModalType(type);
    setShowModal(true);
    const data = await mockService.getCouponsByType(user.businessId, type === 'VISITS' ? 'REDEEMED' : 'ISSUED');
    setModalData(data);
  };

  const closeBroadcast = async () => {
    if (activeBroadcast) {
      await mockService.markNotificationAsRead(activeBroadcast.id);
      setActiveBroadcast(null);
    }
  };

  const chartData = [
    { name: 'Mon', visits: 4 }, { name: 'Tue', visits: 3 }, { name: 'Wed', visits: 7 },
    { name: 'Thu', visits: 5 }, { name: 'Fri', visits: 12 }, { name: 'Sat', visits: 18 }, { name: 'Sun', visits: 14 },
  ];

  return (
    <div className="space-y-6 relative">
      {activeBroadcast && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-4 border-indigo-500">
              <div className="bg-indigo-600 p-6 text-white relative">
                 <button onClick={closeBroadcast} className="absolute top-4 right-4 text-indigo-100"><X size={20} /></button>
                 <div className="flex items-center space-x-3 mb-2">
                    <Megaphone size={28} className="text-indigo-200" />
                    <span className="text-xs font-bold uppercase tracking-widest bg-indigo-500/50 px-2 py-1 rounded">Admin Update</span>
                 </div>
                 <h2 className="text-2xl font-bold leading-tight">{activeBroadcast.title}</h2>
              </div>
              <div className="p-8 text-center">
                 <p className="text-slate-600 leading-relaxed text-lg mb-8">{activeBroadcast.message}</p>
                 <button onClick={closeBroadcast} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">Got it, thanks!</button>
              </div>
           </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{modalType === 'VISITS' ? 'Your Shop Redemptions' : 'Coupons Issued by You'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white sticky top-0 z-10 shadow-sm text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">{modalType === 'VISITS' ? 'Origin Shop' : 'Status'}</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modalData.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>
                  ) : (
                    modalData.map((c, i) => {
                      const myRedemption = c.redemptions.find(r => r.businessId === user?.businessId);
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{c.customerName || 'Guest'}</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{c.customerPhone}</td>
                          <td className="px-6 py-4">
                            {modalType === 'VISITS' ? (
                              <span className="text-indigo-600 font-medium">{c.originBusinessName}</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{c.status}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                             {new Date(modalType === 'VISITS' ? myRedemption?.redeemedAt! : c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personal Business Hub</h1>
          <p className="text-slate-500">Welcome, {user?.name}. Only your business data is shown here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Redemptions at My Shop" 
          value={stats?.couponsRedeemed || 0} 
          icon={Users} color="green" 
          onClick={() => handleStatClick('VISITS')}
        />
        <StatCard 
          title="Coupons Issued by Me" 
          value={stats?.couponsGenerated || 0} 
          icon={Ticket} color="blue" 
          onClick={() => handleStatClick('ISSUED')}
        />
        <StatCard 
          title="My Revenue from Cluster" 
          value={`₹${stats?.revenueFacilitated || 0}`} 
          icon={IndianRupee} color="indigo" 
        />
        <StatCard 
          title="My Revenue from Cluster after discount" 
          value={`₹${stats?.revenueNet || 0}`} 
          icon={TrendingUp} color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">My Customer Traffic</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="visits" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-sm border border-indigo-100 relative">
             <div className="flex items-center space-x-2 mb-4">
               <Zap className="text-indigo-600" size={20} />
               <h2 className="text-lg font-bold text-indigo-900">Cluster Live Feed</h2>
             </div>
             <p className="text-xs text-indigo-700 mb-4">Redeem these coupons at your shop to gain business! Coupons you issued won't appear here.</p>
             <div className="space-y-3">
               {clusterLiveCoupons.length === 0 ? (
                 <div className="p-8 text-center bg-white/50 rounded-xl border border-dashed border-indigo-200">
                    <p className="text-sm text-slate-500">No new partner coupons to redeem.</p>
                 </div>
               ) : (
                 clusterLiveCoupons.map((c, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm hover:border-indigo-400 group">
                       <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                               {c.originBusinessProfilePhoto ? <img src={c.originBusinessProfilePhoto} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{c.originBusinessName.charAt(0)}</div>}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">{c.originBusinessName}</p>
                               <p className="text-xs text-slate-500">For: {c.customerName || 'Customer'}</p>
                            </div>
                          </div>
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white">{c.code}</span>
                       </div>
                       <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Available</span>
                          <Link to="/redeem" className="text-[10px] font-bold text-indigo-600 hover:underline">Redeem Now →</Link>
                       </div>
                    </div>
                 ))
               )}
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Your Recent Activity</h2>
            <div className="space-y-4">
              {recentCoupons.length === 0 ? <p className="text-slate-500 text-sm">No recent activity.</p> : recentCoupons.slice(0, 5).map((c, idx) => {
                const isRedeemedHere = c.redemptions.some(r => r.businessId === user?.businessId);
                return (
                  <div key={idx} className="flex items-start space-x-3 pb-3 border-b border-slate-50 last:border-0">
                    <div className={`mt-1 p-1.5 rounded-full ${isRedeemedHere ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isRedeemedHere ? <Users size={12} /> : <Ticket size={12} />}
                    </div>
                    <div>
                      {/* Fix: Corrected undefined variable isIssuedHere to isRedeemedHere */}
                      <p className="text-sm font-medium text-slate-900">{isRedeemedHere ? 'Customer Redeemed at Your Shop' : 'You Issued a Coupon'}</p>
                      <p className="text-xs text-slate-500">Customer: {c.customerName || 'Guest'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
