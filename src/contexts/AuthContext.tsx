import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile as dbUpdateProfile } from '../lib/database';

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function profileToUser(profile: any): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name || '',
    role: profile.role || 'business',
    plan: profile.plan || 'starter',
    status: profile.status || 'active',
    createdAt: profile.created_at,
    company: {
      companyName: profile.company_name || '',
      regNumber: profile.reg_number || '',
      vatNumber: profile.vat_number || '',
      address: profile.address || '',
      city: profile.city || '',
      country: profile.country || '',
      phone: profile.phone || '',
      email: profile.company_email || '',
      website: profile.website || '',
      logoUrl: profile.logo_url || '',
      accentColor: profile.accent_color || '#2563EB',
      stampUrl: profile.stamp_url || '',
      isComplete: profile.profile_complete || false,
    },
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateCompanyProfile: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      if (profile) {
        setUser(profileToUser(profile));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await loadProfile(data.user.id);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        // Small delay for trigger to create profile
        await new Promise(r => setTimeout(r, 500));
        await loadProfile(data.user.id);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateCompanyProfile = async (profile: Partial<CompanyProfile>) => {
    if (!user) return;
    try {
      const dbUpdates: Record<string, any> = {};
      if (profile.companyName !== undefined) dbUpdates.company_name = profile.companyName;
      if (profile.regNumber !== undefined) dbUpdates.reg_number = profile.regNumber;
      if (profile.vatNumber !== undefined) dbUpdates.vat_number = profile.vatNumber;
      if (profile.address !== undefined) dbUpdates.address = profile.address;
      if (profile.city !== undefined) dbUpdates.city = profile.city;
      if (profile.country !== undefined) dbUpdates.country = profile.country;
      if (profile.phone !== undefined) dbUpdates.phone = profile.phone;
      if (profile.email !== undefined) dbUpdates.company_email = profile.email;
      if (profile.website !== undefined) dbUpdates.website = profile.website;
      if (profile.logoUrl !== undefined) dbUpdates.logo_url = profile.logoUrl;
      if (profile.accentColor !== undefined) dbUpdates.accent_color = profile.accentColor;
      if (profile.stampUrl !== undefined) dbUpdates.stamp_url = profile.stampUrl;

      const updated = await dbUpdateProfile(user.id, dbUpdates);
      if (updated) {
        setUser(profileToUser(updated));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, updateCompanyProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
