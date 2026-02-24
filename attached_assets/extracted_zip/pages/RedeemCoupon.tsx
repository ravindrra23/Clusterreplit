
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { Coupon, DiscountRule } from '../types';
import { QrCode, Search, CheckCircle, XCircle, ShoppingBag, IndianRupee, AlertCircle, RefreshCw, Gift, Sparkles, X } from 'lucide-react';

const RedeemCoupon: React.FC = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
  const [message, setMessage] = useState('');
  const [scannedCoupon, setScannedCoupon] = useState<Coupon | null>(null);
  const [discountToApply, setDiscountToApply] = useState<DiscountRule | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  
  // Lucky Draw State
  const [showLuckyModal, setShowLuckyModal] = useState(false);
  
  // Validation State
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.businessId || !code) return;

    setLoading(true);
    setStatus('IDLE');
    setRedeemed(false);
    setPurchaseAmount('');
    setAmountError(null);
    setShowLuckyModal(false);
    
    try {
      const result = await mockService.validateCoupon(code, user.businessId);
      
      if (result.valid && result.coupon && result.discount) {
        setStatus('VALID');
        setScannedCoupon(result.coupon);
        setDiscountToApply(result.discount);
        setMessage(result.message);
      } else {
        setStatus('INVALID');
        setMessage(result.message);
        setScannedCoupon(null);
        setDiscountToApply(null);
      }
    } catch (err) {
      setStatus('INVALID');
      setMessage("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!user?.businessId || !scannedCoupon || !discountToApply) return;
    
    setAmountError(null);
    const amount = parseFloat(purchaseAmount);

    if (!purchaseAmount || isNaN(amount)) {
      setAmountError("Please enter the total bill amount.");
      return;
    }

    if (amount < discountToApply.minPurchase) {
       setAmountError(`Bill must be at least ₹${discountToApply.minPurchase} for this coupon.`);
       return;
    }
    
    setLoading(true);
    try {
      await mockService.redeemCoupon(scannedCoupon.code, user.businessId, amount);
      setRedeemed(true);
      
      // If coupon has a lucky gift, show the celebratory modal
      if (scannedCoupon.luckyGift) {
        setTimeout(() => {
          setShowLuckyModal(true);
        }, 800);
      }
    } catch (err: any) {
      setAmountError(err.message || "Redemption failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStatus('IDLE');
    setCode('');
    setPurchaseAmount('');
    setScannedCoupon(null);
    setDiscountToApply(null);
    setRedeemed(false);
    setShowLuckyModal(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* LUCKY DRAW SURPRISE MODAL */}
      {showLuckyModal && scannedCoupon?.luckyGift && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-hidden">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 relative border-4 border-amber-400">
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-400 to-transparent opacity-20 pointer-events-none"></div>
              
              <div className="p-10 text-center relative z-10">
                 <div className="flex justify-center mb-6 relative">
                    <div className="absolute inset-0 animate-ping bg-amber-200 rounded-full opacity-50"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl relative">
                       <Gift size={48} className="text-white animate-bounce" />
                    </div>
                    <Sparkles className="absolute -top-4 -right-4 text-amber-500 animate-pulse" size={32} />
                    <Sparkles className="absolute -bottom-4 -left-4 text-amber-500 animate-pulse delay-75" size={24} />
                 </div>

                 <h2 className="text-3xl font-black text-slate-900 leading-tight">Lucky Draw Surprise!</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Congratulations, You Won</p>
                 
                 <div className="my-8 p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                    <p className="text-4xl font-black text-amber-600 tracking-tighter uppercase">{scannedCoupon.luckyGift}</p>
                 </div>

                 <p className="text-sm text-slate-600 font-medium leading-relaxed mb-8 px-4">
                    This special gift was randomly assigned to this coupon by the network. Please collect your prize from the shop counter!
                 </p>

                 <button 
                   onClick={() => setShowLuckyModal(false)}
                   className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
                 >
                   Collect Gift & Close
                 </button>
              </div>
           </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Redeem Coupon</h1>
        <p className="text-slate-500 mt-1 font-medium">Validate customer coupons and apply network discounts.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 lg:p-10">
          <form onSubmit={handleVerify} className="mb-8">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Scan or Enter Code
            </label>
            <div className="flex space-x-3">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <QrCode className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none text-xl font-mono font-black uppercase transition-all"
                  placeholder="CG-XXXXXX"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !code}
                className="bg-slate-900 text-white px-8 rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : 'Verify'}
              </button>
            </div>
          </form>

          {status === 'INVALID' && (
            <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex items-start space-x-4 animate-in slide-in-from-top-4 duration-300">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-900">Verification Failed</h3>
                <p className="text-red-700 font-bold mt-1 text-sm leading-relaxed">{message}</p>
                <button onClick={resetForm} className="mt-4 text-xs font-black text-red-800 uppercase tracking-widest hover:underline">Try another code</button>
              </div>
            </div>
          )}

          {status === 'VALID' && discountToApply && scannedCoupon && (
            <div className="border-2 border-indigo-100 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-indigo-100/50 animate-in zoom-in-95 duration-500">
              {/* Status Header */}
              <div className="bg-emerald-500 p-6 flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                    <CheckCircle size={28} />
                    <span className="text-lg font-black uppercase tracking-wider">Valid Coupon Found</span>
                </div>
                <button onClick={resetForm} className="p-1 hover:bg-white/20 rounded-lg"><X size={20} /></button>
              </div>

              {/* Offer Details */}
              <div className="p-8 text-center space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Benefit</p>
                <div className="inline-block px-8 py-4 bg-indigo-50 rounded-3xl">
                   <div className="text-5xl font-black text-indigo-600">
                    {discountToApply.type === 'PERCENTAGE' ? `${discountToApply.value}%` : `₹${discountToApply.value}`}
                  </div>
                  <div className="text-lg font-black text-indigo-900 mt-1 uppercase tracking-tighter">Instant Discount</div>
                </div>
                
                <div>
                   <p className="text-slate-600 font-bold">{discountToApply.description}</p>
                   <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">Issued By: {scannedCoupon.originBusinessName}</p>
                </div>

                {!redeemed ? (
                  <div className="pt-8 space-y-4 text-left">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Final Bill Amount (Total)</label>
                       <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <IndianRupee size={22} />
                          </div>
                          <input
                            type="number"
                            autoFocus
                            value={purchaseAmount}
                            onChange={(e) => {
                                setPurchaseAmount(e.target.value);
                                setAmountError(null);
                            }}
                            className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none text-2xl font-black transition-all"
                            placeholder="0.00"
                          />
                       </div>
                       {amountError && (
                         <div className="flex items-center mt-3 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">
                            <AlertCircle size={14} className="mr-2 shrink-0" />
                            <span>{amountError}</span>
                         </div>
                       )}
                       {discountToApply.minPurchase > 0 && !amountError && (
                         <p className="text-[10px] text-indigo-500 font-black mt-3 ml-1 uppercase tracking-widest flex items-center">
                            <RefreshCw size={10} className="mr-1.5" /> Minimum bill required: ₹{discountToApply.minPurchase}
                         </p>
                       )}
                    </div>

                    <button
                      onClick={handleRedeem}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center space-x-3 text-lg"
                    >
                      <ShoppingBag size={24} />
                      <span>{loading ? 'Processing...' : 'Apply & Complete Redemption'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Redemption Complete!</h3>
                    <p className="text-slate-500 font-medium mt-2">Bill recorded: ₹{purchaseAmount}</p>
                    
                    <button 
                      onClick={resetForm}
                      className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                    >
                      Process Next Customer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Secure Platform Verification</p>
      </div>
    </div>
  );
};

export default RedeemCoupon;
