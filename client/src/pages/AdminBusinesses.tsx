
import React, { useEffect, useState, useRef } from 'react';
import { mockService } from '../services/mockService';
import { Business, Cluster, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Store, Search, Filter, MoreHorizontal, Trash2, Eye, 
  MapPin, ToggleRight, ToggleLeft, User, ShieldCheck, X, AlertTriangle, Plus, Smartphone, Calendar, Home, Phone, RotateCcw, Check, Edit, Unlock, Ticket
} from 'lucide-react';

const AdminBusinesses: React.FC = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Edit Mode State
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // Reset Modal State
  const [resetModalId, setResetModalId] = useState<string | null>(null);
  const [resetOptions, setResetOptions] = useState({
    clearCoupons: true,
    resetRedemptions: true
  });
  const [isResetting, setIsResetting] = useState(false);

  // Registration/Edit Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    ownerName: '',
    ownerAddress: '',
    phone: '',
    clusterId: '',
    category: 'Restaurant',
    expiryDate: '',
    maxCouponsPerBatch: 100 // New: Default
  });

  const menuRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    mockService.getBusinesses().then(setBusinesses);
    mockService.getClusters().then(data => {
      setClusters(data);
      if (data.length > 0 && !regForm.clusterId) {
        setRegForm(prev => ({ ...prev, clusterId: data[0].id }));
      }
    });
  };

  useEffect(() => {
    refreshData();
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setRegForm(prev => ({ ...prev, expiryDate: date.toISOString().split('T')[0] }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleBulkAccess = async (id: string, current: boolean) => {
    await mockService.toggleBulkAccess(id, !current);
    refreshData();
    setActiveMenu(null);
  };

  const handleUnlockIssuance = async (id: string) => {
    await mockService.resetIssueLock(id);
    refreshData();
    setActiveMenu(null);
  };

  const handleDeleteMerchant = async () => {
    if (deleteId) {
      await mockService.deleteBusiness(deleteId);
      refreshData();
      setDeleteId(null);
    }
  };

  const handleResetMerchant = async () => {
    if (!resetModalId) return;
    setIsResetting(true);
    try {
      await mockService.resetMerchantData(resetModalId, resetOptions);
      setResetModalId(null);
      refreshData();
    } catch (err) {
      alert("Reset failed");
    } finally {
      setIsResetting(false);
    }
  };

  const handleEditClick = (biz: Business) => {
    setEditingBusiness(biz);
    setRegForm({
      name: biz.name,
      ownerName: biz.ownerName,
      ownerAddress: biz.ownerAddress || '',
      phone: biz.phone || '',
      clusterId: biz.clusterId,
      category: biz.category,
      expiryDate: new Date(biz.expiryDate).toISOString().split('T')[0],
      maxCouponsPerBatch: biz.maxCouponsPerBatch || 100
    });
    setIsRegModalOpen(true);
    setActiveMenu(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      if (editingBusiness) {
        // Update Existing Business
        await mockService.updateBusinessProfile(editingBusiness.id, {
          ...regForm,
          expiryDate: new Date(regForm.expiryDate).toISOString()
        });
      } else {
        // Create New Business
        await mockService.addBusiness({
          ...regForm,
          expiryDate: new Date(regForm.expiryDate).toISOString()
        });
      }
      
      setIsRegModalOpen(false);
      setEditingBusiness(null);
      setRegForm({
        name: '',
        ownerName: '',
        ownerAddress: '',
        phone: '',
        clusterId: clusters[0]?.id || '',
        category: 'Restaurant',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxCouponsPerBatch: 100
      });
      refreshData();
    } catch (err) {
      console.error(err);
      alert(editingBusiness ? "Update failed" : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-screen pb-20">
      
      {/* Reset Modal */}
      {resetModalId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-hidden">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b border-slate-100 bg-amber-50 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-amber-600">
                   <div className="p-3 bg-amber-100 rounded-2xl">
                      <RotateCcw size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 leading-tight">Reset Merchant Data</h2>
                </div>
                <button onClick={() => setResetModalId(null)} className="text-slate-400 hover:text-slate-600">
                   <X size={28} />
                </button>
             </div>
             
             <div className="p-8 space-y-6">
                <p className="text-slate-500 font-medium">Resetting data will clear real-time stats for <span className="text-slate-900 font-black">{businesses.find(b => b.id === resetModalId)?.name}</span>. Choose what to clear:</p>
                
                <div className="space-y-3">
                   <button 
                     onClick={() => setResetOptions(prev => ({ ...prev, clearCoupons: !prev.clearCoupons }))}
                     className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${resetOptions.clearCoupons ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                   >
                      <div className="flex items-center space-x-4 text-left">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${resetOptions.clearCoupons ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                            {resetOptions.clearCoupons && <Check size={14} className="text-white" />}
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm">Clear Issued Coupons</p>
                            <p className="text-xs text-slate-500 font-medium">Vanishes all coupons issued by this shop platform-wide.</p>
                         </div>
                      </div>
                   </button>

                   <button 
                     onClick={() => setResetOptions(prev => ({ ...prev, resetRedemptions: !prev.resetRedemptions }))}
                     className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${resetOptions.resetRedemptions ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                   >
                      <div className="flex items-center space-x-4 text-left">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${resetOptions.resetRedemptions ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                            {resetOptions.resetRedemptions && <Check size={14} className="text-white" />}
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm">Clear Redemptions & Revenue</p>
                            <p className="text-xs text-slate-500 font-medium">Resets "Redemptions at My Shop" and revenue logs to zero.</p>
                         </div>
                      </div>
                   </button>
                </div>

                <div className="pt-4 flex flex-col space-y-3">
                   <button 
                     onClick={handleResetMerchant}
                     disabled={isResetting || (!resetOptions.clearCoupons && !resetOptions.resetRedemptions)}
                     className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                   >
                     {isResetting ? 'Processing...' : 'Zero Out Selection Now'}
                   </button>
                   <button onClick={() => setResetModalId(null)} className="w-full text-slate-500 font-bold py-2 hover:text-slate-700">Cancel</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Registration/Edit Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 my-8">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                    {editingBusiness ? <Edit size={24} /> : <Plus size={24} />}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {editingBusiness ? `Edit Merchant: ${editingBusiness.name}` : "Register New Merchant"}
                  </h2>
               </div>
               <button onClick={() => { setIsRegModalOpen(false); setEditingBusiness(null); }} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                 <X size={28} />
               </button>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm" placeholder="e.g. Quality Bakers" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Owner Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required value={regForm.ownerName} onChange={e => setRegForm({...regForm, ownerName: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm" placeholder="e.g. Ramesh Kumar" />
                  </div>
               </div>

               <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Business Address</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required value={regForm.ownerAddress} onChange={e => setRegForm({...regForm, ownerAddress: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm" placeholder="Shop No. 12, MG Road, Sector 4..." />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="tel" required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm" placeholder="10-digit mobile number" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Cluster</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select required value={regForm.clusterId} onChange={e => setRegForm({...regForm, clusterId: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm appearance-none">
                       {clusters.map(c => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
                    </select>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Expiry</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="date" required value={regForm.expiryDate} onChange={e => setRegForm({...regForm, expiryDate: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Max Coupons Per Batch</label>
                  <div className="relative">
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="number" required value={regForm.maxCouponsPerBatch} onChange={e => setRegForm({...regForm, maxCouponsPerBatch: Number(e.target.value)})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm" placeholder="Default 100" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select value={regForm.category} onChange={e => setRegForm({...regForm, category: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm appearance-none">
                     <option>Restaurant</option>
                     <option>Salon</option>
                     <option>Retail</option>
                     <option>Gym</option>
                     <option>Medical</option>
                     <option>Other</option>
                  </select>
               </div>

               <div className="md:col-span-2 pt-6">
                  <button type="submit" disabled={regLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50">
                    {regLoading ? (editingBusiness ? "Saving Changes..." : "Registering...") : (editingBusiness ? "Save Changes" : "Onboard Merchant")}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Terminate Merchant?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                This will permanently remove the merchant from the platform and revoke all their cluster-wide coupons.
              </p>
              <div className="flex space-x-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={handleDeleteMerchant} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Merchant Network</h1>
          <p className="text-slate-500 mt-2 font-medium">Control merchant authorization and privilege levels.</p>
        </div>
        <button onClick={() => { setEditingBusiness(null); setIsRegModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
           <Plus size={20} className="mr-2" />
           Register Merchant
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-visible relative">
        <div className="p-6 border-b border-slate-100">
           <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search merchant or shop..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
            </div>
        </div>

        <div className="overflow-visible">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Merchant Details</th>
                <th className="px-6 py-5">Cluster Name</th>
                <th className="px-6 py-5">Issue Rights</th>
                {isSuperAdmin && <th className="px-6 py-5">Limit</th>}
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBusinesses.map(business => (
                <tr key={business.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                     <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-400 border border-indigo-100 group-hover:scale-105 transition-transform duration-300">
                           {business.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 text-base leading-tight">{business.name}</p>
                           <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tight flex items-center">
                              <User size={12} className="mr-1" /> {business.ownerName}
                           </p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="inline-flex items-center px-4 py-1.5 bg-white text-indigo-700 rounded-xl text-xs font-black border border-slate-200 shadow-sm">
                        <MapPin size={12} className="mr-2 opacity-50" />
                        {clusters.find(c => c.id === business.clusterId)?.name || 'Unassigned'}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center space-x-3">
                        <div className={`flex items-center px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                          business.isBulkEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                        }`}>
                           Bulk: {business.isBulkEnabled ? 'ON' : 'OFF'}
                        </div>
                        {business.lastBulkIssueAt && (
                          <div className="flex items-center px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold border border-amber-100">
                             <Ticket size={10} className="mr-1" /> Locked
                          </div>
                        )}
                     </div>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-5">
                       <div className="flex items-center text-slate-700 font-black">
                          <Ticket size={14} className="mr-2 text-indigo-400" />
                          {business.maxCouponsPerBatch || 100}
                       </div>
                    </td>
                  )}
                  <td className="px-6 py-5 text-right relative">
                     <div className="inline-block" ref={activeMenu === business.id ? menuRef : null}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === business.id ? null : business.id);
                          }} 
                          className={`p-2.5 rounded-xl transition-all ${
                            activeMenu === business.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                           <MoreHorizontal size={20} />
                        </button>
                        
                        {activeMenu === business.id && (
                          <div className="absolute right-0 mt-3 w-64 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-50 py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                             <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Management</div>
                             
                             <button 
                               onClick={() => handleEditClick(business)}
                               className="w-full px-5 py-3 text-sm flex items-center font-black text-slate-600 hover:bg-slate-50 transition-colors"
                             >
                                <Edit className="mr-3 text-indigo-600" size={18} />
                                Edit Merchant Details
                             </button>

                             {business.lastBulkIssueAt && (
                               <button 
                                 onClick={() => handleUnlockIssuance(business.id)}
                                 className="w-full px-5 py-3 text-sm flex items-center font-black text-emerald-600 hover:bg-emerald-50 transition-colors"
                               >
                                  <Unlock className="mr-3" size={18} />
                                  Unlock Coupon Issuance
                               </button>
                             )}

                             <button 
                               onClick={() => toggleBulkAccess(business.id, !!business.isBulkEnabled)}
                               className={`w-full px-5 py-3 text-sm flex items-center font-black transition-colors ${
                                 business.isBulkEnabled ? 'text-slate-600 hover:bg-slate-50' : 'text-emerald-600 hover:bg-emerald-50'
                               }`}
                             >
                                {business.isBulkEnabled ? <ToggleRight className="mr-3 text-emerald-600" /> : <ToggleLeft className="mr-3" />}
                                {business.isBulkEnabled ? 'Revoke Bulk Access' : 'Allow Bulk Coupons'}
                             </button>

                             <div className="h-px bg-slate-100 my-2 mx-4"></div>

                             {isSuperAdmin && (
                               <button 
                                 onClick={() => { setResetModalId(business.id); setActiveMenu(null); }}
                                 className="w-full px-5 py-3 text-sm text-amber-600 hover:bg-amber-50 flex items-center font-black transition-colors"
                               >
                                  <RotateCcw size={18} className="mr-3" /> Reset Merchant Stats
                               </button>
                             )}
                             
                             <button 
                               onClick={() => setDeleteId(business.id)}
                               className="w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center font-black"
                             >
                                <Trash2 size={18} className="mr-3" /> Terminate Merchant
                             </button>
                          </div>
                        )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBusinesses.length === 0 && (
            <div className="p-20 text-center text-slate-400">
               <Store size={60} className="mx-auto opacity-10 mb-4" />
               <p className="font-bold uppercase tracking-widest text-xs">No merchants found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBusinesses;
