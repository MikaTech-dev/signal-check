'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { signalStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import {
  User,
  Shield,
  MapPin,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export default function ProfilePage() {
  return (
    <RouteGuard mode="AUTHENTICATED">
      <ProfileContent />
    </RouteGuard>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const [radiusKm, setRadiusKm] = useState(user?.notificationRadiusKm || 5.0);
  const [locationPref, setLocationPref] = useState(user?.locationPermission ?? true);

  if (!user) {
    return null;
  }

  const currentUser = user;

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    toast.success('Alert perimeter updated', {
      description: `You will receive incident notifications within ${newRadius} km.`,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 pb-2 border-b border-[#E7E5E4]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>Account & Alerts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            Account Profile
          </h1>
          <p className="text-sm text-[#57534E]">
            Your verified identity, corridor permissions, and neighborhood alert distance.
          </p>
        </div>

        <button
          onClick={() => logout()}
          className="px-5 py-2.5 rounded-full border border-rose-200 bg-rose-50 text-[#991B1B] text-xs font-bold hover:bg-rose-100 flex items-center gap-2 transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Identity Card */}
      <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
            Verified Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#737373] block">Full Name:</span>
              <span className="text-lg font-bold text-[#0A0A0A]">{currentUser.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#737373] block">Contact Channel:</span>
              <span className="text-lg font-bold text-[#0A0A0A]">{currentUser.emailOrPhone}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#737373] block">Assigned Role:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-[#0A0A0A] px-3 py-1 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] text-xs">
                <Shield className="w-3.5 h-3.5 text-[#C7862B]" />
                <span>{currentUser.role}</span>
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#737373] block">Account Status:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{currentUser.status}</span>
              </span>
            </div>
          </div>

          {currentUser.assignedCorridor && (
            <div className="pt-4 border-t border-[#F5F5F4] text-xs flex items-center gap-2">
              <span className="text-[#737373]">Assigned Corridor Jurisdiction:</span>
              <span className="font-bold text-[#0A0A0A]">{currentUser.assignedCorridor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Capabilities & Direct Access */}
      <div className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 sm:p-10 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight">
              Role Capabilities
            </h3>
            <p className="text-sm text-[#57534E] mt-1">
              Permissions assigned to your account within the SignalNG verification network.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] text-xs font-bold text-[#0A0A0A] self-start sm:self-auto">
            {currentUser.role}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-4">
          {currentUser.role === 'RESIDENT' && (
            <div className="space-y-2">
              <p className="text-sm text-[#171717] leading-relaxed">
                As a resident, you can report local incidents, confirm eyewitness observations directly from the scene, and receive alerts for disruptions within your selected radius.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs text-[#57534E]">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E5E4]">Submit Reports</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E5E4]">Eyewitness Updates</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E5E4]">5 km Perimeter Alerts</span>
              </div>
            </div>
          )}

          {(currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR') && (
            <div className="space-y-3">
              <p className="text-sm text-[#171717] leading-relaxed">
                You are registered as a stationary community anchor. You have authority to inspect corridor reports and formally verify or resolve incidents at your designated post.
              </p>
              <div className="pt-1">
                <Link
                  href="/anchor"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
                  <span>Open Anchor Verification Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {currentUser.role === 'MODERATOR' && (
            <div className="space-y-3">
              <p className="text-sm text-[#171717] leading-relaxed">
                You have field moderator permissions to review incoming chatter, quarantine copy-pasted rumor chains, and audit discrepancies across submissions.
              </p>
              <div className="pt-1">
                <Link
                  href="/moderator"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#C7862B]" />
                  <span>Open Triage & Audit Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {currentUser.role === 'ADMIN' && (
            <div className="space-y-3">
              <p className="text-sm text-[#171717] leading-relaxed">
                You have administrative access to inspect system audit logs, manage account permissions, and review automated detail check thresholds.
              </p>
              <div className="pt-1">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
                >
                  <Layers className="w-4 h-4 text-[#C7862B]" />
                  <span>Open System Audit Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Perimeter Alert Settings */}
      <div className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 sm:p-10 space-y-6 shadow-xs">
        <div>
          <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight">
            Notification & Location Preferences
          </h3>
          <p className="text-sm text-[#57534E] mt-1">
            Choose how close an incident must be before you receive a perimeter notification.
          </p>
        </div>

        <div className="space-y-5 max-w-lg">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
              Alert Radius Distance
            </label>
            <select
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full p-4 rounded-xl border border-[#D6D3D1] bg-white text-[#0A0A0A] text-sm font-semibold focus:outline-none focus:border-[#0A0A0A]"
            >
              <option value={1.5}>1.5 km (Immediate neighborhood)</option>
              <option value={5.0}>5.0 km (Standard alert perimeter)</option>
              <option value={10.0}>10.0 km (Extended corridor)</option>
            </select>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="locationPref"
              checked={locationPref}
              onChange={(e) => {
                setLocationPref(e.target.checked);
                toast.info('Location preference updated');
              }}
              className="w-5 h-5 mt-0.5 rounded border-[#D6D3D1] text-[#0A0A0A] focus:ring-0"
            />
            <label htmlFor="locationPref" className="text-xs text-[#57534E] cursor-pointer leading-relaxed">
              Enable native device location for distance calculation. Your exact GPS coordinates are kept private and never stored in public feeds.
            </label>
          </div>
        </div>
      </div>

      {/* Guide Link Card */}
      <div className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-[#0A0A0A]">How Verification Works</h4>
          <p className="text-xs text-[#737373]">
            Learn how community sightings are checked, corroborated by eyewitnesses, and confirmed.
          </p>
        </div>

        <Link
          href="/help"
          className="px-6 py-3 rounded-full border border-[#D6D3D1] hover:border-[#0A0A0A] bg-white text-xs font-bold text-[#0A0A0A] flex items-center gap-2 transition-all min-h-[44px] active:scale-[0.98]"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#737373]" />
          <span>Read Verification Guide</span>
        </Link>
      </div>
    </div>
  );
}
