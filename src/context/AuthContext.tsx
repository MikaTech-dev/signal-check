'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { UserAccount, UserRole } from '@/types';
import { authApi, apiClient } from '@/lib/api';
import { signalStore } from '@/lib/store';

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuspended: boolean;
  login: (payload: { email: string; password?: string }, redirectUrl?: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password?: string }, redirectUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setIsSuspended(false);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        setIsSuspended(res.data.status === 'SUSPENDED');
        signalStore.setCurrentUser(res.data);
      } else {
        setUser(null);
        setIsSuspended(false);
      }
    } catch (err: unknown) {
      const typedErr = err as { statusCode?: number; message?: string };
      if (typedErr.statusCode === 403 && typedErr.message?.toLowerCase().includes('suspend')) {
        setIsSuspended(true);
      } else {
        // User is not authenticated
        setUser(null);
        setIsSuspended(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    apiClient.setOnUnauthorized(handleUnauthorized);
    refreshSession();
  }, [handleUnauthorized, refreshSession]);

  const login = async (payload: { email: string; password?: string }, redirectUrl?: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsSuspended(res.data.user.status === 'SUSPENDED');
        signalStore.setCurrentUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}`);
        router.push(redirectUrl || '/nearby');
      }
    } catch (err: unknown) {
      const typedErr = err as { statusCode?: number; message?: string };
      if (typedErr.statusCode === 403) {
        setIsSuspended(true);
        toast.error('Account Suspended', {
          description: typedErr.message || 'Your account has been restricted by an administrator.',
        });
      } else {
        toast.error('Sign In Failed', {
          description: typedErr.message || 'Please verify your credentials and try again.',
        });
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    payload: {
      name: string;
      email: string;
      phone: string;
      password?: string;
    },
    redirectUrl?: string
  ) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsSuspended(res.data.user.status === 'SUSPENDED');
        signalStore.setCurrentUser(res.data.user);
        toast.success('Account created successfully', {
          description: 'Welcome to the SignalNG incident network.',
        });
        router.push(redirectUrl || '/nearby');
      }
    } catch (err: unknown) {
      const typedErr = err as { statusCode?: number; message?: string };
      toast.error('Registration Failed', {
        description: typedErr.message || 'Unable to complete registration. Please try again.',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setIsSuspended(false);
      setIsLoading(false);
      signalStore.resetToDefaultSeed();
      toast.info('Signed out successfully');
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !isSuspended,
        isLoading,
        isSuspended,
        login,
        register,
        logout,
        refreshSession,
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
