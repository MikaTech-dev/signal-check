'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Radio,
  PlusCircle,
  Clock,
  User,
  ShieldCheck,
  SlidersHorizontal,
  HelpCircle,
  Bell,
  AlertTriangle,
  Layers,
  ChevronDown,
  LogOut,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { signalStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { NotificationSheet } from '@/components/layout/NotificationSheet';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState(user || signalStore.getCurrentUser());
  const [notifications, setNotifications] = useState(signalStore.getNotifications());
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const previousNotifsCountRef = useRef(notifications.length);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleSwitcherRef.current &&
        !roleSwitcherRef.current.contains(event.target as Node)
      ) {
        setShowRoleSwitcher(false);
      }
    };
    if (showRoleSwitcher) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleSwitcher]);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = signalStore.subscribe(() => {
      const updatedUser = user || signalStore.getCurrentUser();
      const updatedNotifs = signalStore.getNotifications();
      setCurrentUser(updatedUser);
      setNotifications(updatedNotifs);

      // Trigger Sonner toast for newly received 5 km perimeter notifications
      if (updatedNotifs.length > previousNotifsCountRef.current) {
        const latestNotif = updatedNotifs[0];
        if (latestNotif && !latestNotif.read) {
          toast.warning(latestNotif.title, {
            description: `${latestNotif.locationLabel}: ${latestNotif.message}`,
            action: {
              label: 'Inspect',
              onClick: () => router.push(`/nearby?incident=${latestNotif.incidentId}`),
            },
            duration: 7000,
          });
        }
      }
      previousNotifsCountRef.current = updatedNotifs.length;
    });
    return () => unsubscribe();
  }, [router, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleChange = (role: UserRole) => {
    signalStore.switchRole(role);
    setShowRoleSwitcher(false);
    toast.info(`Switched persona to ${role}`, {
      description: `Viewing interface as ${signalStore.getCurrentUser().name}.`,
    });
  };

  const navItems = [
    {
      label: 'Nearby Radar',
      href: '/nearby',
      active: pathname === '/nearby',
      icon: Radio,
    },
    {
      label: 'Log Report',
      href: '/report',
      active: pathname === '/report',
      icon: PlusCircle,
    },
    {
      label: 'My Activity',
      href: '/activity',
      active: pathname === '/activity',
      icon: Clock,
    },
    {
      label: 'Profile',
      href: '/profile',
      active: pathname === '/profile',
      icon: User,
    },
  ];

  const roleExtraLinks = [];
  if (currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR') {
    roleExtraLinks.push({ label: 'Anchor Board', href: '/anchor', icon: ShieldCheck });
  } else if (currentUser.role === 'MODERATOR') {
    roleExtraLinks.push({ label: 'Triage Queue', href: '/moderator', icon: SlidersHorizontal });
  } else if (currentUser.role === 'ADMIN') {
    roleExtraLinks.push({ label: 'Audit Logs', href: '/admin', icon: Layers });
  }

  // If on landing page or auth pages, render specialized layouts
  if (isLandingPage || isAuthPage) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] text-[#0A0A0A] font-sans antialiased flex flex-col selection:bg-[#C7862B]/20 selection:text-[#0A0A0A]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] text-[#0A0A0A] font-sans antialiased flex flex-col selection:bg-[#C7862B]/20 selection:text-[#0A0A0A]">
      
      {/* Top Fluid Island Header */}
      <div className="sticky top-4 z-40 px-4 pointer-events-none mb-4">
        <header className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto bg-[#FAFAF9]/85 backdrop-blur-xl border border-black/5 rounded-full px-6 py-3.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)]">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/signal.png"
                alt="SignalNG"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="font-bold text-base tracking-tight group-hover:text-[#C7862B] transition-colors">
                SignalNG
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-black/5 p-1 rounded-full text-xs font-bold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-full transition-all ${
                    item.active
                      ? 'bg-white text-[#0A0A0A] shadow-xs'
                      : 'text-[#737373] hover:text-[#0A0A0A]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/help"
              title="Verification Help & Guide"
              className="w-9 h-9 rounded-full border border-black/5 bg-white flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative w-9 h-9 rounded-full border border-black/5 bg-white flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
              title="Perimeter Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#991B1B] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={roleSwitcherRef}>
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all min-h-[36px] ${
                    showRoleSwitcher
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-xs'
                      : 'border-black/10 bg-white text-[#0A0A0A] hover:border-[#0A0A0A]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${showRoleSwitcher ? 'bg-white' : 'bg-[#C7862B]'}`} />
                  <span className="capitalize">{currentUser.role.toLowerCase()}</span>
                  <ChevronDown className={`w-3.5 h-3.5 ${showRoleSwitcher ? 'text-white' : 'text-[#737373]'}`} />
                </button>

                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-[#0A0A0A]/20 rounded-2xl shadow-[0_20px_48px_-8px_rgba(0,0,0,0.18)] p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 text-[10px] font-bold text-[#737373] uppercase tracking-wider border-b border-[#F5F5F4] mb-1">
                      Simulate Role Persona
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('RESIDENT')}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        currentUser.role === 'RESIDENT' ? 'bg-[#0A0A0A] text-white font-bold' : 'hover:bg-[#FAFAF9] text-[#0A0A0A]'
                      }`}
                    >
                      <span>Resident (Amara)</span>
                      {currentUser.role === 'RESIDENT' && <span className="text-[#C7862B] font-bold">&bull;</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('ANCHOR')}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR' ? 'bg-[#0A0A0A] text-white font-bold' : 'hover:bg-[#FAFAF9] text-[#0A0A0A]'
                      }`}
                    >
                      <span>Anchor (Musa)</span>
                      {(currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR') && <span className="text-[#C7862B] font-bold">&bull;</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('MODERATOR')}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        currentUser.role === 'MODERATOR' ? 'bg-[#0A0A0A] text-white font-bold' : 'hover:bg-[#FAFAF9] text-[#0A0A0A]'
                      }`}
                    >
                      <span>Moderator (Tari)</span>
                      {currentUser.role === 'MODERATOR' && <span className="text-[#C7862B] font-bold">&bull;</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('ADMIN')}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        currentUser.role === 'ADMIN' ? 'bg-[#0A0A0A] text-white font-bold' : 'hover:bg-[#FAFAF9] text-[#0A0A0A]'
                      }`}
                    >
                      <span>Admin (Adaeze)</span>
                      {currentUser.role === 'ADMIN' && <span className="text-[#C7862B] font-bold">&bull;</span>}
                    </button>

                    <div className="pt-2 mt-1 border-t border-[#F5F5F4]">
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 text-[#991B1B] hover:bg-rose-50 font-semibold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="group flex items-center gap-2 rounded-full bg-[#0A0A0A] pl-4 pr-1.5 py-1.5 text-white hover:bg-[#262626] transition-all active:scale-[0.98]"
              >
                <span className="text-xs font-bold">Sign In</span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            )}
          </div>
        </header>

        {roleExtraLinks.length > 0 && (
          <div className="max-w-5xl mx-auto mt-2 px-6 flex items-center gap-2 pointer-events-auto">
            <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
              {currentUser.role}:
            </span>
            {roleExtraLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                  pathname === link.href
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-white border border-[#E7E5E4] text-[#171717] hover:border-[#0A0A0A]'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notification Slide-Over Sheet */}
      <NotificationSheet
        open={showNotifDrawer}
        onOpenChange={setShowNotifDrawer}
        notifications={notifications}
        onSelectNotification={(incidentId) => router.push(`/nearby?incident=${incidentId}`)}
      />

      {/* Main Page Slot */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-28 sm:pb-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation Pill Bar */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 sm:hidden pointer-events-none">
        <div className="max-w-md mx-auto bg-[#FAFAF9]/90 backdrop-blur-xl border border-black/10 rounded-full p-1.5 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12)] grid grid-cols-4 gap-1 pointer-events-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-full min-h-[44px] transition-all ${
                  item.active
                    ? 'text-white font-bold bg-[#0A0A0A] shadow-xs'
                    : 'text-[#737373] hover:text-[#0A0A0A]'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-[#C7862B]' : 'text-[#737373]'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
