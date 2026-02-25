
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { Business, DiscountRule, LuckyGift } from '@/types/types';
import { Save, User, Image as ImageIcon, Camera, Ticket, Mail, Link, CheckCircle, Trash2, Lock, AlertCircle, Unlock, Home, Gift, Hash, Plus, X, Eye, EyeOff, Smartphone, Key } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1595959183082-7bce7084ec9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1542838686-37da48fab97f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
];

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  
  // Profile State
  const [ownerName, setOwnerName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  // Sub-Merchant State
  const [smEmail, setSmEmail] = useState('');
  const [smPassword, setSmPassword] = useState('');
  const [showSmPass, setShowSmPass] = useState(false);
  const [savingSm, setSavingSm] = useState(false);

  // Discount State
  const [rule, setRule] = useState<DiscountRule>({
    type: 'PERCENTAGE',
    value: 0,
    minPurchase: 0,
    description: '',
    isActive: true
  });

  // Lucky Draw State - Dynamic list
  const [luckyGifts, setLuckyGifts] = useState<LuckyGift[]>([{ name: '', quantity: 0 }]);
  
  // Lock Logic Stats
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Integration State
  const [integrationEmail, setIntegrationEmail] = useState('');
  const [connectingEmail, setConnectingEmail] = useState(false);
  
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.businessId) {
      refreshBusinessData(user.businessId);
    }
  }, [user]);

  const refreshBusinessData = (id: string) => {
    mockService.getBusinessById(id).then(b => {
        if (b) {
          setBusiness(b);
          setRule(b.discountRule);
          setOwnerName(b.ownerName);
          setOwnerAddress(b.ownerAddress || '');
          setProfilePhotoUrl(b.profilePhotoUrl || '');
          setRecoveryEmail(b.email || '');
          
          setSmEmail(b.subMerchantEmail || '');
          setSmPassword(b.subMerchantPassword || '');
          
          // Load lucky gifts - ensure at least one empty row if none exist
          if (b.luckyGifts && b.luckyGifts.length > 0) {
            setLuckyGifts(b.luckyGifts);
          } else if (b.luckyGiftName) {
            // Support legacy single gift migration
            setLuckyGifts([{ name: b.luckyGiftName, quantity: b.luckyGiftQuantity || 0 }]);
          } else {
            setLuckyGifts([{ name: '', quantity: 0 }]);
          }
          
          // Calculate Lock Status
          const now = new Date();
          const lastUpdate = b.lastDiscountUpdate ? new Date(b.lastDiscountUpdate) : new Date(0);
          const diffDays = Math.ceil((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 15 && !b.discountOverrideEnabled) {
             setIsLocked(true);
             setDaysRemaining(15 - diffDays);
          } else {
             setIsLocked(false);
             setDaysRemaining(0);
          }

          if (b.isEmailConnected && b.integratedEmail) {
            setIntegrationEmail(b.integratedEmail);
          } else {
             setIntegrationEmail(b.email || '');
          }
        }
      });
  }

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSavingDiscount(true);
    setErrorMessage(null);
    
    // Filter out empty gifts
    const validGifts = luckyGifts.filter(g => g.name.trim() !== '' && g.quantity > 0);
    
    try {
      await mockService.updateBusinessSettings(business.id, rule, {
        gifts: validGifts
      });
      setTimeout(() => {
        setSavingDiscount(false);
        refreshBusinessData(business.id);
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message);
      setSavingDiscount(false);
    }
  };

  const handleSaveSm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSavingSm(true);
    
    await mockService.updateBusinessProfile(business.id, {
      subMerchantEmail: smEmail,
      subMerchantPassword: smPassword
    });
    
    setTimeout(() => {
      setSavingSm(false);
      refreshBusinessData(business.id);
    }, 800);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSavingProfile(true);
    
    await mockService.updateBusinessProfile(business.id, {
       ownerName,
       ownerAddress,
       profilePhotoUrl,
       email: recoveryEmail
    });
    
    updateUser({ name: ownerName, profilePhotoUrl });
    setTimeout(() => setSavingProfile(false), 800);
  };

  const handleConnectEmail = async () => {
    if(!business || !integrationEmail) return;
    setConnectingEmail(true);
    setTimeout(async () => {
        await mockService.connectBusinessEmail(business.id, integrationEmail);
        refreshBusinessData(business.id);
        setConnectingEmail(false);
    }, 1500);
  };

  const handleDisconnectEmail = async () => {
    if(!business) return;
    await mockService.disconnectBusinessEmail(business.id);
    refreshBusinessData(business.id);
  };

  // Lucky Gift Handlers
  const addGiftSlot = () => {
    if (luckyGifts.length < 7) {
      setLuckyGifts([...luckyGifts, { name: '', quantity: 0 }]);
    }
  };

  const removeGiftSlot = (index: number) => {
    if (luckyGifts.length > 1) {
      const newList = [...luckyGifts];
      newList.splice(index, 1);
      setLuckyGifts(newList);
    } else {
      setLuckyGifts([{ name: '', quantity: 0 }]);
    }
  };

  const updateGift = (index: number, field: keyof LuckyGift, value: string | number) => {
    const newList = [...luckyGifts];
    newList[index] = { ...newList[index], [field]: value };
    setLuckyGifts(newList);
  };

  if (!business) return <div className="p-10 text-center text-slate-500">Loading business settings...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-10">
       <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings & Configuration</h1>
        <p className="text-slate-500">Manage your business profile, staff access, and coupon offerings.</p>
      </div>

      {/* SECTION 1: DISCOUNT SETTINGS (WITH LOCK) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center space-x-2">
            <Ticket className="text-indigo-600" size={20} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Discount & Lucky Draw</h2>
              <p className="text-xs text-slate-500">Offer seen by customers from partner shops.</p>
            </div>
          </div>
          {isLocked ? (
            <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold border border-orange-200">
               <Lock size={14} className="mr-2" />
               Locked for {daysRemaining} more days
            </div>
          ) : business.discountOverrideEnabled ? (
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold border border-green-200">
               <Unlock size={14} className="mr-2" />
               Admin Override Enabled
            </div>
          ) : (
            <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold border border-green-100">
               <CheckCircle size={14} className="mr-2" />
               Available to Edit
            </div>
          )}
        </div>
        
        {isLocked && !business.discountOverrideEnabled && (
           <div className="mx-6 mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-slate-400 mt-0.5" size={18} />
              <p className="text-xs text-slate-600 leading-relaxed">
                To prevent confusion in the cluster, your discount configuration is locked for 15 days after each update. 
                <strong> You can change this again in {daysRemaining} days.</strong> 
                If you have an emergency requirement, please contact the Platform Admin.
              </p>
           </div>
        )}

        <form onSubmit={handleSaveDiscount} className={`p-6 space-y-6 ${isLocked && !business.discountOverrideEnabled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
          {errorMessage && (
             <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" /> {errorMessage}
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Discount Type</label>
              <select
                disabled={isLocked && !business.discountOverrideEnabled}
                value={rule.type}
                onChange={(e) => setRule({ ...rule, type: e.target.value as 'PERCENTAGE' | 'FLAT' })}
                className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Value {rule.type === 'PERCENTAGE' ? '(%)' : '(₹)'}
              </label>
              <input
                disabled={isLocked && !business.discountOverrideEnabled}
                type="number"
                value={rule.value}
                onChange={(e) => setRule({ ...rule, value: Number(e.target.value) })}
                className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Purchase Requirement (₹)</label>
            <input
              disabled={isLocked && !business.discountOverrideEnabled}
              type="number"
              value={rule.minPurchase}
              onChange={(e) => setRule({ ...rule, minPurchase: Number(e.target.value) })}
              className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Marketing Description</label>
            <input
              disabled={isLocked && !business.discountOverrideEnabled}
              type="text"
              value={rule.description}
              onChange={(e) => setRule({ ...rule, description: e.target.value })}
              className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50"
              placeholder="e.g. 10% off for new customers"
            />
          </div>

          {/* LUCKY DRAW SECTION - Multi-Gift */}
          <div className="pt-6 border-t border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                  <Gift size={18} className="mr-2 text-indigo-600" /> Lucky Draw Surprises
                </h3>
                {luckyGifts.length < 7 && (
                  <button 
                    type="button" 
                    onClick={addGiftSlot}
                    disabled={isLocked && !business.discountOverrideEnabled}
                    className="flex items-center space-x-1 text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest disabled:opacity-50"
                  >
                    <Plus size={14} />
                    <span>Add More Gift</span>
                  </button>
                )}
             </div>

             <div className="space-y-4">
                {luckyGifts.map((gift, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300">
                     <div className="md:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Surprise Gift Name #{idx + 1}</label>
                        <div className="relative">
                           <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input
                             disabled={isLocked && !business.discountOverrideEnabled}
                             type="text"
                             value={gift.name}
                             onChange={(e) => updateGift(idx, 'name', e.target.value)}
                             className="block w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 text-sm font-medium"
                             placeholder="e.g. Free Coffee Mug"
                           />
                        </div>
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Quantity</label>
                        <div className="relative">
                           <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input
                             disabled={isLocked && !business.discountOverrideEnabled}
                             type="number"
                             min="0"
                             value={gift.quantity}
                             onChange={(e) => updateGift(idx, 'quantity', Number(e.target.value))}
                             className="block w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 text-sm font-bold"
                           />
                        </div>
                     </div>
                     <div className="md:col-span-1">
                        <button 
                          type="button" 
                          onClick={() => removeGiftSlot(idx)}
                          disabled={isLocked && !business.discountOverrideEnabled}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <X size={18} />
                        </button>
                     </div>
                  </div>
                ))}
             </div>

             <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">* Gifts are randomly assigned to coupons during generation. Customers only find out upon redemption. You can manage up to 7 types of gifts.</p>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
             <input
                disabled={isLocked && !business.discountOverrideEnabled}
                type="checkbox"
                id="isActive"
                checked={rule.isActive}
                onChange={(e) => setRule({ ...rule, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50"
             />
             <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Offer is Active</label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingDiscount || (isLocked && !business.discountOverrideEnabled)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md active:scale-95"
            >
              <Save size={18} />
              <span>{savingDiscount ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SUB-MERCHANT (COUNTER STAFF) ACCESS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-white">
          <Smartphone className="text-orange-600" size={20} />
          <div>
            <h2 className="text-lg font-bold text-slate-800">Redemption Counter Access</h2>
            <p className="text-xs text-orange-600">Create a restricted login for your staff to only handle redemptions.</p>
          </div>
        </div>
        
        <form onSubmit={handleSaveSm} className="p-6 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Staff Login ID (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    value={smEmail}
                    onChange={(e) => setSmEmail(e.target.value)}
                    className="block w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="counter@yourbusiness.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Staff Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type={showSmPass ? "text" : "password"}
                    value={smPassword}
                    onChange={(e) => setSmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowSmPass(!showSmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showSmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
           </div>
           
           <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start space-x-3">
              <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                <strong>Important:</strong> Users logging in with these credentials will ONLY have access to the "Redeem Coupon" screen. They cannot see your revenue, issued coupons, or settings.
              </p>
           </div>

           <div className="pt-2">
              <button
                type="submit"
                disabled={savingSm || !smEmail || !smPassword}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-md active:scale-95 disabled:opacity-50"
              >
                <Save size={18} />
                <span>{savingSm ? 'Updating Staff Access...' : 'Set Staff Access'}</span>
              </button>
           </div>
        </form>
      </div>

      {/* SECTION 3: EMAIL INTEGRATION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-white">
          <Mail className="text-blue-600" size={20} />
          <div>
            <h2 className="text-lg font-bold text-slate-800">Automated Email Delivery</h2>
            <p className="text-xs text-blue-600">Connect your email to automatically send coupons to customers.</p>
          </div>
        </div>
        
        <div className="p-6">
           {business.isEmailConnected ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                       <CheckCircle size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-green-800">Email Connected</h3>
                       <p className="text-sm text-green-700">Coupons are sent via <strong>{business.integratedEmail}</strong></p>
                    </div>
                 </div>
                 <button 
                   onClick={handleDisconnectEmail}
                   className="flex items-center space-x-1 text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded-md transition-colors"
                 >
                   <Trash2 size={16} />
                   <span>Disconnect</span>
                 </button>
              </div>
           ) : (
             <div className="space-y-4">
               <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Enter your Business Email</label>
                     <input
                        type="email"
                        value={integrationEmail}
                        onChange={(e) => setIntegrationEmail(e.target.value)}
                        className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. orders@mybusiness.com"
                     />
                  </div>
                  <button 
                    onClick={handleConnectEmail}
                    disabled={connectingEmail || !integrationEmail}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full md:w-auto min-w-[140px]"
                  >
                    {connectingEmail ? (
                       <span>Connecting...</span>
                    ) : (
                       <>
                         <Link size={18} />
                         <span>Connect Email</span>
                       </>
                    )}
                  </button>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* SECTION 4: PROFILE SETTINGS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <User className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Profile & Branding</h2>
        </div>
        
        <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
             <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
               <div className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-sm overflow-hidden bg-slate-100 relative group">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Camera className="text-white" />
                  </div>
               </div>
               
               <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 text-center">Quick Select Photo</label>
                  <div className="flex justify-center gap-2">
                    {PRESET_AVATARS.map((url, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setProfilePhotoUrl(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 hover:scale-110 transition-transform ${profilePhotoUrl === url ? 'border-indigo-600' : 'border-transparent'}`}
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
               </div>
             </div>

             <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recovery Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="block w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="your@email.com"
                      data-testid="input-recovery-email"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">* This email will be used for password recovery via OTP.</p>
                </div>

                {business?.loginId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Login ID</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={business.loginId}
                      readOnly
                      className="block w-full pl-10 border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-600 font-medium cursor-not-allowed"
                      data-testid="display-login-id"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">* Set by admin. Contact admin to change.</p>
                </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Address</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={ownerAddress}
                      onChange={(e) => setOwnerAddress(e.target.value)}
                      className="block w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Shop No. 12, MG Road, Pune"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">* This address will be printed on the coupons you redeem.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo URL</label>
                  <input
                    type="text"
                    value={profilePhotoUrl}
                    onChange={(e) => setProfilePhotoUrl(e.target.value)}
                    className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-md active:scale-95"
                  >
                    <Save size={18} />
                    <span>{savingProfile ? 'Updating...' : 'Update Profile'}</span>
                  </button>
                </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
