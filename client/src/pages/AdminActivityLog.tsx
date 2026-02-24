
import React, { useEffect, useState } from 'react';
import { mockService } from '@/services/mockService';
import { Coupon } from '@/types/types';
import { Search, ArrowUpRight, ArrowDownLeft, Filter, Gift, Download, FileText, Printer, ChevronRight, ArrowRight } from 'lucide-react';
import { jsPDF } from 'jspdf';

const AdminActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    mockService.getGlobalActivity().then(setActivities);
  }, []);

  const filteredActivities = activities.filter(item => {
    const searchLower = search.toLowerCase();
    const customerMatch = item.customerName?.toLowerCase().includes(searchLower) ?? false;
    const phoneMatch = item.customerPhone.includes(search);
    const codeMatch = item.code.toLowerCase().includes(searchLower);
    const bizMatch = item.originBusinessName.toLowerCase().includes(searchLower);
    const giftMatch = item.luckyGift?.toLowerCase().includes(searchLower) ?? false;

    return customerMatch || phoneMatch || codeMatch || bizMatch || giftMatch;
  });

  // Group campaigns based on Issuer (Origin) and Target Shop
  const campaignPairs = Array.from(
    new Set(
      activities
        .filter(c => c.targetBusinessId) // Only bulk/targeted coupons
        .map(c => `${c.originBusinessId}|${c.targetBusinessId}`)
    )
  ).map(pair => {
    const [originId, targetId] = (pair as string).split('|');
    const firstCoupon = activities.find(c => c.originBusinessId === originId && c.targetBusinessId === targetId);
    return {
      originId,
      targetId,
      originName: firstCoupon?.originBusinessName || 'Unknown Issuer',
      targetName: firstCoupon?.targetBusinessName || 'Unknown Target'
    };
  });

  const downloadCampaignPDF = (originId: string, targetId: string, originName: string, targetName: string) => {
    const targetCoupons = activities.filter(c => c.originBusinessId === originId && c.targetBusinessId === targetId);
    
    const doc = new jsPDF();
    
    // Modern Header Design
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`ISSUED BY: ${originName.toUpperCase()}`, 15, 15);
    
    doc.setFontSize(22);
    doc.text("Targeted Redemption List", 15, 28);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`For Merchant: ${targetName}`, 15, 38);

    doc.setFontSize(8);
    doc.text(`Generation Date: ${new Date().toLocaleString()}`, 195, 15, { align: 'right' });
    
    // Table Config
    const headers = ["Date", "Code", "Customer", "Offer", "Gift Won", "Status"];
    const colWidths = [25, 30, 40, 25, 45, 25]; // Total 190
    let y = 65;
    
    // Table Header Background
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y - 6, 190, 10, 'F');
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    
    let x = 12;
    headers.forEach((h, i) => {
      doc.text(h, x, y);
      x += colWidths[i];
    });
    
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    targetCoupons.forEach((c) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      x = 12;
      const dateStr = new Date(String(c.createdAt)).toLocaleDateString();
      const discountStr = c.discountValue ? `${c.discountValue}${c.discountType === 'PERCENTAGE' ? '%' : ' Rs'}` : 'Std';
      const luckyGiftStr = c.luckyGift || '-';
      
      doc.text(dateStr, x, y);
      doc.text(c.code, x + colWidths[0], y);
      doc.text(c.customerName || c.customerPhone, x + colWidths[0] + colWidths[1], y);
      doc.text(discountStr, x + colWidths[0] + colWidths[1] + colWidths[2], y);
      
      // Highlight Lucky Gift if exists
      if (c.luckyGift) {
        doc.setTextColor(180, 83, 9); // Amber 700
        doc.setFont("helvetica", "bold");
      }
      doc.text(luckyGiftStr, x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");

      // Status Styling
      if (c.status === 'REDEEMED') doc.setTextColor(22, 163, 74);
      else if (c.status === 'EXPIRED') doc.setTextColor(220, 38, 38);
      else doc.setTextColor(37, 99, 235);
      
      doc.text(c.status, x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y);
      
      doc.setTextColor(71, 85, 105);
      doc.setDrawColor(241, 245, 249);
      doc.line(10, y + 2, 200, y + 2);
      
      y += 8;
    });
    
    doc.save(`Issued_for_${targetName.replace(/\s+/g, '_')}_by_${originName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Activity Log</h1>
          <p className="text-slate-500">Real-time platform-wide activity feed with lucky draw tracking.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Printer size={18} />
            <span>Download Reports by Merchant</span>
          </button>

          {isExportMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Select Targeted Campaign</div>
                <div className="max-h-80 overflow-y-auto">
                  {campaignPairs.length === 0 ? (
                    <p className="px-5 py-3 text-xs text-slate-400 italic">No targeted data available</p>
                  ) : (
                    campaignPairs.map(pair => (
                      <button 
                        key={`${pair.originId}-${pair.targetId}`}
                        onClick={() => { downloadCampaignPDF(pair.originId, pair.targetId, pair.originName, pair.targetName); setIsExportMenuOpen(false); }}
                        className="w-full text-left px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Sponsor: {pair.originName}</span>
                          <Download size={12} className="text-slate-300 group-hover:text-indigo-600" />
                        </div>
                        <div className="flex items-center text-sm font-black text-slate-800">
                          <ArrowRight className="mr-2 text-indigo-400" size={14} />
                          <span className="truncate">For: {pair.targetName}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Search business, gift, or code..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
           </div>
           <div className="hidden md:flex items-center text-sm text-slate-500">
             <Filter size={16} className="mr-2" />
             <span>Total {filteredActivities.length} logs</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Issuing Merchant</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Lucky Gift</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                     No records found.
                   </td>
                </tr>
              ) : (
                filteredActivities.map((coupon, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-2 font-medium ${coupon.status === 'REDEEMED' ? 'text-green-600' : 'text-blue-600'}`}>
                           {coupon.status === 'REDEEMED' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                           <span>{coupon.status === 'REDEEMED' ? 'Redeemed' : 'Issued'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-mono text-[10px] text-slate-400 mb-1 tracking-tighter">{coupon.code}</div>
                         <div className="text-slate-900 font-bold leading-tight">
                           {coupon.originBusinessName}
                         </div>
                         {coupon.targetBusinessName && (
                           <div className="text-[10px] text-indigo-500 font-bold mt-0.5">Valid at: {coupon.targetBusinessName}</div>
                         )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">{coupon.customerName || 'Guest'}</div>
                        <div className="text-xs text-slate-500">{coupon.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.luckyGift ? (
                          <div className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                             <Gift size={12} className="mr-1.5" />
                             {coupon.luckyGift}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">None</span>
                        )}
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
                        {new Date(String(coupon.createdAt)).toLocaleDateString()}
                        <div className="text-xs text-slate-400">
                          {new Date(String(coupon.createdAt)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

export default AdminActivityLog;
