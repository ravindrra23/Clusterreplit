
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { Coupon } from '@/types/types';
import { Search, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

const ActivityLog: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Coupon[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ISSUED' | 'REDEEMED'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.businessId) {
      mockService.getAllActivity(user.businessId).then(setActivities);
    }
  }, [user]);

  const filteredActivities = activities.filter(item => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'ISSUED' ? item.originBusinessId === user?.businessId :
      // Fix: Corrected property access to check if business has redeemed this coupon
      filter === 'REDEEMED' ? item.redemptions.some(r => r.businessId === user?.businessId) : true;
    
    const matchesSearch = 
      (item.customerName?.toLowerCase().includes(search.toLowerCase())) ||
      (item.customerPhone.includes(search)) ||
      (item.code.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-slate-500">Complete history of coupons issued and redeemed.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setFilter('ALL')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             All
           </button>
           <button 
             onClick={() => setFilter('ISSUED')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'ISSUED' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             Issued
           </button>
           <button 
             onClick={() => setFilter('REDEEMED')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'REDEEMED' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             Redeemed
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Search by name, phone or code..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
           </div>
           <div className="hidden md:flex items-center text-sm text-slate-500">
             <Filter size={16} className="mr-2" />
             <span>Showing {filteredActivities.length} records</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                     No activity found matching your criteria.
                   </td>
                </tr>
              ) : (
                filteredActivities.map((coupon, idx) => {
                  const isIssued = coupon.originBusinessId === user?.businessId;
                  // Fix: Lookup the specific redemption record for this business to get redeemedAt date
                  const myRedemption = coupon.redemptions.find(r => r.businessId === user?.businessId);
                  const displayDate = isIssued ? coupon.createdAt : (myRedemption?.redeemedAt || coupon.createdAt);
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-2 font-medium ${isIssued ? 'text-blue-600' : 'text-green-600'}`}>
                           {isIssued ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                           <span>{isIssued ? 'Issued' : 'Redeemed'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-mono text-xs text-slate-500 mb-1">{coupon.code}</div>
                         <div className="text-slate-900 font-medium">
                           {isIssued ? 'To Customer' : `From ${coupon.originBusinessName}`}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">{coupon.customerName || 'Guest'}</div>
                        <div className="text-xs text-slate-500">{coupon.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              coupon.status === 'REDEEMED' 
                                ? 'bg-green-100 text-green-700' 
                                : coupon.status === 'EXPIRED' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {new Date(displayDate).toLocaleDateString()}
                        <div className="text-xs text-slate-400">
                          {new Date(displayDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
