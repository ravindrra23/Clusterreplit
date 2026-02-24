
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { Coupon, Business } from '../types';
import { 
  Ticket, CheckCircle, Smartphone, IndianRupee, Send, User, 
  History, Copy, X, AlertCircle, Layers, Printer, Download, Sparkles, Star, ShieldAlert, Group, Type, Clock, Lock
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const IssueCoupon: React.FC = () => {
  const { user } = useAuth();
  
  // Bulk Form State
  const [bulkQuantity, setBulkQuantity] = useState(100);
  const [customTitle, setCustomTitle] = useState('');
  const [bulkIssuedForMe, setBulkIssuedForMe] = useState<Coupon[]>([]);

  const [loading, setLoading] = useState(false);
  const [recentCoupons, setRecentCoupons] = useState<Coupon[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Lock Logic
  const [lockDaysRemaining, setLockDaysRemaining] = useState(0);

  const fetchRecentCoupons = async () => {
    if (user?.businessId) {
      const coupons = await mockService.getCouponsByType(user.businessId, 'ISSUED');
      setRecentCoupons(coupons.slice(0, 10));
    }
  };

  const fetchIssuedForMe = async () => {
    if (user?.businessId) {
      const coupons = await mockService.getBulkCouponsIssuedForMe(user.businessId);
      setBulkIssuedForMe(coupons);
    }
  };

  const refreshData = () => {
    if (user?.businessId) {
      mockService.getBusinessById(user.businessId).then(b => {
        if (b) {
          setBusiness(b);
          setBulkQuantity(b.maxCouponsPerBatch || 100);
          
          // Check Lock
          if (b.lastBulkIssueAt) {
            const now = new Date();
            const lastIssueDate = new Date(b.lastBulkIssueAt);
            const diffTime = Math.abs(now.getTime() - lastIssueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 40) {
              setLockDaysRemaining(40 - diffDays);
            } else {
              setLockDaysRemaining(0);
            }
          }
        }
      });
      fetchRecentCoupons();
      fetchIssuedForMe();
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Poll every 10s for admin unlocks
    return () => clearInterval(interval);
  }, [user]);

  const handleBulkSubmit = async () => {
    if (!user?.businessId) return;
    setLoading(true);
    setError(null);
    try {
      await mockService.generateBulkCoupons(
        user.businessId, 
        bulkQuantity, 
        10,
        customTitle
      );
      setError("Success! Bulk coupons generated and distributed to your cluster partners.");
      setCustomTitle('');
      refreshData();
    } catch (err: any) {
      setError(err.message || "Failed to generate bulk coupons.");
    } finally {
      setLoading(false);
    }
  };

  const downloadIssuedForMePDF = () => {
    if (bulkIssuedForMe.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const cardWidth = (pageWidth - margin * 4) / 3;
    const cardHeight = 75; 
    let x = margin;
    let y = margin;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`My Shop Coupons - ${business?.name}`, margin, margin + 5);
    y += 15;

    bulkIssuedForMe.forEach((coupon, index) => {
      doc.setDrawColor(79, 70, 229); 
      doc.setLineWidth(0.5);
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, cardWidth, cardHeight, 'FD');
      
      doc.setFillColor(79, 70, 229); 
      doc.rect(x, y, cardWidth, 10, 'F');
      
      doc.setFontSize(5.5);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Redeem this coupon at our cluster members", x + cardWidth / 2, y + 6, { align: 'center' });
      
      if (coupon.customTitle) {
        doc.setFontSize(11); 
        doc.setTextColor(0, 0, 0); 
        doc.setFont("helvetica", "bold");
        doc.text(coupon.customTitle.toUpperCase(), x + cardWidth / 2, y + 15, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "bold");
      doc.text("CLUSTER GROWTH", x + cardWidth / 2, y + 20, { align: 'center' });
      
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Sponsor Shop: ${coupon.originBusinessName}`, x + cardWidth / 2, y + 25, { align: 'center' });

      doc.setFontSize(26); 
      doc.setTextColor(15, 23, 42); 
      doc.setFont("helvetica", "bold");
      const discountLabel = coupon.discountType === 'PERCENTAGE' 
        ? `${coupon.discountValue}%` 
        : `Rs. ${coupon.discountValue}`;
      doc.text(discountLabel, x + cardWidth / 2, y + 38, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text("OFF", x + cardWidth / 2, y + 45, { align: 'center' });
      
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "bold");
      doc.text(`VALID AT: ${business?.name}`, x + cardWidth / 2, y + 51, { align: 'center' });
      
      if (business?.ownerAddress) {
        doc.setFontSize(5.5);
        doc.setTextColor(0, 0, 0); 
        doc.setFont("helvetica", "bold");
        doc.text(business.ownerAddress, x + cardWidth / 2, y + 54.5, { align: 'center', maxWidth: cardWidth - 10 });
      }

      if (coupon.discountMinPurchase) {
        doc.setFontSize(5.5);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.text(`On purchase above Rs. ${coupon.discountMinPurchase}`, x + cardWidth / 2, y + 57.5, { align: 'center' });
      }

      doc.setFillColor(248, 250, 252);
      doc.rect(x + 4, y + 59, cardWidth - 8, 10, 'F');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(coupon.code, x + cardWidth / 2, y + 65.5, { align: 'center' });
      
      doc.setFontSize(8); 
      doc.setTextColor(0, 0, 0); 
      doc.setFont("helvetica", "bold"); 
      doc.text(`Expiry: ${new Date(coupon.expiryDate).toLocaleDateString()}`, x + cardWidth / 2, y + 72, { align: 'center' });

      x += cardWidth + margin;
      if (x + cardWidth > pageWidth) {
        x = margin;
        y += cardHeight + margin;
      }
      
      if (y + cardHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
        x = margin;
      }
    });

    doc.save(`Distributed_Cluster_Coupons_${business?.name.replace(/\s+/g, '_')}.pdf`);
  };

  const hasBulkAccess = !!business?.isBulkEnabled;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Issue Coupons</h1>
          <p className="text-slate-500 mt-1">Generate bulk network-wide rewards for your cluster.</p>
        </div>
      </div>

      {!hasBulkAccess ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-200 shadow-sm">
           <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">Bulk Access Restricted</h2>
           <p className="text-slate-500 max-w-md mx-auto font-medium">
              Admin has currently revoked your bulk coupon issuance rights. Please contact platform support.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className={`border-2 rounded-2xl p-4 flex items-start space-x-3 ${error.includes('Success') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                 {error.includes('Success') ? <CheckCircle size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                 <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-6">
                {/* GENERATION SECTION */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
                  {lockDaysRemaining > 0 && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
                       <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                          <Lock size={32} />
                       </div>
                       <h3 className="text-xl font-black text-slate-900">Issuance Locked</h3>
                       <p className="text-slate-600 max-w-xs mt-2 font-medium">
                         You can issue bulk coupons once every 40 days. 
                         <span className="block text-indigo-600 font-bold mt-2">Days Remaining: {lockDaysRemaining} Days</span>
                       </p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-6 tracking-widest">
                         Contact Super Admin for emergency unlock
                       </p>
                    </div>
                  )}

                  <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center space-x-3">
                      <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                        <Layers size={24} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">Sponsor Bulk Campaign</h2>
                  </div>

                  <div className="p-8 space-y-6">
                      <p className="text-slate-500 text-sm font-medium">
                        Your authorized limit is <span className="text-indigo-600 font-black">{business?.maxCouponsPerBatch || 100}</span> coupons per batch. 
                        Once generated, this feature will lock for 40 days.
                      </p>
                      
                      <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                            <Type size={14} className="mr-2" /> Custom Campaign Title
                          </label>
                          <input 
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="e.g. MEGA SALE"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold"
                            maxLength={12}
                          />
                      </div>

                      <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Quantity (Your Limit: {business?.maxCouponsPerBatch || 100})</label>
                          <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 text-center">
                             <span className="text-4xl font-black text-indigo-600">{business?.maxCouponsPerBatch || 100}</span>
                             <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mt-1">Units Allocated</span>
                          </div>
                      </div>
                      
                      <button 
                        onClick={handleBulkSubmit} 
                        disabled={loading || lockDaysRemaining > 0} 
                        className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? 'Generating...' : `Generate ${business?.maxCouponsPerBatch || 100} Network Coupons`}
                      </button>
                  </div>
                </div>

                {/* DOWNLOAD SECTION FOR ME */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Printer size={120} /></div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><Download size={24} /></div>
                            <h3 className="text-2xl font-black">Coupons Issued for My Shop</h3>
                        </div>
                        <p className="text-indigo-100 font-medium">
                          Partners have generated {bulkIssuedForMe.length} coupons to be redeemed at your shop. Download and print them.
                        </p>
                        <button 
                          onClick={downloadIssuedForMePDF} 
                          disabled={bulkIssuedForMe.length === 0}
                          className="bg-white text-indigo-700 px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Printer size={20} />
                          <span>Download Print PDF ({bulkIssuedForMe.length})</span>
                        </button>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><History size={20} className="mr-2 text-indigo-600" /> Recent Activity</h3>
                <div className="space-y-4">
                  {recentCoupons.length === 0 ? (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-10">No recent logs</p>
                  ) : recentCoupons.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${c.isBulk ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>{c.isBulk ? <Layers size={14} /> : <User size={14} />}</div>
                            <div>
                                <p className="text-xs font-black text-slate-900">{c.code}</p>
                                <p className="text-[10px] text-slate-500 font-bold">
                                    {c.isBulk ? `Campaign: ${c.customTitle || 'Network'}` : c.customerName}
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                  ))}
                </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white">
               <div className="flex items-center space-x-3 mb-4">
                  <Clock size={20} className="text-indigo-400" />
                  <h4 className="font-black text-sm uppercase tracking-widest">Usage Policy</h4>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Digital coupons are distributed to all partners in your cluster. You can sponsor one campaign per month (40 days) to ensure network health.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCoupon;
