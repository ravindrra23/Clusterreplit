
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { UserRole, Business } from '@/types/types';
import { Users, Store, Shield, ChevronRight, Loader, Lock, Mail, Eye, EyeOff, AlertCircle, KeyRound, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';

type LoginMode = 'MERCHANT' | 'STAFF' | 'SUPER' | 'COUNTER';
type ForgotStep = 'ENTER_EMAIL' | 'ENTER_OTP' | 'SET_PASSWORD' | 'SUCCESS';
type LoginPanelType = 'merchant' | 'admin';

interface LoginProps {
  panelType?: LoginPanelType;
}

const Login: React.FC<LoginProps> = ({ panelType = 'merchant' }) => {
  const { login } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [mode, setMode] = useState<LoginMode>(panelType === 'admin' ? 'SUPER' : 'MERCHANT');
  const [merchantName, setMerchantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [merchantPassword, setMerchantPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('ENTER_EMAIL');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusinessId, setForgotBusinessId] = useState('');
  const [forgotMerchantName, setForgotMerchantName] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotInfo, setForgotInfo] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState('');

  useEffect(() => {
    mockService.getBusinesses().then(bizData => {
      setBusinesses(bizData);
      if (bizData.length > 0) {
        setSelectedBusinessId(bizData[0].id);
        setForgotBusinessId(bizData[0].id);
      }
      setLoading(false);
    });
  }, []);

  const resetForgot = () => {
    setShowForgot(false);
    setForgotStep('ENTER_EMAIL');
    setForgotEmail('');
    setForgotBusinessId(selectedBusinessId);
    setForgotMerchantName('');
    setEnteredOTP('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setForgotInfo(null);
    setShowNewPass(false);
  };

  const openForgot = () => {
    setForgotError(null);
    setForgotInfo(null);
    setForgotStep('ENTER_EMAIL');
    setEnteredOTP('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotBusinessId(selectedBusinessId);
    setShowForgot(true);
  };

  const maskEmail = (e: string) => {
    const [local, domain] = e.split('@');
    if (!domain) return e;
    return `${local.substring(0, 2)}****@${domain}`;
  };

  const handleSendOTP = async () => {
    setForgotError(null);
    setForgotLoading(true);

    try {
      let emailToSend = '';
      let roleForOTP = '';
      let identifier = '';
      let bizId: string | undefined;
      let mName: string | undefined;

      if (mode === 'SUPER') {
        const config = await mockService.getSuperAdminConfig();
        emailToSend = config.email;
        roleForOTP = UserRole.SUPER_ADMIN;
        identifier = config.email;
      } else if (mode === 'MERCHANT') {
        const biz = businesses.find(b => b.id === forgotBusinessId);
        if (!biz) { setForgotError('Business not found.'); setForgotLoading(false); return; }
        emailToSend = biz.email;
        roleForOTP = UserRole.BUSINESS_OWNER;
        identifier = biz.email;
        bizId = biz.id;
      } else if (mode === 'STAFF') {
        if (!forgotEmail) { setForgotError('Please enter your registered email.'); setForgotLoading(false); return; }
        const admins = await mockService.getSubAdmins();
        const found = admins.find(a => a.email === forgotEmail);
        if (!found) { setForgotError('No account found with this email.'); setForgotLoading(false); return; }
        emailToSend = forgotEmail;
        roleForOTP = UserRole.SUB_ADMIN;
        identifier = forgotEmail;
      } else if (mode === 'COUNTER') {
        if (!forgotEmail || !forgotMerchantName) { setForgotError('Please enter your email and merchant name.'); setForgotLoading(false); return; }
        const businesses2 = await mockService.getBusinesses();
        const found = businesses2.find(b =>
          b.subMerchantEmail === forgotEmail &&
          b.name.toLowerCase() === forgotMerchantName.toLowerCase().trim()
        );
        if (!found) { setForgotError('No account found with these details.'); setForgotLoading(false); return; }
        emailToSend = forgotEmail;
        roleForOTP = UserRole.SUB_MERCHANT;
        identifier = forgotEmail;
        mName = forgotMerchantName;
      }

      const otp = mockService.generateOTP();
      mockService.storeOTP({
        email: emailToSend,
        otp,
        role: roleForOTP,
        expiresAt: Date.now() + 10 * 60 * 1000,
        businessId: bizId,
        merchantName: mName,
      });

      const status = await mockService.getEmailServiceStatus();
      if (!status.configured) {
        setForgotError('Email service is not configured. Please contact the Super Admin to set up SMTP settings.');
        setForgotLoading(false);
        return;
      }

      const biz2 = bizId ? businesses.find(b => b.id === bizId) : null;
      const userName = biz2 ? biz2.ownerName : (forgotEmail.split('@')[0] || 'User');
      const sent = await mockService.sendRecoveryEmail(emailToSend, otp, userName);

      if (!sent) {
        setForgotError('Failed to send email. Please try again or contact admin.');
        setForgotLoading(false);
        return;
      }

      setMaskedEmail(maskEmail(emailToSend));
      setForgotEmail(emailToSend);
      setForgotStep('ENTER_OTP');
      setForgotInfo(`OTP sent to ${maskEmail(emailToSend)}`);
    } catch (err) {
      setForgotError('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    setForgotError(null);
    if (!enteredOTP || enteredOTP.length !== 6) {
      setForgotError('Please enter the 6-digit OTP.');
      return;
    }
    const roleForOTP = mode === 'SUPER' ? UserRole.SUPER_ADMIN
      : mode === 'MERCHANT' ? UserRole.BUSINESS_OWNER
      : mode === 'STAFF' ? UserRole.SUB_ADMIN
      : UserRole.SUB_MERCHANT;

    const valid = mockService.verifyOTP(forgotEmail, roleForOTP, enteredOTP);
    if (!valid) {
      setForgotError('Invalid or expired OTP. Please try again.');
      return;
    }
    setForgotStep('SET_PASSWORD');
    setForgotInfo(null);
  };

  const handleResetPassword = async () => {
    setForgotError(null);
    if (!newPassword || newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotLoading(true);

    const roleForOTP = mode === 'SUPER' ? UserRole.SUPER_ADMIN
      : mode === 'MERCHANT' ? UserRole.BUSINESS_OWNER
      : mode === 'STAFF' ? UserRole.SUB_ADMIN
      : UserRole.SUB_MERCHANT;

    const bizId = mode === 'MERCHANT' ? forgotBusinessId : undefined;
    const success = await mockService.resetPasswordByOTP(forgotEmail, roleForOTP, enteredOTP, newPassword, bizId);
    setForgotLoading(false);

    if (!success) {
      setForgotError('OTP verification failed. Please start over.');
      return;
    }
    setForgotStep('SUCCESS');
  };

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

    if (!merchantPassword) {
      setLoginError("Please enter your password.");
      return;
    }

    setIsLoggingIn(true);
    setTimeout(async () => {
      const success = await login(UserRole.BUSINESS_OWNER, selectedBusinessId, merchantPassword);
      if (!success) {
        setLoginError("Incorrect password. Please try again or use Forgot Password.");
        setIsLoggingIn(false);
      }
    }, 600);
  };

  const handleCredentialLogin = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    
    setTimeout(async () => {
      const success = await login(role, email, password, merchantName);
      if (!success) {
        setLoginError("Credentials do not match our records. Please verify and try again.");
        setIsLoggingIn(false);
      }
    }, 800);
  };

  const handleSuperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    setTimeout(async () => {
      const success = await login(UserRole.SUPER_ADMIN, email, password);
      if (!success) {
        setLoginError("Invalid Super Admin credentials.");
        setIsLoggingIn(false);
      }
    }, 600);
  };

  const ForgotPasswordModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={resetForgot}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl mb-3">
            <KeyRound className="text-indigo-600" size={22} />
          </div>
          <h3 className="text-lg font-black text-slate-800">Recover Password</h3>
          <p className="text-xs text-slate-500 mt-1">
            {forgotStep === 'ENTER_EMAIL' && 'We will send an OTP to your registered email.'}
            {forgotStep === 'ENTER_OTP' && `OTP sent to ${maskedEmail}`}
            {forgotStep === 'SET_PASSWORD' && 'Create your new password.'}
            {forgotStep === 'SUCCESS' && 'Password updated successfully!'}
          </p>
        </div>

        {forgotError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center mb-4">
            <AlertCircle size={14} className="mr-2 shrink-0" /> {forgotError}
          </div>
        )}
        {forgotInfo && (
          <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center mb-4">
            <CheckCircle size={14} className="mr-2 shrink-0" /> {forgotInfo}
          </div>
        )}

        {forgotStep === 'ENTER_EMAIL' && (
          <div className="space-y-4">
            {mode === 'MERCHANT' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Business</label>
                <div className="relative">
                  <select
                    value={forgotBusinessId}
                    onChange={e => setForgotBusinessId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-indigo-500 block p-4 pr-10 outline-none"
                  >
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                </div>
                {forgotBusinessId && (
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">
                    OTP will be sent to: {maskEmail(businesses.find(b => b.id === forgotBusinessId)?.email || '')}
                  </p>
                )}
              </div>
            )}

            {mode === 'SUPER' && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 text-center">
                OTP will be sent to the Super Admin's registered email address.
              </p>
            )}

            {(mode === 'STAFF' || mode === 'COUNTER') && (
              <>
                {mode === 'COUNTER' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Merchant Name</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text" value={forgotMerchantName} onChange={e => setForgotMerchantName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        placeholder="Shop Name"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleSendOTP}
              disabled={forgotLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {forgotLoading ? <Loader className="animate-spin" size={18} /> : 'Send OTP'}
            </button>
          </div>
        )}

        {forgotStep === 'ENTER_OTP' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Enter 6-Digit OTP</label>
              <input
                type="text" maxLength={6} value={enteredOTP} onChange={e => setEnteredOTP(e.target.value.replace(/\D/g, ''))}
                className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-center tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="------"
              />
            </div>
            <button
              onClick={handleVerifyOTP}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-100"
            >
              Verify OTP
            </button>
            <button
              onClick={() => { setForgotStep('ENTER_EMAIL'); setForgotError(null); setForgotInfo(null); setEnteredOTP(''); }}
              className="w-full text-slate-400 text-xs font-bold flex items-center justify-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw size={12} /> Resend OTP
            </button>
          </div>
        )}

        {forgotStep === 'SET_PASSWORD' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showNewPass ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Repeat password"
                />
              </div>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={forgotLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {forgotLoading ? <Loader className="animate-spin" size={18} /> : 'Reset Password'}
            </button>
          </div>
        )}

        {forgotStep === 'SUCCESS' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <p className="text-sm font-bold text-slate-700">Password reset successfully!</p>
            <p className="text-xs text-slate-500">You can now log in with your new password.</p>
            <button
              onClick={resetForgot}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl transition-all"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {showForgot && <ForgotPasswordModal />}

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
          <div className={`grid ${panelType === 'merchant' ? 'grid-cols-2' : 'grid-cols-2'} bg-slate-100 p-1 rounded-2xl mb-6 sm:mb-8`}>
             {panelType === 'merchant' ? (
               <>
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
               </>
             ) : (
               <>
                 <button 
                   onClick={() => { setMode('SUPER'); setLoginError(null); }}
                   className={`flex items-center justify-center py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all ${mode === 'SUPER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Admin
                 </button>
                 <button 
                   onClick={() => { setMode('STAFF'); setLoginError(null); }}
                   className={`flex items-center justify-center py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-all ${mode === 'STAFF' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Platform
                 </button>
               </>
             )}
          </div>

          {loginError && (
             <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center animate-in fade-in slide-in-from-top-2 mb-4">
                <AlertCircle size={14} className="mr-2 shrink-0" /> {loginError}
             </div>
          )}

          {mode === 'MERCHANT' ? (
             <div className="space-y-5">
                <div className="text-center mb-4">
                   <h2 className="text-lg sm:text-xl font-bold text-slate-800">Merchant Dashboard</h2>
                   <p className="text-xs sm:text-sm text-slate-500 mt-1">Select your business and enter password</p>
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
                          <option key={b.id} value={b.id}>{b.name}{b.loginId ? ` (${b.loginId})` : ''}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                         <ChevronRight size={18} className="rotate-90" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type={showPass ? "text" : "password"} value={merchantPassword}
                          onChange={(e) => { setMerchantPassword(e.target.value); setLoginError(null); }}
                          className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                          placeholder="••••••••"
                          onKeyDown={e => { if (e.key === 'Enter') handleMerchantLogin(); }}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleMerchantLogin}
                      disabled={isLoggingIn}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                    >
                      {isLoggingIn ? <Loader className="animate-spin" size={20} /> : "Login as Owner"}
                    </button>
                    <button type="button" onClick={openForgot} className="w-full text-[10px] text-center text-indigo-500 hover:text-indigo-700 font-bold transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}
             </div>
          ) : mode === 'COUNTER' || mode === 'STAFF' ? (
             <form onSubmit={(e) => handleCredentialLogin(e, mode === 'COUNTER' ? UserRole.SUB_MERCHANT : UserRole.SUB_ADMIN)} className="space-y-5">
                <div className="text-center mb-4">
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
                <button type="button" onClick={openForgot} className="w-full text-[10px] text-center text-indigo-500 hover:text-indigo-700 font-bold transition-colors">
                  Forgot Password?
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2 font-bold uppercase tracking-wider">
                  {mode === 'COUNTER' ? 'Merchant staff access' : 'Platform staff access'}
                </p>
             </form>
          ) : (
             <form onSubmit={handleSuperLogin} className="space-y-5">
                <div className="text-center mb-4">
                   <h2 className="text-lg sm:text-xl font-bold text-slate-800">Master Control</h2>
                   <p className="text-xs sm:text-sm text-slate-500 mt-1">Super Admin secure login</p>
                </div>
                
                <div className="p-5 bg-slate-900 rounded-[1.5rem] space-y-4">
                  <div className="flex justify-center mb-2">
                    <Shield className="text-indigo-400" size={32} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="admin@clustergrowth.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit" disabled={isLoggingIn}
                    className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-3.5 rounded-xl transition-all shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? <Loader className="animate-spin" size={18} /> : "Enter Master Console"}
                  </button>
                </div>

                <button type="button" onClick={openForgot} className="w-full text-[10px] text-center text-indigo-500 hover:text-indigo-700 font-bold transition-colors">
                  Forgot Admin Password?
                </button>

                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                  Default: admin@clustergrowth.com / admin@123
                </p>
             </form>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
         <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Built for Business Networks</p>
      </div>
    </div>
  );
};

export default Login;
