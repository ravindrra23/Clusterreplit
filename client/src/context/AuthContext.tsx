
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, SubAdminPermissions } from '@/types/types';
import { mockService } from '@/services/mockService';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, identifier: string, password?: string, merchantName?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (role: UserRole, identifier: string, password?: string, merchantName?: string): Promise<boolean> => {
    if (role === UserRole.SUPER_ADMIN) {
      if (!identifier || !password) return false;
      const valid = await mockService.verifySuperAdmin(identifier, password);
      if (valid) {
        setUser({
          id: 'admin-1',
          name: 'Super Admin',
          role: UserRole.SUPER_ADMIN,
          permissions: {
            canManageClusters: true,
            canManageBusinesses: true,
            canBroadcast: true,
            canViewReports: true,
            canDownloadData: true,
          }
        });
        return true;
      }
      return false;
    } else if (role === UserRole.SUB_ADMIN) {
      if (!identifier || !password) return false;
      const staff = await mockService.verifySubAdmin(identifier, password);
      if (staff) {
        setUser({
          id: staff.id,
          name: staff.name,
          role: UserRole.SUB_ADMIN,
          permissions: staff.permissions
        });
        return true;
      }
      return false;
    } else if (role === UserRole.BUSINESS_OWNER) {
      if (!identifier || !password) return false;
      try {
        const business = await mockService.verifyBusinessOwnerByLoginId(identifier, password);
        if (business) {
          const now = new Date();
          const expiry = new Date(business.expiryDate);
          if (expiry < now) return false;
          setUser({
            id: business.id,
            name: business.ownerName,
            role: UserRole.BUSINESS_OWNER,
            businessId: business.id,
            profilePhotoUrl: business.profilePhotoUrl,
          });
          return true;
        }
      } catch (error) {
        console.error("Failed to login", error);
      }
      return false;
    } else if (role === UserRole.SUB_MERCHANT) {
      if (!identifier || !password || !merchantName) return false;
      const biz = await mockService.verifySubMerchant(identifier, password, merchantName);
      if (biz) {
        setUser({
          id: `sm-${biz.id}`,
          name: `${biz.name} (Staff)`,
          role: UserRole.SUB_MERCHANT,
          businessId: biz.id,
          profilePhotoUrl: biz.profilePhotoUrl,
        });
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
