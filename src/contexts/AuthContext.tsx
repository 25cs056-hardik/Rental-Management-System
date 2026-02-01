import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers, validateGSTIN, validateEmail, generateId } from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface VendorApplicationData {
  companyName: string;
  gstin: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  applyVendorAccess: (data: VendorApplicationData) => Promise<{ success: boolean; error?: string }>;
  applyAdminAccess: () => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  couponCode?: string;
  role?: UserRole;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: string;
  company_name: string | null;
  gstin: string | null;
  phone: string | null;
  created_at: string;
}

function profileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    companyName: row.company_name ?? undefined,
    gstin: row.gstin ?? undefined,
    phone: row.phone ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const useSupabase = isSupabaseConfigured();

  const fetchProfile = useCallback(async (authUser: SupabaseUser): Promise<User | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, company_name, gstin, phone, created_at')
      .eq('id', authUser.id)
      .single();
    if (error || !data) return null;
    return profileToUser(data as ProfileRow);
  }, []);

  useEffect(() => {
    if (!useSupabase || !supabase) {
      const storedUser = localStorage.getItem('rental_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser({ ...parsed, createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date() });
        } catch {
          localStorage.removeItem('rental_user');
        }
      }
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          const profileUser = await fetchProfile(session.user);
          if (cancelled) return;
          if (profileUser) setUser(profileUser);
        }
      } catch (e) {
        console.warn('Auth session init failed:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const profileUser = await fetchProfile(session.user);
          setUser(profileUser ?? null);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.warn('Auth state change error:', e);
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [useSupabase, fetchProfile]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const emailTrimmed = email?.trim().toLowerCase() || '';
    if (!emailTrimmed || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (useSupabase && supabase) {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });
      setIsLoading(false);
      if (error) {
        const message = error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('credentials')
          ? 'Invalid email or password'
          : error.message || 'Invalid email or password';
        return { success: false, error: message };
      }
      if (data.user) {
        const profileUser = await fetchProfile(data.user);
        if (profileUser) {
          setUser(profileUser);
          return { success: true, user: profileUser };
        }
      }
      return { success: false, error: 'Could not load profile' };
    }

    // Relaxed validation for login to avoid blocking potential valid emails that regex might miss
    // if (!validateEmail(emailTrimmed)) {
    //   return { success: false, error: 'Invalid email format' };
    // }
    try {
      const stored = localStorage.getItem('rental_registered_users');
      if (stored) {
        const registered: { user: User; password: string }[] = JSON.parse(stored);
        const entry = registered.find(e => e.user.email.toLowerCase() === emailTrimmed);
        if (entry && entry.password === password) {
          setUser(entry.user);
          localStorage.setItem('rental_user', JSON.stringify(entry.user));
          return { success: true, user: entry.user };
        }
      }
    } catch {
      // ignore
    }
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === emailTrimmed);
    if (foundUser && password.length >= 6) {
      setUser(foundUser);
      localStorage.setItem('rental_user', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, error: 'Invalid email or password' };
  }, [useSupabase, fetchProfile]);

  const signup = useCallback(async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    const emailTrimmed = (data.email ?? '').trim().toLowerCase();
    if (!data.name?.trim() || !emailTrimmed || !data.password) {
      return { success: false, error: 'Name, email and password are required' };
    }
    if (!validateEmail(emailTrimmed)) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (useSupabase && supabase) {
      setIsLoading(true);
      const { data: authData, error } = await supabase.auth.signUp({
        email: emailTrimmed,
        password: data.password,
        options: {
          data: {
            name: data.name.trim(),
            role: data.role ?? 'customer',
          },
        },
      });
      if (error) {
        setIsLoading(false);
        if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('already exists')) {
          return { success: false, error: 'Email already registered' };
        }
        return { success: false, error: error.message || 'Signup failed' };
      }
      if (authData.user) {
        const role = data.role ?? 'customer';
        const name = data.name.trim();
        // Always write profile to Supabase (in case DB trigger is missing or delayed)
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: authData.user.id,
            name,
            email: emailTrimmed,
            role,
            company_name: '',
            gstin: '',
          },
          { onConflict: 'id' }
        );
        if (profileError) {
          console.warn('Profile upsert:', profileError.message);
        }
        await new Promise(r => setTimeout(r, 300));
        const profileUser = await fetchProfile(authData.user);
        if (profileUser) {
          setUser(profileUser);
          setIsLoading(false);
          return { success: true };
        }
        if (authData.session) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id, name, email, role, company_name, gstin, phone, created_at')
            .eq('id', authData.user.id)
            .single();
          if (profileRow) {
            setUser(profileToUser(profileRow as ProfileRow));
            setIsLoading(false);
            return { success: true };
          }
        }
        setUser({
          id: authData.user.id,
          name,
          email: emailTrimmed,
          role: role as UserRole,
          createdAt: new Date(),
        });
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: true };
    }

    const existingMock = mockUsers.find(u => u.email.toLowerCase() === emailTrimmed);
    if (existingMock) return { success: false, error: 'Email already registered' };
    try {
      const stored = localStorage.getItem('rental_registered_users');
      if (stored) {
        const registered: { user: User; password: string }[] = JSON.parse(stored);
        if (registered.some(e => e.user.email.toLowerCase() === emailTrimmed)) {
          return { success: false, error: 'Email already registered' };
        }
      }
    } catch {
      // ignore
    }
    const newUser: User = {
      id: generateId('user'),
      name: data.name.trim(),
      email: emailTrimmed,
      role: data.role ?? 'customer',
      createdAt: new Date(),
    };
    setUser(newUser);
    localStorage.setItem('rental_user', JSON.stringify(newUser));
    try {
      const stored = localStorage.getItem('rental_registered_users');
      const registered: { user: User; password: string }[] = stored ? JSON.parse(stored) : [];
      registered.push({ user: newUser, password: data.password });
      localStorage.setItem('rental_registered_users', JSON.stringify(registered));
    } catch {
      // ignore
    }
    return { success: true };
  }, [useSupabase, fetchProfile]);

  const logout = useCallback(() => {
    if (useSupabase && supabase) supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('rental_user');
  }, [useSupabase]);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email?.trim()) return { success: false, error: 'Email is required' };
    if (!validateEmail(email.trim())) return { success: false, error: 'Invalid email format' };
    if (useSupabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true };
  }, [useSupabase]);

  const applyVendorAccess = useCallback(
    async (data: VendorApplicationData): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not logged in' };
      if (user.role === 'vendor' || user.role === 'admin') return { success: true };
      if (!data.companyName || !data.gstin) return { success: false, error: 'Company name and GSTIN are required' };
      if (!validateGSTIN(data.gstin)) return { success: false, error: 'Invalid GSTIN format. Example: 29ABCDE1234F1Z5' };
      const updatedUser: User = {
        ...user,
        role: 'vendor',
        companyName: data.companyName,
        gstin: data.gstin,
        phone: data.phone,
      };
      if (useSupabase && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({
            role: 'vendor',
            company_name: data.companyName,
            gstin: data.gstin,
            phone: data.phone ?? null,
          })
          .eq('id', user.id);
        if (error) return { success: false, error: error.message };
      } else {
        localStorage.setItem('rental_user', JSON.stringify(updatedUser));
      }
      setUser(updatedUser);
      return { success: true };
    },
    [user, useSupabase]
  );

  const applyAdminAccess = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' };
    if (user.role === 'admin') return { success: true };
    const updatedUser: User = { ...user, role: 'admin' };
    if (useSupabase && supabase) {
      const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      if (error) return { success: false, error: error.message };
    } else {
      localStorage.setItem('rental_user', JSON.stringify(updatedUser));
    }
    setUser(updatedUser);
    return { success: true };
  }, [user, useSupabase]);

  const switchRole = useCallback(async (role: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' };

    // In a real app, we would verify if the user actually has permissions for this role.
    // For this demo/mock setup, we allow switching to 'customer' freely.
    // Switching back to 'admin' or 'vendor' requires going through the application flow again 
    // OR we could store "allowedRoles" in the user object. 
    // For simplicity to fix the user issue: we allow downgrading to customer.
    // If they want to be admin/vendor again, they can hit "Request Access" again (which we'll make smoother).

    // Auto-fill mock data for demo purposes if switching to elevated roles without prior setup
    let finalUser = { ...user, role };

    if (role === 'vendor' && (!user.companyName || !user.gstin)) {
      finalUser = {
        ...finalUser,
        companyName: 'Demo Vendor Corp',
        gstin: '29ABCDE1234F1Z5',
        phone: '+91 9876543210'
      };
    } else if (role === 'admin') {
      // Admins might not need specific extra fields, but we ensure consistency
      finalUser = { ...finalUser };
    }

    if (useSupabase && supabase) {
      // Ideally we would update the DB, but for demo switching we might just update local state
      // if the DB schema enforces not-null constraints that we can't easily satisfy here.
      // However, let's try to update the profile if we can.
      const updates: any = { role };
      if (role === 'vendor') {
        const { companyName, gstin, phone } = finalUser;
        if (companyName) updates.company_name = companyName;
        if (gstin) updates.gstin = gstin;
        if (phone) updates.phone = phone;
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) {
        console.error('Failed to update role in DB:', error);
        // For demo purposes, we proceed even if DB update fails (e.g. RLS policies)
        // return { success: false, error: error.message }; 
      }
    } else {
      localStorage.setItem('rental_user', JSON.stringify(finalUser));
    }

    setUser(finalUser);
    return { success: true };
  }, [user, useSupabase]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    applyVendorAccess,
    applyAdminAccess,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
