
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Notification } from '../types';
import { mockService } from '../services/mockService';
import { 
  LayoutDashboard, 
  QrCode, 
  Ticket, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Store, 
  Users,
  PieChart,
  Bell,
  Clock,
  AlertCircle,
  ShieldCheck,
  Megaphone,
  Activity,
  UserCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (user?.role === UserRole.BUSINESS_OWNER && user.businessId) {
      mockService.getNotifications(user.businessId).then(setNotifications);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return <>{children}</>;

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    await mockService.markNotificationAsRead(id);
    if (user.businessId) {
      const updated = await mockService.getNotifications(user.businessId);
      setNotifications(updated);
    }
  };

  const NavItem = ({ path, icon: Icon, label, visible = true }: { path: string; icon: any; label: string; visible?: boolean }) => {
    if (!visible) return null;
    return (
      <Link
        to={path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive(path) 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
        }`}
      >
        <Icon size={20} />
        <span className="font-bold text-sm">{label}</span>
      </Link>
    );
  };

  const isSuper = user.role === UserRole.SUPER_ADMIN;
  const isSub = user.role === UserRole.SUB_ADMIN;
  const isCounter = user.role === UserRole.SUB_MERCHANT;
  const perms = user.permissions;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-100">
              <Users className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">Cluster<span className="text-indigo-600">Growth</span></span>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
            {(isSuper || isSub) ? (
              <>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Platform Management</div>
                <NavItem path="/admin" icon={LayoutDashboard} label="Dashboard" />
                <NavItem path="/admin/clusters" icon={Users} label="Clusters" visible={isSuper || perms?.canManageClusters} />
                <NavItem path="/admin/businesses" icon={Store} label="Merchants" visible={isSuper || perms?.canManageBusinesses} />
                <NavItem path="/admin/reports" icon={PieChart} label="Revenue Hub" visible={isSuper || perms?.canViewReports} />
                <NavItem path="/admin/activity" icon={Activity} label="Activity Logs" visible={isSuper || perms?.canViewReports} />
                
                {isSuper && (
                  <>
                    <div className="px-4 py-2 mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Platform Config</div>
                    <NavItem path="/admin/settings" icon={Settings} label="Staff & Permissions" />
                  </>
                )}
              </>
            ) : isCounter ? (
              <>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Terminal Mode</div>
                <NavItem path="/redeem" icon={QrCode} label="Redeem Coupon" />
              </>
            ) : (
              <>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Store Operations</div>
                <NavItem path="/dashboard" icon={LayoutDashboard} label="My Dashboard" />
                <NavItem path="/issue" icon={Ticket} label="Issue Coupon" />
                <NavItem path="/redeem" icon={QrCode} label="Redeem Coupon" />
                <div className="px-4 py-2 mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Store Insights</div>
                <NavItem path="/reports" icon={PieChart} label="My Analytics" />
                <NavItem path="/activity" icon={Clock} label="Redemption Log" />
                <NavItem path="/settings" icon={Settings} label="Store Settings" />
              </>
            )}
          </nav>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3 mb-6 px-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {user.profilePhotoUrl ? (
                  <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="text-slate-400" size={28} />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <div className="flex items-center text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                   {isSuper ? 'Master Admin' : isSub ? 'Staff' : isCounter ? 'Counter Staff' : 'Merchant'}
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all text-sm font-bold shadow-sm"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center px-8 lg:px-12 justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2.5 text-slate-600 lg:hidden hover:bg-slate-100 rounded-xl">
              <Menu size={24} />
            </button>
            <div className="hidden lg:block">
               <h2 className="font-bold text-slate-800 text-lg capitalize">{location.pathname.split('/').pop()?.replace('admin', 'Platform') || 'Overview'}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user.role === UserRole.BUSINESS_OWNER && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                       <h3 className="font-bold text-slate-900">Notifications</h3>
                       {unreadCount > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{unreadCount} NEW</span>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                           <Bell className="mx-auto mb-3 opacity-10" size={40} />
                           <p className="text-xs font-medium">Clear as a summer day.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                            className={`p-5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-indigo-50/20' : ''}`}
                          >
                             <div className="flex items-start space-x-4">
                                <div className={`mt-0.5 p-2 rounded-xl ${notif.type === 'EXPIRY_WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                   {notif.type === 'EXPIRY_WARNING' ? <AlertCircle size={16} /> : <Bell size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{notif.title}</p>
                                   <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-100 h-8 w-px mx-2 hidden lg:block"></div>

            <div className="hidden lg:flex items-center space-x-3">
               <div className="text-right">
                  <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    {user.role === UserRole.SUB_MERCHANT ? 'Counter Mode' : user.role.replace('_', ' ')}
                  </p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                  {user.profilePhotoUrl ? (
                    <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                       <UserCircle size={28} />
                    </div>
                  )}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
