'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { signalStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { RouteGuard } from '@/components/auth/RouteGuard';
import {
  User,
  Shield,
  MapPin,
  Bell,
  RotateCcw,
  CheckCircle2,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const currentUser = user || signalStore.getCurrentUser();
  const [radiusKm, setRadiusKm] = useState(currentUser.notificationRadiusKm || 5.0);
  const [locationPref, setLocationPref] = useState(currentUser.locationPermission);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRoleSwitch = (role: UserRole) => {
    signalStore.switchRole(role);
    toast.info(`Switched persona to ${role}`, {
      description: `Active role profile updated to ${signalStore.getCurrentUser().name}.`,
    });
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    toast.success('Perimeter preference updated', {
      description: `Crisis notification threshold set to ${newRadius} km.`,
    });
  };

  const handleResetData = () => {
    signalStore.resetToDefaultSeed();
    setResetSuccess(true);
    toast.success('Scenario seed data restored', {
      description: 'Reset to initial crisis situations and default user profile.',
    });
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 pb-2 border-b border-[#E7E5E4]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#C7862B]" />
              <span>Account & Corridor Preferences</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
              Account Profile
            </h1>
            <p className="text-sm text-[#57534E]">
              Corridor permissions, alert radius preferences, and demo role simulator.
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

        {/* Identity Double-Bezel Card */}
        <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              User Identity
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
                  <CheckCircle2 className="w-4 h-4" />
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

        {/* Persona Simulator */}
        <div className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 sm:p-10 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight">
                Simulate Role Persona
              </h3>
              <p className="text-sm text-[#57534E] mt-1">
                Test how the triage interface adapts for residents, corridor anchors, and moderators.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold self-start">
              Demo Testing Tool
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleRoleSwitch('RESIDENT')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                currentUser.role === 'RESIDENT'
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
                  : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:border-[#0A0A0A]'
              }`}
            >
              <div className="font-bold text-base mb-1">Amara Okoye (Resident)</div>
              <div className={`text-xs ${currentUser.role === 'RESIDENT' ? 'text-gray-300' : 'text-[#737373]'}`}>
                Lugbe Market resident. Can submit reports and ground attestations.
              </div>
            </button>

            <button
              onClick={() => handleRoleSwitch('ANCHOR')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR'
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
                  : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:border-[#0A0A0A]'
              }`}
            >
              <div className="font-bold text-base mb-1">Musa Ibrahim (Stationary Anchor)</div>
              <div className={`text-xs ${currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR' ? 'text-gray-300' : 'text-[#737373]'}`}>
                NURTW Unit Chair. Can formally confirm or resolve corridor incidents.
              </div>
            </button>

            <button
              onClick={() => handleRoleSwitch('MODERATOR')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                currentUser.role === 'MODERATOR'
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
                  : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:border-[#0A0A0A]'
              }`}
            >
              <div className="font-bold text-base mb-1">Tari Davies (Field Moderator)</div>
              <div className={`text-xs ${currentUser.role === 'MODERATOR' ? 'text-gray-300' : 'text-[#737373]'}`}>
                Can quarantine viral rumor chains and audit duplicate patterns.
              </div>
            </button>

            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                currentUser.role === 'ADMIN'
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
                  : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:border-[#0A0A0A]'
              }`}
            >
              <div className="font-bold text-base mb-1">Adaeze Nwosu (Administrator)</div>
              <div className={`text-xs ${currentUser.role === 'ADMIN' ? 'text-gray-300' : 'text-[#737373]'}`}>
                Can inspect full audit logs, user permissions, and system thresholds.
              </div>
            </button>
          </div>
        </div>

        {/* Perimeter Settings */}
        <div className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 sm:p-10 space-y-6 shadow-xs">
          <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight">
            Perimeter Notification Preferences
          </h3>

          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                Alert Radius Threshold
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

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="locationPref"
                checked={locationPref}
                onChange={(e) => {
                  setLocationPref(e.target.checked);
                  toast.info('Location preference updated');
                }}
                className="w-5 h-5 rounded border-[#D6D3D1] text-[#0A0A0A] focus:ring-0"
              />
              <label htmlFor="locationPref" className="text-xs text-[#57534E] cursor-pointer leading-relaxed">
                Enable native device GPS for mathematical distance calculation (coordinates remain private).
              </label>
            </div>
          </div>
        </div>

        {/* Reset Seed Data */}
        <div className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#0A0A0A]">Reset Scenario Seed Data</h4>
            <p className="text-xs text-[#737373]">
              Restores initial 4 crisis situations and resets in-memory attestations.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="px-6 py-3 rounded-full border border-[#D6D3D1] hover:border-[#0A0A0A] bg-white text-xs font-bold text-[#0A0A0A] flex items-center gap-2 transition-all min-h-[44px] active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#737373]" />
            <span>{resetSuccess ? 'Seed Restored' : 'Reset Seed Data'}</span>
          </button>
        </div>

      </div>
  );
}
