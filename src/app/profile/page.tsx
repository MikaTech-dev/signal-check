'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { signalStore } from '@/lib/store';
import { UserRole } from '@/types';
import {
  User,
  Shield,
  MapPin,
  Bell,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(signalStore.getCurrentUser());
  const [radiusKm, setRadiusKm] = useState(currentUser.notificationRadiusKm || 5.0);
  const [locationPref, setLocationPref] = useState(currentUser.locationPermission);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = signalStore.subscribe(() => {
      setCurrentUser(signalStore.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

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
      description: 'Reset to initial 4 crisis situations and default user profile.',
    });
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto text-[#0A0A0A]">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight mb-1">
          Account
        </h1>
        <p className="text-xs text-[#57534E]">
          Role, perimeter preferences, and demo persona switcher.
        </p>
      </div>

      <div className="bg-white border border-[#E7E5E4] rounded-lg p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
          User Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#737373] block mb-0.5">Full Name:</span>
            <span className="font-bold text-[#0A0A0A]">{currentUser.name}</span>
          </div>
          <div>
            <span className="text-[#737373] block mb-0.5">Contact Channel:</span>
            <span className="font-bold text-[#0A0A0A]">{currentUser.emailOrPhone}</span>
          </div>
          <div>
            <span className="text-[#737373] block mb-0.5">Account Role (Read-Only):</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#0A0A0A] px-2 py-0.5 rounded bg-[#FAFAF9] border border-[#E7E5E4]">
              <Shield className="w-3.5 h-3.5 text-[#C7862B]" />
              <span>{currentUser.role}</span>
            </span>
          </div>
          <div>
            <span className="text-[#737373] block mb-0.5">Account Status:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentUser.status}</span>
            </span>
          </div>
        </div>

        {currentUser.assignedCorridor && (
          <div className="pt-2 border-t border-[#F5F5F4] text-xs">
            <span className="text-[#737373]">Assigned Corridor Jurisdiction: </span>
            <span className="font-bold text-[#0A0A0A]">{currentUser.assignedCorridor}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#E7E5E4] rounded-lg p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
            Simulate User Persona & Permissions
          </h3>
          <span className="text-[11px] text-[#C7862B] font-semibold">Demo Testing Utility</span>
        </div>
        <p className="text-xs text-[#57534E]">
          Switch roles dynamically to inspect how the crisis triage UI adapts for local residents, corridor anchors, and moderators.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleRoleSwitch('RESIDENT')}
            className={`p-3 rounded border text-left text-xs transition-colors min-h-[44px] ${
              currentUser.role === 'RESIDENT'
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FAFAF9]'
                : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:bg-[#F5F5F4]'
            }`}
          >
            <div className="font-bold mb-0.5">Amara Okoye (Resident)</div>
            <div className="text-[11px] opacity-80">
              Logged-in resident at Lugbe Market. Can submit reports and attestations.
            </div>
          </button>

          <button
            onClick={() => handleRoleSwitch('ANCHOR')}
            className={`p-3 rounded border text-left text-xs transition-colors min-h-[44px] ${
              currentUser.role === 'ANCHOR'
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FAFAF9]'
                : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:bg-[#F5F5F4]'
            }`}
          >
            <div className="font-bold mb-0.5">Musa Ibrahim (Stationary Anchor)</div>
            <div className="text-[11px] opacity-80">
              NURTW Unit Chair. Can formally confirm or resolve corridor incidents.
            </div>
          </button>

          <button
            onClick={() => handleRoleSwitch('MODERATOR')}
            className={`p-3 rounded border text-left text-xs transition-colors min-h-[44px] ${
              currentUser.role === 'MODERATOR'
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FAFAF9]'
                : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:bg-[#F5F5F4]'
            }`}
          >
            <div className="font-bold mb-0.5">Tari Davies (Field Moderator)</div>
            <div className="text-[11px] opacity-80">
              Can quarantine viral chains, audit duplicate patterns, and inspect raw coordinates.
            </div>
          </button>

          <button
            onClick={() => handleRoleSwitch('ADMIN')}
            className={`p-3 rounded border text-left text-xs transition-colors min-h-[44px] ${
              currentUser.role === 'ADMIN'
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FAFAF9]'
                : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:bg-[#F5F5F4]'
            }`}
          >
            <div className="font-bold mb-0.5">Adaeze Nwosu (Administrator)</div>
            <div className="text-[11px] opacity-80">
              Can view full audit logs, user permissions, and system settings.
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E7E5E4] rounded-lg p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
          Perimeter Preferences
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#171717] mb-1">
              Alert radius
            </label>
            <select
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full p-2 rounded border border-[#D6D3D1] bg-white text-[#0A0A0A]"
            >
              <option value={1.5}>1.5 km (immediate neighborhood)</option>
              <option value={5.0}>5.0 km (standard alert perimeter)</option>
              <option value={10.0}>10.0 km (extended corridor)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="locationPref"
              checked={locationPref}
              onChange={(e) => {
                setLocationPref(e.target.checked);
                toast.info('Location preference updated');
              }}
              className="w-4 h-4 rounded border-[#D6D3D1] text-[#0A0A0A]"
            />
            <label htmlFor="locationPref" className="text-xs text-[#292524] cursor-pointer">
              Enable native one-tap device GPS for distance filtering (exact coordinates remain private).
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E7E5E4] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-[#0A0A0A]">Reset Scenario Seed Data</h4>
          <p className="text-[11px] text-[#737373]">
            Restores the initial 4 crisis situations and resets all in-memory attestations.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-3.5 py-2 rounded border border-[#D6D3D1] hover:bg-[#F5F5F4] text-xs font-semibold text-[#171717] flex items-center gap-1.5 min-h-[44px]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#737373]" />
          <span>{resetSuccess ? 'Seed Data Restored' : 'Reset Seed Scenarios'}</span>
        </button>
      </div>
    </div>
  );
}
