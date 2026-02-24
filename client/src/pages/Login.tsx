
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { UserRole, Business } from '../types';
import { Users, Store, Shield, ChevronRight, Loader, Lock, Mail, Eye, EyeOff, AlertCircle, Smartphone } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Login Mode
  const [mode, setMode] = useState<'MERCHANT' | 'STAFF' | 'SUPER' | 'COUNTER'>('MERCHANT');
  
  // Staff & Merchant State
  const [merchantName, setMerchantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    mockService.getBusinesses().then(bizData => {
      setBusinesses(bizData);
      if (bizData.length > 0) setSelectedBusinessId(bizData[0].id);
      setLoading(false);
    });
  }, []);

  const handleMerchantLogin = async () => {
    setLoginError(null);
    const business = businesses.find(b => b.id === selectedBusinessId);
    
    if (business) {
      const now = new Date();
      const expiry = new Date(business.expiryDate);
      
      if (expiry < now) {
        setLoginError("Your subscription has expired. Please contact the administrator for renewal.");
        return;
      }
    }
    
    login(UserRole.BUSINESS_OWNER, selectedBusinessId);
  };

  const handleCredentialLogin = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    
    // Simulate slight delay for professional feel
    setTimeout(async () => {
      // For SUB_MERCHANT (COUNTER mode), we pass the merchantName as well
      const success = await login(role, email, password, merchantName);
      if (!success) {
        setLoginError("Credentials do not match our records. Please verify Merchant Name, Email and Password.");
        setIsLoggingIn(false);
      }
    }, 800);
  };

  const handleSuperLogin = () => {
    login(UserRole.SUPER_ADMIN, 'admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-md w-full bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        <div className="bg-indigo-600 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-700/30 opacity-20 pointer-events-none">
             <div className="w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md mb-4 shadow-xl border border-white/20">
            <Users className="text-white" size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ClusterGrowth</h1>
          <p className="text-indigo-100 mt-2 font-medium text-xs sm:text-sm opacity-90 tracking-wide">Business Networking Platform</p>
        </div>
        
        <div className="p-6 sm:p-8">
          {/* Tab Selector */}
          <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-2xl mb-6 sm:mb-8">
             <button 
               onClick={() => { setMode('MERCHANT'); setLoginError(null); }}
               className={`flex items-center justify-center py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all ${mode === 'MERCHANT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Owner
             </button>
             <button 
               onClick={() => { setMode('COUNTER'); setLoginError(null); }}
               className={`flex items-center justify-center py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all ${mode === 'COUNTER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Staff
             </button>
             <button 
               onClick={() => { setMode('STAFF'); setLoginError(null); }}
               className={`flex items-center justify-center py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all ${mode === 'STAFF' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Platform
             </button>
             <button 
               onClick={() => { setMode('SUPER'); setLoginError(null); }}
               className={`flex items-center justify-center py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all ${mode === 'SUPER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Admin
             </button>
          </div>

          {loginError && (
             <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center animate-in fade-in slide-in-from-top-2 mb-4">
                <AlertCircle size={14} className="mr-2 shrink-0" /> {loginError}
             </div>
          )}

          {mode === 'MERCHANT' ? (
             <div className="space-y-6">
                <div className="text-center mb-6">
                   <h2 className="text-lg sm:text-xl font-bold text-slate-800">Merchant Dashboard</h2>
                   <p className="text-xs sm:text-sm text-slate-500 mt-1">Select your business to continue</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader className="animate-spin text-indigo-600" size={32} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative group">
                      <select 
                        value={selectedBusinessId}
                        onChange={(e) => { setSelectedBusinessId(e.target.value); setLoginError(null); }}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 block p-4 pr-10 transition-all outline-none"
                      >
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                         <ChevronRight size={18} className="rotate-90" />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleMerchantLogin}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
                    >
                      Login as Owner
                    </button>
                  </div>
                )}
             </div>
          ) : mode === 'COUNTER' || mode === 'STAFF' ? (
             <form onSubmit={(e) => handleCredentialLogin(e, mode === 'COUNTER' ? UserRole.SUB_MERCHANT : UserRole.SUB_ADMIN)} className="space-y-5">
                <div className="text-center mb-6">
                   <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                     {mode === 'COUNTER' ? 'Redemption Counter' : 'Staff Portal'}
                   </h2>
                   <p className="text-xs sm:text-sm text-slate-500 mt-1">Enter credentials to continue</p>
                </div>

                {mode === 'COUNTER' && (
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Merchant Name</label>
                     <div className="relative">
                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" required value={merchantName} onChange={(e) => setMerchantName(e.target.value)}
                          className="w-full pl-11 sm:pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                          placeholder="Shop Name"
                        />
                     </div>
                  </div>
                )}

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email / ID</label>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 sm:pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        placeholder="user@example.com"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                      >
                         {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>
                </div>

                <button 
                  type="submit" disabled={isLoggingIn}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                >
                   {isLoggingIn ? <Loader className="animate-spin" size={20} /> : "Authorize Login"}
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-wider">
                  {mode === 'COUNTER' ? 'Merchant staff access' : 'Platform staff access'}
                </p>
             </form>
          ) : (
             <div className="space-y-6">
                <div className="text-center mb-6">
                   <h2 className="text-lg sm:text-xl font-bold text-slate-800">Master Control</h2>
                   <p className="text-xs sm:text-sm text-slate-500 mt-1">Super Admin authorization</p>
                </div>
                
                <div className="p-6 bg-slate-900 rounded-[2rem] text-center">
                   <Shield className="text-indigo-400 mx-auto mb-4" size={40} />
                   <p className="text-white text-sm font-bold mb-6">Super Admin access grants full platform permissions.</p>
                   <button 
                     onClick={handleSuperLogin}
                     className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl"
                   >
                     Enter Master Console
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>
      
      {/* Footer Text moved to the absolute bottom */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
         <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Built for Business Networks</p>
      </div>
    </div>
  );
};

export default Login;
