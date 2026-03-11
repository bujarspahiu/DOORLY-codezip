import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authenticateUser, getUserById, type StoredUser } from '../lib/userStore';

export interface CompanyProfile {
  companyName: string;
  regNumber: string;
  vatNumber: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  accentColor: string;
  stampUrl: string;
  isComplete: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'admin' | 'business';
  company?: CompanyProfile;
  plan?: string;
  status?: 'active' | 'suspended';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function storedUserToUser(stored: StoredUser): User {
  return {
    id: stored.id,
    email: stored.email,
    name: stored.fullName,
    username: stored.username,
    role: stored.role,
    plan: stored.plan,
    status: stored.status,
    createdAt: stored.createdAt,
    company: {
      companyName: stored.companyName,
      regNumber: '',
      vatNumber: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: stored.email,
      website: '',
      logoUrl: '',
      accentColor: '#2563EB',
      stampUrl: '',
      isComplete: false,
    },
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateCompanyProfile: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem('doorly_current_user');
      if (savedId) {
        const stored = getUserById(savedId);
        if (stored) return storedUserToUser(stored);
      }
    } catch {}
    return null;
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const stored = authenticateUser(username, password);
    if (stored) {
      const u = storedUserToUser(stored);
      setUser(u);
      localStorage.setItem('doorly_current_user', stored.id);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const register = async (username: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { createUser } = await import('../lib/userStore');
      const stored = createUser({ username, password, fullName, companyName: '', plan: 'starter' });
      const u = storedUserToUser(stored);
      setUser(u);
      localStorage.setItem('doorly_current_user', stored.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('doorly_current_user');
  };

  const updateCompanyProfile = async (profile: Partial<CompanyProfile>) => {
    if (!user) return;
    setUser({
      ...user,
      company: { ...user.company!, ...profile },
    });
  };

  const refreshProfile = async () => {};

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading: false, login, register, logout, updateCompanyProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
