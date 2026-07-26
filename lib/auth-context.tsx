'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'EMPLOYER' | 'CANDIDATE' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (fullName: string, email: string, password: string, role: UserRole, companyName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('CANDIDATE');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Stable ref — never recreated, never triggers re-renders or effect re-runs
  const supabase = useRef(createClient()).current;

  const buildAuthUser = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
    const meta = supabaseUser.user_metadata || {};

    let { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();

    if (!dbUser) {
      const metaRole = (meta.role as UserRole) || 'CANDIDATE';
      // ignoreDuplicates: true — never overwrite an existing row's role
      const { data: upserted } = await supabase.from('users').upsert({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: metaRole,
      }, { onConflict: 'id', ignoreDuplicates: true }).select('role').single();
      dbUser = upserted || { role: metaRole };
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      fullName: meta.full_name || meta.fullName || supabaseUser.email?.split('@')[0] || 'User',
      role: (dbUser.role as UserRole) || 'CANDIDATE',
      avatarUrl: meta.avatar_url || meta.avatarUrl,
      companyName: meta.company_name || meta.companyName,
    };
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const authUser = await buildAuthUser(supabaseUser);
      setUser(authUser);
      setRole(authUser.role);
    }
  }, [supabase, buildAuthUser]);

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const authUser = await buildAuthUser(s.user);
        setUser(authUser);
        setRole(authUser.role);
      }
      setIsLoading(false);
    });

    // Auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user) {
        const authUser = await buildAuthUser(s.user);
        setUser(authUser);
        setRole(authUser.role);
      } else {
        setUser(null);
        setRole('CANDIDATE');
      }
      setIsLoading(false);
    });

    // Re-fetch role on tab focus only when a session exists
    const handleFocus = () => {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (s?.user) refreshUser();
      });
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps — supabase is a stable ref, runs once on mount only

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    targetRole: UserRole,
    companyName?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: targetRole,
          company_name: companyName || null,
        },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
