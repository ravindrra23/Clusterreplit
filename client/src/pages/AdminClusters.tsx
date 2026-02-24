
import React, { useEffect, useState } from 'react';
import { mockService } from '../services/mockService';
import { Cluster, Business } from '../types';
import { Map, Plus, MoreHorizontal, Trash2, Calendar, Eye, X, AlertTriangle, Download, Store, User, ChevronRight, Ticket, CheckCircle, Clock, XCircle, Activity, Heart, Edit } from 'lucide-react';

const AdminClusters: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);
  const [viewCluster, setViewCluster] = useState<Cluster | null>(null);
  const [clusterBusinesses, setClusterBusinesses] = useState<Business[]>([]);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterCity, setNewClusterCity] = useState('');
  const [newClusterExpiry, setNewClusterExpiry] = useState('');

  const refreshClusters = () => {
    mockService.getClusters().then(setClusters);
  };

  useEffect(() => {
    refreshClusters();
    const interval = setInterval(refreshClusters, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (viewCluster) {
      mockService.getBusinessesByCluster(viewCluster.id).then(setClusterBusinesses);
    } else {
      setClusterBusinesses([]);
    }
  }, [viewCluster]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClusterName || !newClusterCity || !newClusterExpiry) return;

    await mockService.addCluster({
      name: newClusterName,
      city: newClusterCity,
      expiryDate: new Date(newClusterExpiry).toISOString()
    });

    setIsAddModalOpen(false);
    setNewClusterName('');
    setNewClusterCity('');
    setNewClusterExpiry('');
    refreshClusters();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCluster || !newClusterName || !newClusterCity || !newClusterExpiry) return;

    await mockService.updateCluster(editingCluster.id, {
      name: newClusterName,
      city: newClusterCity,
      expiryDate: new Date(newClusterExpiry).toISOString()
    });

    setIsEditModalOpen(false);
    setEditingCluster(null);
    setNewClusterName('');
    setNewClusterCity('');
    setNewClusterExpiry('');
    refreshClusters();
  };

  const openEditModal = (cluster: Cluster) => {
    setEditingCluster(cluster);
    setNewClusterName(cluster.name);
    setNewClusterCity(cluster.city);
    setNewClusterExpiry(new Date(cluster.expiryDate).toISOString().split('T')[0]);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const initiateDelete = (id: string) => {
    setDeleteId(id);
    setActiveMenu(null); 
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await mockService.deleteCluster(deleteId);
      refreshClusters();
      setDeleteId(null);
    }
  };

  const openAddModal = () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setNewClusterExpiry(nextYear.toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Stable';
    return 'Low Activity';
  };

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      
      {activeMenu && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default"
          onClick={() => setActiveMenu(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 text-center">
                 <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Cluster?</h3>
                 <p className="text-sm text-slate-500 mb-6">
                    Are you sure you want to delete this cluster? This action cannot be undone and may affect associated businesses.
                 </p>
                 <div className="flex space-x-3">
                    <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm">Yes, Delete</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Add New Cluster</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cluster Name</label>
                <input type="text" required value={newClusterName} onChange={(e) => setNewClusterName(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Northside Market" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City/Region</label>
                <input type="text" required value={newClusterCity} onChange={(e) => setNewClusterCity(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. New Delhi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Expiry</label>
                <input type="date" required value={newClusterExpiry} onChange={(e) => setNewClusterExpiry(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95">Create Cluster</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-900">Edit Cluster</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-indigo-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-100">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cluster Name</label>
                <input type="text" required value={newClusterName} onChange={(e) => setNewClusterName(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Northside Market" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City/Region</label>
                <input type="text" required value={newClusterCity} onChange={(e) => setNewClusterCity(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. New Delhi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Expiry</label>
                <input type="date" required value={newClusterExpiry} onChange={(e) => setNewClusterExpiry(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewCluster && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewCluster(null)}></div>
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="bg-indigo-600 p-8 text-white">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Map size={32} className="text-white" />
                 </div>
                 <button onClick={() => setViewCluster(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <h2 className="text-3xl font-bold">{viewCluster.name}</h2>
              <div className="flex items-center space-x-4 mt-2">
                 <p className="text-indigo-100 flex items-center text-lg">
                    <Map size={20} className="mr-2 opacity-70" /> {viewCluster.city}
                 </p>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthColor(viewCluster.healthScore || 0)}`}>
                   Health: {viewCluster.healthScore}% ({getHealthLabel(viewCluster.healthScore || 0)})
                 </span>
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-slate-100">
               <div className="p-4 text-center border-r border-slate-100">
                  <p className="text-xl font-bold text-indigo-600">{viewCluster.totalIssued || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Issued</p>
               </div>
               <div className="p-4 text-center border-r border-slate-100">
                  <p className="text-xl font-bold text-green-600">{viewCluster.activeCoupons || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active</p>
               </div>
               <div className="p-4 text-center border-r border-slate-100">
                  <p className="text-xl font-bold text-blue-600">{viewCluster.redeemedCount || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Redeemed</p>
               </div>
               <div className="p-4 text-center">
                  <p className="text-xl font-bold text-red-600">{viewCluster.expiredCoupons || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Expired</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Store size={20} className="mr-2 text-indigo-600" /> Cluster Members
                  </h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{clusterBusinesses.length} registered</span>
               </div>

               <div className="space-y-4">
                  {clusterBusinesses.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                       <Store size={40} className="mx-auto text-slate-300 mb-3" />
                       <p className="text-slate-500 font-medium">No businesses in this cluster yet.</p>
                    </div>
                  ) : (
                    clusterBusinesses.map(biz => (
                      <div key={biz.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                               <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                  {biz.profilePhotoUrl ? (
                                    <img src={biz.profilePhotoUrl} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{biz.name.charAt(0)}</div>
                                  )}
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{biz.name}</h4>
                                  <div className="flex items-center text-xs text-slate-500 mt-1">
                                     <User size={12} className="mr-1" /> {biz.ownerName}
                                  </div>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                 biz.subscriptionStatus === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                               }`}>
                                 {biz.subscriptionStatus}
                               </span>
                               <p className="text-[10px] text-slate-400 mt-1">{biz.category}</p>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
               <button onClick={() => mockService.downloadClusterSpecificData(viewCluster.id)} className="flex items-center justify-center space-x-2 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                  <Download size={18} />
                  <span>Download Data</span>
               </button>
               <button onClick={() => setViewCluster(null)} className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg active:scale-95">Done</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cluster Management</h1>
          <p className="text-slate-500 mt-1">Manage geographical networks and track their growth health.</p>
        </div>
        <button onClick={openAddModal} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-indigo-700 shadow-lg transition-all active:scale-95">
          <Plus size={20} className="mr-2" /> Add Cluster
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clusters.map(cluster => {
          const isMenuOpen = activeMenu === cluster.id;
          const health = cluster.healthScore || 0;
          
          return (
            <div key={cluster.id} onClick={() => setViewCluster(cluster)} className={`relative bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group ${isMenuOpen ? 'z-50 ring-4 ring-indigo-50/50' : 'z-auto'}`}>
              
              <div className="absolute top-6 right-6" onClick={(e) => e.stopPropagation()}>
                 <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : cluster.id); }} className={`p-2 rounded-xl transition-colors ${isMenuOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                  <MoreHorizontal size={20} />
                 </button>
                 {isMenuOpen && (
                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-[60] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setViewCluster(cluster); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 flex items-center font-medium"><Eye size={16} className="mr-3 text-slate-400" /> View Details</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); openEditModal(cluster); }} className="w-full text-left px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center font-bold"><Edit size={16} className="mr-3" /> Edit Cluster</button>
                      <div className="h-px bg-slate-100 my-1 mx-2"></div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); initiateDelete(cluster.id); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center font-bold"><Trash2 size={16} className="mr-3" /> Delete Cluster</button>
                   </div>
                 )}
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                  <Map size={32} />
                </div>
                <div className="flex flex-col items-end">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border mb-1 ${getHealthColor(health)}`}>
                     Health: {health}%
                   </span>
                   <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${health >= 80 ? 'bg-emerald-500' : health >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${health}%` }}></div>
                   </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{cluster.name}</h3>
              <p className="text-slate-500 text-sm mb-6 flex items-center font-medium">
                <Map size={14} className="mr-1 opacity-50" /> {cluster.city}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center text-indigo-600 mb-1">
                       <Store size={14} className="mr-1" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Businesses</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{cluster.businessCount}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center text-blue-600 mb-1">
                       <Ticket size={14} className="mr-1" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Redeemed</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{cluster.redeemedCount || 0}</p>
                 </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                   <Calendar size={14} className="text-slate-400" />
                   <span>Exp: {new Date(cluster.expiryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                   <span>Full Analytics</span>
                   <ChevronRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminClusters;
