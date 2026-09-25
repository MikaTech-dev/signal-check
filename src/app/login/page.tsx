'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70dvh] flex items-center justify-center text-sm text-[#737373]">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await login({ email, password }, redirectUrl);
    } catch {
      // Toast handled by AuthContext
    }
  };

  return (
    <div className="min-h-[75dvh] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A]">
            Sign In
          </h1>
          <p className="text-sm text-[#57534E] max-w-sm mx-auto">
            Access the hyper-local crisis radar and verify real-time corridor reports.
          </p>
        </div>

        {/* Double-Bezel Card Container */}
        <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-sm">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                  Email or Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. amara@example.com"
                    className="w-full text-base p-4 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-base p-4 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="group w-full py-3.5 pl-6 pr-2 rounded-full bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#262626] disabled:opacity-50 transition-all flex items-center justify-between active:scale-[0.98]"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center text-xs text-[#57534E]">
          Do not have an account yet?{' '}
          <Link href="/register" className="font-bold text-[#0A0A0A] underline hover:text-[#C7862B] transition-colors">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
