'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ShieldAlert, Lock, AlertTriangle, ArrowRight, Loader2, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface RouteGuardProps {
  children: React.ReactNode;
  mode?: 'PUBLIC_ONLY' | 'AUTHENTICATED' | 'ROLE_PROTECTED';
  allowedRoles?: UserRole[];
}

export function RouteGuard({
  children,
  mode = 'ROLE_PROTECTED',
  allowedRoles = [],
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading, isSuspended, logout } = useAuth();
  const pathname = usePathname();

  // Loading state skeleton
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto my-12 space-y-6 animate-pulse">
        <div className="h-8 bg-black/5 rounded-2xl w-48" />
        <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-black/5" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-black/5 rounded-lg w-1/3" />
                <div className="h-4 bg-black/5 rounded-lg w-1/2" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-[#F5F5F4]">
              <div className="h-4 bg-black/5 rounded-lg w-full" />
              <div className="h-4 bg-black/5 rounded-lg w-4/5" />
              <div className="h-4 bg-black/5 rounded-lg w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Account suspended guard
  if (isSuspended) {
    return (
      <div className="max-w-xl mx-auto my-12 p-2 rounded-[2.5rem] bg-rose-50 border border-rose-200 shadow-xs">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 md:p-10 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-[#991B1B]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
              Account Suspended
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Your account access has been restricted by an administrator due to policy enforcement. You cannot submit reports or updates.
            </p>
          </div>
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => logout()}
              className="px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated requirement guard
  if ((mode === 'AUTHENTICATED' || mode === 'ROLE_PROTECTED') && (!user || !isAuthenticated)) {
    const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
    return (
      <div className="max-w-xl mx-auto my-12 p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 md:p-10 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-[#0A0A0A]">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
              Sign In Required
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              You must be signed in to access this section of SignalNG.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/login${redirectParam}`}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] min-h-[44px]"
            >
              <LogIn className="w-4 h-4 text-[#C7862B]" />
              <span>Sign In to Account</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D6D3D1] text-[#0A0A0A] text-xs font-bold hover:border-[#0A0A0A] flex items-center justify-center gap-2 transition-colors min-h-[44px]"
            >
              <UserPlus className="w-4 h-4 text-[#737373]" />
              <span>Register New Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Role protected guard (for authenticated users with specific role requirements)
  if (mode === 'ROLE_PROTECTED' && allowedRoles.length > 0) {
    const userRole = user?.role as UserRole | undefined;
    const hasRole = userRole && allowedRoles.includes(userRole);

    if (!hasRole) {
      return (
        <div className="max-w-xl mx-auto my-12 p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 md:p-10 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-[#0A0A0A]">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
                Restricted Access
              </h2>
              <p className="text-sm text-[#57534E] leading-relaxed">
                This dashboard requires elevated permissions ({allowedRoles.join(', ')}). Your current role is{' '}
                <span className="font-bold text-[#0A0A0A]">{user?.role || 'RESIDENT'}</span>.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
              >
                Sign In with Authorized Account
              </Link>
              <Link
                href="/nearby"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D6D3D1] text-[#0A0A0A] text-xs font-bold hover:border-[#0A0A0A] transition-colors"
              >
                Return to Radar
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
