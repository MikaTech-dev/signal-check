'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ChevronDown, Lock, Mail, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    name: 'Administrator (Adaeze)',
    email: 'admin@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-[#0A0A0A] text-white',
  },
  {
    role: 'MODERATOR',
    name: 'Moderator (Tari)',
    email: 'moderator@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-stone-800 text-white',
  },
  {
    role: 'ANCHOR',
    name: 'Stationary Anchor (Musa)',
    email: 'anchor@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-amber-100 text-amber-950 border border-amber-300',
  },
  {
    role: 'REPORTER',
    name: 'Field Reporter',
    email: 'reporter@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-emerald-100 text-emerald-950 border border-emerald-300',
  },
  {
    role: 'RESIDENT',
    name: 'Resident 1 (Lugbe Central)',
    email: 'resident1@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-[#F5F5F4] text-[#0A0A0A]',
  },
  {
    role: 'RESIDENT',
    name: 'Resident 2 (Airport Corridor)',
    email: 'resident2@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-[#F5F5F4] text-[#0A0A0A]',
  },
  {
    role: 'RESIDENT',
    name: 'Resident 3 (Federal Housing)',
    email: 'resident3@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-[#F5F5F4] text-[#0A0A0A]',
  },
  {
    role: 'SUSPENDED',
    name: 'Suspended Account (Enforcement Demo)',
    email: 'suspended@signalng.local',
    password: 'Password123!',
    badgeBg: 'bg-rose-100 text-rose-950 border border-rose-300',
  },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [selectedDemoName, setSelectedDemoName] = useState<string | null>(null);
  const demoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        demoDropdownRef.current &&
        !demoDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDemoDropdown(false);
      }
    };
    if (showDemoDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDemoDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await login({ email, password });
    } catch {
      // Toast handled by AuthContext
    }
  };

  const handleSelectDemoAccount = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemoName(acc.name);
    setShowDemoDropdown(false);
    toast.success(`Demo credentials loaded: ${acc.name}`, {
      description: `${acc.email} with role ${acc.role}`,
    });
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
              Sign in to network
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
                      placeholder="amara@kfest.org"
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

              {/* Demo Accounts Dropdown */}
              <div className="pt-6 border-t border-[#F5F5F4] space-y-3" ref={demoDropdownRef}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                    Test Demo Accounts
                  </span>
                  <span className="text-[11px] font-semibold text-[#A8A29E]">8 Pre-seeded</span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                    className={`w-full p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between min-h-[44px] ${
                      showDemoDropdown
                        ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
                        : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#0A0A0A] hover:border-[#0A0A0A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${showDemoDropdown ? 'text-[#C7862B]' : 'text-[#737373]'}`} />
                      <span>{selectedDemoName || 'Select a demo account to quick-fill...'}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showDemoDropdown ? 'rotate-180 text-white' : 'text-[#737373]'
                      }`}
                    />
                  </button>

                  {showDemoDropdown && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-[#0A0A0A]/20 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] p-2 z-50 max-h-72 overflow-y-auto space-y-1 divide-y divide-[#F5F5F4] animate-in fade-in slide-in-from-top-2 duration-150">
                      {DEMO_ACCOUNTS.map((acc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectDemoAccount(acc)}
                          className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between group ${
                            email === acc.email
                              ? 'bg-[#0A0A0A] text-white'
                              : 'hover:bg-[#FAFAF9] text-[#0A0A0A]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">{acc.name}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  email === acc.email
                                    ? 'bg-white/20 text-white'
                                    : acc.badgeBg
                                }`}
                              >
                                {acc.role}
                              </span>
                            </div>
                            <div
                              className={`text-[11px] font-mono ${
                                email === acc.email ? 'text-gray-300' : 'text-[#737373]'
                              }`}
                            >
                              {acc.email}
                            </div>
                          </div>
                          <div
                            className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                              email === acc.email
                                ? 'bg-[#C7862B] text-black'
                                : 'bg-black/5 text-[#737373] group-hover:bg-[#0A0A0A] group-hover:text-white transition-colors'
                            }`}
                          >
                            Fill
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="text-center text-xs text-[#57534E]">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-bold text-[#0A0A0A] underline hover:text-[#C7862B] transition-colors">
              Create an account
            </Link>
          </div>

        </div>
      </div>
  );
}
