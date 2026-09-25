'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    try {
      await register({ name, email, phone, password: password || undefined });
    } catch {
      // Toast handled by AuthContext
    }
  };

  return (
    <div className="min-h-[85dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src="/signal.png"
                alt="SignalNG"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="font-bold text-xl tracking-tight text-[#0A0A0A] group-hover:text-[#C7862B] transition-colors">
                SignalNG
              </span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A]">
              Create an account
            </h1>
            <p className="text-sm text-[#57534E] max-w-sm mx-auto">
              Join your local transit corridor network and receive 5 km perimeter crisis triage alerts.
            </p>
          </div>

          {/* Double-Bezel Card Container */}
          <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-sm">
            <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amara Okoye"
                    className="w-full text-base p-3.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amara@kfest.org"
                    className="w-full text-base p-3.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 802 000 1122"
                    className="w-full text-base p-3.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-base p-3.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading || !name || !email || !phone}
                    className="group w-full py-3.5 pl-6 pr-2 rounded-full bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#262626] disabled:opacity-50 transition-all flex items-center justify-between active:scale-[0.98]"
                  >
                    <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center text-xs text-[#57534E]">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-[#0A0A0A] underline hover:text-[#C7862B] transition-colors">
              Sign in
            </Link>
          </div>

        </div>
      </div>
  );
}
