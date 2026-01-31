import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers, validateGSTIN, validateEmail, generateId } from '@/data/mockData';

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
}

interface SignupData {
  name: string;
  email: string;
  companyName: string;
  gstin: string;
  password: string;
  confirmPassword: string;
  couponCode?: string;
  role?: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('rental_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('rental_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validate inputs
        if (!email || !password) {
          setIsLoading(false);
          resolve({ success: false, error: 'Email and password are required' });
          return;
        }

        if (!validateEmail(email)) {
          setIsLoading(false);
          resolve({ success: false, error: 'Invalid email format' });
          return;
        }

        // Find user (simulated)
        const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (foundUser && password.length >= 6) {
          setUser(foundUser);
          localStorage.setItem('rental_user', JSON.stringify(foundUser));
          setIsLoading(false);
          resolve({ success: true, user: foundUser });
        } else {
          setIsLoading(false);
          resolve({ success: false, error: 'Invalid email or password' });
        }
      }, 1000);
    });
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validate inputs
        if (!data.name || !data.email || !data.companyName || !data.gstin || !data.password) {
          setIsLoading(false);
          resolve({ success: false, error: 'All fields are required' });
          return;
        }

        if (!validateEmail(data.email)) {
          setIsLoading(false);
          resolve({ success: false, error: 'Invalid email format' });
          return;
        }

        if (!validateGSTIN(data.gstin)) {
          setIsLoading(false);
          resolve({ success: false, error: 'Invalid GSTIN format. Example: 29ABCDE1234F1Z5' });
          return;
        }

        if (data.password.length < 6) {
          setIsLoading(false);
          resolve({ success: false, error: 'Password must be at least 6 characters' });
          return;
        }

        if (data.password !== data.confirmPassword) {
          setIsLoading(false);
          resolve({ success: false, error: 'Passwords do not match' });
          return;
        }

        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        if (existingUser) {
          setIsLoading(false);
          resolve({ success: false, error: 'Email already registered' });
          return;
        }

        // Create new user (simulated) - all new users are customers
        const newUser: User = {
          id: generateId('user'),
          name: data.name,
          email: data.email,
          role: data.role ?? 'customer',
          companyName: data.companyName,
          gstin: data.gstin,
          createdAt: new Date(),
        };

        setUser(newUser);
        localStorage.setItem('rental_user', JSON.stringify(newUser));
        setIsLoading(false);
        resolve({ success: true });
      }, 1500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('rental_user');
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!email) {
          resolve({ success: false, error: 'Email is required' });
          return;
        }

        if (!validateEmail(email)) {
          resolve({ success: false, error: 'Invalid email format' });
          return;
        }

        // Simulate sending email
        resolve({ success: true });
      }, 1000);
    });
  }, []);

  const applyVendorAccess = useCallback(
    async (data: VendorApplicationData): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not logged in' };
      if (user.role === 'vendor' || user.role === 'admin') {
        return { success: true };
      }
      if (!data.companyName || !data.gstin) {
        return { success: false, error: 'Company name and GSTIN are required' };
      }
      if (!validateGSTIN(data.gstin)) {
        return { success: false, error: 'Invalid GSTIN format. Example: 29ABCDE1234F1Z5' };
      }
      const updatedUser: User = {
        ...user,
        role: 'vendor',
        companyName: data.companyName,
        gstin: data.gstin,
        phone: data.phone,
      };
      setUser(updatedUser);
      localStorage.setItem('rental_user', JSON.stringify(updatedUser));
      return { success: true };
    },
    [user]
  );

  const applyAdminAccess = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' };
    if (user.role === 'admin') return { success: true };
    // For demo: grant admin access. In production this would send a request for approval.
    const updatedUser: User = { ...user, role: 'admin' };
    setUser(updatedUser);
    localStorage.setItem('rental_user', JSON.stringify(updatedUser));
    return { success: true };
  }, [user]);

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
