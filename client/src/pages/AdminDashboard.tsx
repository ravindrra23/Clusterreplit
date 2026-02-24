
import React, { useEffect, useState } from 'react';
import { mockService } from '@/services/mockService';
import { useAuth } from '@/context/AuthContext';
import { Stats, Cluster, UserRole } from '@/types/types';
import StatCard from '@/components/StatCard';
import { LayoutDashboard, Users, Map, IndianRupee, Megaphone, Send, CheckCircle, Target, ShieldAlert, TicketCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats & { totalBusinesses?: number } | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const navigate = useNavigate();
  
  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('all'); 
  const [sending, setSending] = useState(false);
  const [sentStatus, setSentStatus] = useState(false);

  const canViewReports = user?.role === UserRole.SUPER_ADMIN || user?.permissions?.canViewReports;
  const canBroadcast = user?.role === UserRole.SUPER_ADMIN || user?.permissions?.canBroadcast;
  const canManageClusters = user?.role === UserRole.SUPER_ADMIN || user?.permissions?.canManageClusters;
  const canManageBusinesses = user?.role === UserRole.SUPER_ADMIN || user?.permissions?.canManageBusinesses;

  const fetchAdminData = async () => {
    const liveStats = await mockService.getStats(UserRole.SUPER_ADMIN);
    setStats(liveStats);
    const liveClusters = await mockService.getClusters();
    setClusters(liveClusters);
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    
    setSending(true);
    await mockService.broadcastNotification(broadcastTitle, broadcastMessage, targetGroup);
    setSending(false);
    setSentStatus(true);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setTargetGroup('all');
    
    setTimeout(() => setSentStatus(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500 mt-2">
            {user?.role === UserRole.SUPER_ADMIN ? 'Full Platform Control' : `Welcome, ${user?.name} (Staff)`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="Total Clusters" 
          value={canManageClusters ? (stats?.activeClusters || 0) : "Restricted"} 
          icon={Map} 
          color="blue"
          onClick={canManageClusters ? () => navigate('/admin/clusters') : undefined}
        />
         <StatCard 
          title="Active Businesses" 
          value={canManageBusinesses ? (stats?.totalBusinesses || 0) : "Restricted"} 
          icon={Users} 
          color="indigo"
          onClick={canManageBusinesses ? () => navigate('/admin/businesses') : undefined}
        />
        <StatCard 
          title="Issued Coupons" 
          value={canViewReports ? (stats?.couponsGenerated || 0) : "Restricted"} 
          icon={LayoutDashboard} 
          color="orange"
          onClick={canViewReports ? () => navigate('/admin/activity') : undefined}
        />
        <StatCard 
          title="Redeemed Coupons" 
          value={canViewReports ? (stats?.couponsRedeemed || 0) : "Restricted"} 
          icon={TicketCheck} 
          color="green"
          onClick={canViewReports ? () => navigate('/admin/activity') : undefined}
        />
        <StatCard 
          title="Platform Revenue" 
          value={canViewReports ? `₹${stats?.revenueFacilitated?.toLocaleString() || 0}` : "Restricted"} 
          icon={IndianRupee} 
          color="indigo"
          onClick={canViewReports ? () => navigate('/admin/reports') : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Clusters</h2>
            {canManageClusters && (
              <button 
                onClick={() => navigate('/admin/clusters')}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                View All
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Cluster Name</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3 text-center">Businesses</th>
                  <th className="px-6 py-3 text-right">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clusters.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No clusters found.</td></tr>
                ) : (
                  clusters.slice(0, 5).map(cluster => (
                    <tr key={cluster.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/admin/clusters')}>
                      <td className="px-6 py-4 font-medium text-slate-900">{cluster.name}</td>
                      <td className="px-6 py-4">{cluster.city}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
                          {cluster.businessCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-600 font-medium">{cluster.healthScore || 0}%</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {canBroadcast ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex items-center space-x-2">
                <Megaphone className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-indigo-900">Broadcast Message</h2>
            </div>
            <div className="p-6">
                <p className="text-xs text-slate-500 mb-6">Send an announcement to business partners. They will see this on their dashboard.</p>
                
                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                        <Target size={14} className="mr-1 text-slate-400" /> Send To
                      </label>
                      <select
                        value={targetGroup}
                        onChange={(e) => setTargetGroup(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
                      >
                        <option value="all">All Merchants</option>
                        <optgroup label="Specific Clusters">
                            {clusters.filter(c => c.status === 'ACTIVE').map(cluster => (
                              <option key={cluster.id} value={cluster.id}>{cluster.name}</option>
                            ))}
                        </optgroup>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                      <input 
                        type="text" required value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. System Maintenance"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                      <textarea 
                        required value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[100px] outline-none"
                      />
                  </div>
                  <button 
                    type="submit" disabled={sending}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-white font-bold transition-all ${
                      sending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                      {sending ? <span>Sending...</span> : sentStatus ? <CheckCircle size={18} /> : <Send size={18} />}
                      <span>{sending ? '' : sentStatus ? 'Sent' : 'Send Message'}</span>
                  </button>
                </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
             <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                <ShieldAlert size={48} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800">No Broadcast Access</h3>
                <p className="text-xs text-slate-500 mt-1">You don't have permission to send platform-wide notifications.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
