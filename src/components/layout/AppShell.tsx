'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { signalStore } from '@/lib/store';
import { UserRole } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(signalStore.getCurrentUser());
  const [notifications, setNotifications] = useState(signalStore.getNotifications());
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const previousNotifsCountRef = useRef(notifications.length);

  const isLandingPage = pathname === '/';

  useEffect(() => {
    const unsubscribe = signalStore.subscribe(() => {
      const updatedUser = signalStore.getCurrentUser();
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
  }, [router]);

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
  ];

  const roleExtraLinks = [];
  if (currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR') {
    roleExtraLinks.push({ label: 'Anchor Board', href: '/anchor', icon: ShieldCheck });
  } else if (currentUser.role === 'MODERATOR') {
    roleExtraLinks.push({ label: 'Triage Queue', href: '/moderator', icon: SlidersHorizontal });
  } else if (currentUser.role === 'ADMIN') {
    roleExtraLinks.push({ label: 'Audit Logs', href: '/admin', icon: Layers });
  }

  // If on public landing page, let landing page manage its own layout
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] text-[#0A0A0A] font-sans antialiased flex flex-col selection:bg-[#C7862B]/20 selection:text-[#0A0A0A]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0A0A0A] font-sans antialiased flex flex-col selection:bg-[#C7862B]/20 selection:text-[#0A0A0A]">
      <header className="sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-[#E7E5E4] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/signal.png"
                alt="SignalNG"
                className="w-7 h-7 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-[#0A0A0A] group-hover:text-[#C7862B] transition-colors">
                  SignalNG
                </span>
                <span className="text-[10px] text-[#737373] tracking-wide uppercase font-medium">
                  Crisis Triage Engine
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/help"
              title="Epistemic Guide & Help"
              className="w-9 h-9 rounded-md border border-[#E7E5E4] flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F4] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative w-9 h-9 rounded-md border border-[#E7E5E4] flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F4] transition-colors"
              title="Perimeter Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#991B1B] text-[#FAFAF9] text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#E7E5E4] bg-white text-xs font-medium text-[#171717] hover:border-[#D6D3D1] transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#C7862B]" />
                <span className="capitalize">{currentUser.role.toLowerCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E7E5E4] rounded-lg shadow-sm p-1.5 z-50 text-xs">
                  <div className="px-2 py-1 text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Simulate Role Persona
                  </div>
                  <button
                    onClick={() => handleRoleChange('RESIDENT')}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                      currentUser.role === 'RESIDENT' ? 'bg-[#F5F5F4] font-semibold' : 'hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <span>Resident (Amara)</span>
                    {currentUser.role === 'RESIDENT' && <span className="text-[#C7862B] font-bold">Active</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('ANCHOR')}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                      currentUser.role === 'ANCHOR' ? 'bg-[#F5F5F4] font-semibold' : 'hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <span>Anchor (NURTW Musa)</span>
                    {currentUser.role === 'ANCHOR' && <span className="text-[#C7862B] font-bold">Active</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('MODERATOR')}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                      currentUser.role === 'MODERATOR' ? 'bg-[#F5F5F4] font-semibold' : 'hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <span>Moderator (Tari)</span>
                    {currentUser.role === 'MODERATOR' && <span className="text-[#C7862B] font-bold">Active</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('ADMIN')}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                      currentUser.role === 'ADMIN' ? 'bg-[#F5F5F4] font-semibold' : 'hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <span>Admin (Adaeze)</span>
                    {currentUser.role === 'ADMIN' && <span className="text-[#C7862B] font-bold">Active</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {roleExtraLinks.length > 0 && (
          <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-[#E7E5E4] flex items-center gap-3">
            <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
              {currentUser.role} Actions:
            </span>
            {roleExtraLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === link.href
                    ? 'bg-[#0A0A0A] text-[#FAFAF9]'
                    : 'bg-[#F5F5F4] text-[#171717] hover:bg-[#E7E5E4]'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {showNotifDrawer && (
        <div className="bg-white border-b border-[#E7E5E4] px-4 py-3 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C7862B]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                  Nearby alerts
                </h3>
              </div>
              <button
                onClick={() => setShowNotifDrawer(false)}
                className="text-xs text-[#737373] hover:text-[#0A0A0A]"
              >
                Close
              </button>
            </div>
            <p className="text-[11px] text-[#737373] mb-3">
              Only incidents at Corroborated or Anchor Confirmed status trigger perimeter alerts.
            </p>

            {notifications.length === 0 ? (
              <div className="text-xs text-[#737373] py-2">No active perimeter alerts within 5 km.</div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded border text-xs ${
                      n.read ? 'bg-[#FAFAF9] border-[#E7E5E4]' : 'bg-amber-50/50 border-amber-200 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[11px] text-[#991B1B]">{n.title}</span>
                      <span className="text-[10px] text-[#737373]">{n.distanceBand}</span>
                    </div>
                    <p className="text-[#171717] text-xs leading-relaxed">{n.message}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#737373]">
                      <span>{n.locationLabel}</span>
                      <Link
                        href={`/nearby?incident=${n.incidentId}`}
                        onClick={() => {
                          signalStore.markNotificationAsRead(n.id);
                          setShowNotifDrawer(false);
                        }}
                        className="text-[#0A0A0A] underline hover:text-[#C7862B]"
                      >
                        Inspect Incident
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-28 sm:pb-12">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E5E4] px-2 py-2 sm:hidden shadow-lg">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md min-h-[44px] transition-colors ${
                  item.active
                    ? 'text-[#0A0A0A] font-bold bg-[#F5F5F4]'
                    : 'text-[#737373] hover:text-[#0A0A0A] hover:bg-[#FAFAF9]'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-[#C7862B]' : 'text-[#737373]'}`} />
                <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
