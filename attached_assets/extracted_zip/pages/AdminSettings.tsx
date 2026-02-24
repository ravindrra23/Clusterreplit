
import React, { useEffect, useState } from 'react';
import { mockService } from '../services/mockService';
import { SubAdminUser, SubAdminPermissions } from '../types';
import { 
  Shield, 
  UserPlus, 
  Settings, 
  Users, 
  X, 
  Trash2, 
  CheckCircle, 
  Map, 
  Store, 
  Megaphone, 
  BarChart3, 
  Download, 
  Lock,
  Mail,
  User,
  Search,
  ChevronRight,
  ShieldAlert,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [editingUser, setEditingUser] = useState<SubAdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [permissions, setPermissions] = useState<SubAdminPermissions>({
    canManageClusters: true,
    canManageBusinesses: true,
    canBroadcast: false,
    canViewReports: true,
    canDownloadData: false,
  });

  const loadUsers = () => {
    mockService.getSubAdmins().then(setSubAdmins);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setStatus('ACTIVE');
    setModalStep(1);
    setPermissions({
      canManageClusters: true,
      canManageBusinesses: true,
      canBroadcast: false,
      canViewReports: true,
      canDownloadData: false,
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (user: SubAdminUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || '');
    setStatus(user.status);
    setPermissions(user.permissions);
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (editingUser) {
      await mockService.updateSubAdmin(editingUser.id, {
        name, email, status, permissions, password
      });
    } else {
      await mockService.addSubAdmin({
        name, email, status, permissions, password
      });
    }
    setIsModalOpen(false);
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      await mockService.deleteSubAdmin(id);
      loadUsers();
    }
  };

  const togglePermission = (field: keyof SubAdminPermissions) => {
    setPermissions({ ...permissions, [field]: !permissions[field] });
  };

  const PermissionToggle = ({ label, description, icon: Icon, field }: { label: string, description: string, icon: any, field: keyof SubAdminPermissions }) => (
    <div 
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
        permissions[field] ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
      onClick={() => togglePermission(field)}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${permissions[field] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">{label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        permissions[field] ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
      }`}>
        {permissions[field] && <CheckCircle size={12} className="text-white" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff & Access Control</h1>
          <p className="text-slate-500 mt-2">Manage sub-admins, set passwords, and define operation controls.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-indigo-700 shadow-lg transition-all active:scale-95"
        >
          <UserPlus size={20} className="mr-2" />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
             <Users className="text-indigo-600" size={24} />
             <h2 className="text-xl font-bold text-slate-800">Staff Directory</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Employee</th>
                <th className="px-6 py-4">User ID (Email)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                    <UserPlus size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No sub-admin accounts created yet.</p>
                  </td>
                </tr>
              ) : (
                subAdmins.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm">
                             {user.name.charAt(0)}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">{user.name}</p>
                             <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Sub-Admin</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-medium text-slate-700">{user.email}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                         user.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                       }`}>
                         {user.status}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit & Reset Password"
                          >
                             <Key size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete User"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                       <UserPlus size={24} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold text-slate-900">
                          {editingUser ? 'Edit Staff Account' : 'Setup New Staff Account'}
                       </h2>
                       <p className="text-sm text-slate-500 mt-1">
                         {modalStep === 1 ? 'Step 1: Credentials & Basic Info' : 'Step 2: Operations Permissions'}
                       </p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-8">
                 {modalStep === 1 ? (
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Staff Full Name</label>
                            <div className="relative">
                               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                               <input 
                                 type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                 placeholder="e.g. Rahul Patil"
                               />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">User ID / Email</label>
                            <div className="relative">
                               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                               <input 
                                 type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                 placeholder="staff@clustergrowth.com"
                               />
                            </div>
                         </div>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Login Password</label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder={editingUser ? "Enter new password to reset" : "Enter temporary password"}
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                            >
                               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                         </div>
                         {editingUser && <p className="text-[10px] text-orange-600 font-bold uppercase mt-2">* Leaving this as is will keep the current password.</p>}
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account Status</label>
                         <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => setStatus('ACTIVE')}
                              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${
                                status === 'ACTIVE' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'
                              }`}
                            >
                               Active Staff
                            </button>
                            <button 
                              onClick={() => setStatus('INACTIVE')}
                              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${
                                status === 'INACTIVE' ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-100 text-slate-400'
                              }`}
                            >
                               Suspended
                            </button>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100 flex justify-end">
                         <button 
                           onClick={() => setModalStep(2)}
                           disabled={!name || !email || !password}
                           className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center disabled:opacity-50"
                         >
                            Next: Access Control <ChevronRight size={18} className="ml-2" />
                         </button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start space-x-3">
                         <ShieldAlert className="text-blue-600 mt-0.5 shrink-0" size={20} />
                         <p className="text-xs text-blue-700 leading-relaxed font-medium">
                           Define which controls {name} should have. Sub-Admins can only see the modules you enable below.
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Core Operations</p>
                            <PermissionToggle label="Cluster Management" description="Create and delete clusters." icon={Map} field="canManageClusters" />
                            <PermissionToggle label="Merchant Management" description="Onboard shops." icon={Store} field="canManageBusinesses" />
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Engagement & Reports</p>
                            <PermissionToggle label="System Messaging" description="Send broadcast notifications." icon={Megaphone} field="canBroadcast" />
                            <PermissionToggle label="Analytics & Data" description="View reports." icon={BarChart3} field="canViewReports" />
                         </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                         <button 
                           onClick={() => setModalStep(1)}
                           className="text-slate-500 font-bold hover:text-slate-700 flex items-center"
                         >
                            Back to Credentials
                         </button>
                         <button 
                           onClick={handleSubmit}
                           className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                         >
                            {editingUser ? 'Update Staff Account' : 'Create Staff Account'}
                         </button>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
