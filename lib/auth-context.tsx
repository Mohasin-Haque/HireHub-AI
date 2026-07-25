'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'EMPLOYER' | 'CANDIDATE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  signup: (fullName: string, email: string, role: UserRole, companyName?: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const DEFAULT_USER: User = {
  id: 'user-cand-1',
  email: 'alex.morgan@example.com',
  fullName: 'Alex Morgan',
  role: 'CANDIDATE',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

const setSessionCookie = (user: User) => {
  if (typeof window !== 'undefined') {
    document.cookie = `hirehub_user_session=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;
  }
};

const removeSessionCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'hirehub_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('CANDIDATE');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session in localStorage
    const savedUser = localStorage.getItem('hirehub_user_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(parsed.role);
        setSessionCookie(parsed);
      } catch {
        setUser(DEFAULT_USER);
        setRole('CANDIDATE');
        setSessionCookie(DEFAULT_USER);
      }
    } else {
      // Default to demo Candidate session
      setUser(DEFAULT_USER);
      setRole('CANDIDATE');
      localStorage.setItem('hirehub_user_session', JSON.stringify(DEFAULT_USER));
      setSessionCookie(DEFAULT_USER);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, targetRole: UserRole = 'CANDIDATE') => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));

    const loggedUser: User = {
      id: targetRole === 'EMPLOYER' ? 'user-emp-1' : 'user-cand-1',
      email,
      fullName: email.split('@')[0].replace('.', ' '),
      role: targetRole,
      avatarUrl: targetRole === 'EMPLOYER' 
        ? 'https://avatar.vercel.sh/employer?text=EMP' 
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      companyName: targetRole === 'EMPLOYER' ? 'Vercel Inc.' : undefined,
    };

    setUser(loggedUser);
    setRole(targetRole);
    localStorage.setItem('hirehub_user_session', JSON.stringify(loggedUser));
    setSessionCookie(loggedUser);
    setIsLoading(false);
  };

  const signup = async (fullName: string, email: string, targetRole: UserRole, companyName?: string) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      fullName,
      role: targetRole,
      avatarUrl: `https://avatar.vercel.sh/${encodeURIComponent(fullName)}`,
      companyName: targetRole === 'EMPLOYER' ? (companyName || 'My Startup') : undefined,
    };

    setUser(newUser);
    setRole(targetRole);
    localStorage.setItem('hirehub_user_session', JSON.stringify(newUser));
    setSessionCookie(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hirehub_user_session');
    removeSessionCookie();
    router.push('/');
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (user) {
      const updated = {
        ...user,
        role: newRole,
        companyName: newRole === 'EMPLOYER' ? (user.companyName || 'HireHub Partner Tech') : undefined,
      };
      setUser(updated);
      localStorage.setItem('hirehub_user_session', JSON.stringify(updated));
      setSessionCookie(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
