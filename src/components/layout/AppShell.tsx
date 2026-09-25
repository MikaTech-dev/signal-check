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
import { incidentsApi } from '@/lib/api';
import { NotificationSheet } from '@/components/layout/NotificationSheet';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState(signalStore.getNotifications());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const previousNotifsCountRef = useRef(notifications.length);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Sync real-time notifications dynamically from backend API
  useEffect(() => {
    const fetchLiveIncidents = async () => {
      try {
        const userCoords = signalStore.getUserCoordinates();
        const res = await incidentsApi.getNearby(userCoords.latitude, userCoords.longitude, 10);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const normalized = res.data.map((item) => ({
            ...item,
            coordinates: item.coordinates || {
              latitude: item.latitude || 0,
              longitude: item.longitude || 0,
            },
            firstReportedAt: item.firstReportedAt || item.createdAt || new Date().toISOString(),
            lastReaffirmedAt: item.lastReaffirmedAt || item.updatedAt || new Date().toISOString(),
            expiresAt: item.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            reportCount: item.reportCount || 1,
            firsthandCount: item.firsthandCount || 0,
            contradictionCount: item.contradictionCount || 0,
            hearsayCount: item.hearsayCount || 0,
            supportingFacts: item.supportingFacts || (item.summary ? [item.summary] : []),
            contradictingFacts: item.contradictingFacts || [],
            missingDetails: item.missingDetails || [],
            suggestedVerificationChecks: item.suggestedVerificationChecks || [],
            synthesisSummary: item.synthesisSummary || item.summary || '',
            convergenceStatus: item.convergenceStatus || 'STATIC',
            triageStatus: item.triageStatus || 'ACTIVE_ALERT',
          }));
          signalStore.syncNotificationsFromIncidents(normalized, userCoords);
        } else {
          signalStore.syncNotificationsFromIncidents(signalStore.getIncidents(), userCoords);
        }
      } catch {
        signalStore.syncNotificationsFromIncidents(signalStore.getIncidents());
      }
    };

    fetchLiveIncidents();
    const interval = setInterval(fetchLiveIncidents, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = signalStore.subscribe(() => {
      const updatedNotifs = signalStore.getNotifications();
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
  }, [router]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const desktopNavItems = isAuthenticated
    ? [
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
      ]
    : [
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
          label: 'How It Works',
          href: '/help',
          active: pathname === '/help',
          icon: HelpCircle,
        },
      ];

  const mobileNavItems = isAuthenticated
    ? [
        {
          label: 'Nearby',
          href: '/nearby',
          active: pathname === '/nearby',
          icon: Radio,
        },
        {
          label: 'Report',
          href: '/report',
          active: pathname === '/report',
          icon: PlusCircle,
        },
        {
          label: 'Activity',
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
      ]
    : [
        {
          label: 'Nearby',
          href: '/nearby',
          active: pathname === '/nearby',
          icon: Radio,
        },
        {
          label: 'Report',
          href: '/report',
          active: pathname === '/report',
          icon: PlusCircle,
        },
        {
          label: 'Guide',
          href: '/help',
          active: pathname === '/help',
          icon: HelpCircle,
        },
        {
          label: 'Sign In',
          href: '/login',
          active: pathname === '/login',
          icon: User,
        },
      ];

  const roleExtraLinks = [];
  if (isAuthenticated && user) {
    if (user.role === 'ANCHOR' || user.role === 'COMMUNITY_ANCHOR') {
      roleExtraLinks.push({ label: 'Anchor Board', href: '/anchor', icon: ShieldCheck });
    } else if (user.role === 'MODERATOR') {
      roleExtraLinks.push({ label: 'Triage Queue', href: '/moderator', icon: SlidersHorizontal });
    } else if (user.role === 'ADMIN') {
      roleExtraLinks.push({ label: 'Audit Logs', href: '/admin', icon: Layers });
    }
  }

  // Auth pages render without standard chrome
  if (isAuthPage) {
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
              {desktopNavItems.map((item) => (
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

            {isLoading ? (
              <div className="w-20 h-9 bg-black/5 rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all min-h-[36px] ${
                    showUserMenu
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-xs'
                      : 'border-black/10 bg-white text-[#0A0A0A] hover:border-[#0A0A0A]'
                  }`}
                  aria-label="User Account Menu"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    showUserMenu ? 'bg-white text-[#0A0A0A]' : 'bg-stone-100 text-[#0A0A0A]'
                  }`}>
                    {user.name.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <span className="max-w-[110px] truncate">{user.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    showUserMenu ? 'bg-white/20 text-white' : 'bg-stone-100 text-[#57534E]'
                  }`}>
                    {user.role.toLowerCase()}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 ${showUserMenu ? 'text-white' : 'text-[#737373]'}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#0A0A0A]/15 rounded-2xl shadow-[0_20px_48px_-8px_rgba(0,0,0,0.18)] p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2.5 border-b border-[#F5F5F4] mb-1">
                      <div className="font-bold text-[#0A0A0A] text-sm truncate">{user.name}</div>
                      <div className="text-[11px] text-[#737373] truncate">{user.emailOrPhone}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAFAF9] border border-[#E7E5E4] text-[10px] font-bold text-[#0A0A0A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C7862B]" />
                        <span>Role: {user.role}</span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-[#FAFAF9] text-[#0A0A0A] font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-[#737373]" />
                      <span>Account Profile & Preferences</span>
                    </Link>

                    {user.role === 'ANCHOR' || user.role === 'COMMUNITY_ANCHOR' ? (
                      <Link
                        href="/anchor"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-[#FAFAF9] text-[#0A0A0A] font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
                        <span>Anchor Verification Board</span>
                      </Link>
                    ) : null}

                    {user.role === 'MODERATOR' ? (
                      <Link
                        href="/moderator"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-[#FAFAF9] text-[#0A0A0A] font-medium transition-colors"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-[#C7862B]" />
                        <span>Triage & Audit Queue</span>
                      </Link>
                    ) : null}

                    {user.role === 'ADMIN' ? (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-[#FAFAF9] text-[#0A0A0A] font-medium transition-colors"
                      >
                        <Layers className="w-4 h-4 text-[#C7862B]" />
                        <span>System Audit Logs</span>
                      </Link>
                    ) : null}

                    <Link
                      href="/help"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-[#FAFAF9] text-[#0A0A0A] font-medium transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#737373]" />
                      <span>How Verification Works</span>
                    </Link>

                    <div className="pt-2 mt-1 border-t border-[#F5F5F4]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 text-[#991B1B] hover:bg-rose-50 font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full border border-[#D6D3D1] text-xs font-bold text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors min-h-[36px] flex items-center justify-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-full bg-[#0A0A0A] text-xs font-bold text-white hover:bg-[#262626] transition-colors min-h-[36px] flex items-center justify-center hidden sm:flex"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {roleExtraLinks.length > 0 && (
          <div className="max-w-5xl mx-auto mt-2 px-6 flex items-center gap-2 pointer-events-auto">
            <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
              {user?.role}:
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
          {mobileNavItems.map((item) => {
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
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
