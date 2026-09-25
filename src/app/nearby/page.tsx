'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Incident } from '@/types';
import { signalStore } from '@/lib/store';
import { incidentsApi } from '@/lib/api';
import { calculateHaversineDistance } from '@/lib/haversine';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { IncidentDetailDrawer } from '@/components/incidents/IncidentDetailDrawer';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  PlusCircle,
  Radio,
  MapPin,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

function NearbyIncidentsContent() {
  const searchParams = useSearchParams();
  const deepLinkedIncidentId = searchParams.get('incident');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Staged filter values for mobile drawer
  const [stagedFilterState, setStagedFilterState] = useState<string>('ALL');
  const [stagedFilterType, setStagedFilterType] = useState<string>('ALL');
  const [stagedMaxDistanceKm, setStagedMaxDistanceKm] = useState<number>(5.0);

  const userCoords = signalStore.getUserCoordinates();

  const loadData = async () => {
    try {
      const res = await incidentsApi.getNearby(
        userCoords.latitude,
        userCoords.longitude,
        maxDistanceKm
      );
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
        setIncidents(normalized);
        if (deepLinkedIncidentId) {
          const found = normalized.find((i) => i.id === deepLinkedIncidentId);
          if (found) setSelectedIncident(found);
        }
        return;
      }
    } catch {
      // Fall back to local store
    } finally {
      setIsLoading(false);
    }

    const list = signalStore.getIncidents();
    setIncidents(list);
    if (deepLinkedIncidentId) {
      const found = list.find((i) => i.id === deepLinkedIncidentId);
      if (found) setSelectedIncident(found);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = signalStore.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [deepLinkedIncidentId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const openFilterDrawer = () => {
    setStagedFilterState(filterState);
    setStagedFilterType(filterType);
    setStagedMaxDistanceKm(maxDistanceKm);
    setFilterDrawerOpen(true);
  };

  const applyFilters = () => {
    setFilterState(stagedFilterState);
    setFilterType(stagedFilterType);
    setMaxDistanceKm(stagedMaxDistanceKm);
    setFilterDrawerOpen(false);
  };

  const resetFilters = () => {
    setStagedFilterState('ALL');
    setStagedFilterType('ALL');
    setStagedMaxDistanceKm(5.0);
    setFilterState('ALL');
    setFilterType('ALL');
    setMaxDistanceKm(5.0);
    setFilterDrawerOpen(false);
  };

  const activeFilterCount = [
    filterState !== 'ALL',
    filterType !== 'ALL',
    maxDistanceKm !== 5.0,
  ].filter(Boolean).length;

  const filteredIncidents = useMemo(() => {
    return incidents
      .map((inc) => ({
        ...inc,
        distanceKm: calculateHaversineDistance(userCoords, inc.coordinates),
      }))
      .filter((inc) => {
        if (inc.distanceKm > maxDistanceKm) return false;
        if (filterState !== 'ALL' && inc.state !== filterState) return false;
        if (filterType !== 'ALL' && inc.incidentType !== filterType) return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [incidents, userCoords, filterState, filterType, maxDistanceKm]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
      {/* Editorial Radar Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 pb-2 border-b border-[#E7E5E4]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>Active Corridor Radar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            Nearby Incidents
          </h1>
          <p className="text-sm text-[#57534E] flex items-center gap-1.5 flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>Origin:</span>
            <span className="font-semibold text-[#0A0A0A]">Lugbe Market Central, Abuja</span>
            <span className="text-[#A8A29E]">&bull;</span>
            <span className="text-xs text-[#737373]">5 km mathematical perimeter</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-full border border-[#D6D3D1] hover:border-[#0A0A0A] bg-white text-[#0A0A0A] text-xs font-bold flex items-center gap-2 transition-all min-h-[44px] active:scale-[0.98]"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/report"
            className="group px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] flex items-center gap-2.5 transition-all min-h-[44px] active:scale-[0.98]"
          >
            <span>Log Report</span>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      </div>

      {/* Epistemic Caution Notice */}
      <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-xs text-[#57534E] flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#C7862B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#0A0A0A]">Caution:</strong> Community sightings are organized with source depth and contradictions. This platform does not declare any route safe.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Desktop Filter Pills */}
        <div className="hidden sm:flex items-center gap-2.5 flex-wrap text-xs">
          <span className="text-[#737373] font-bold uppercase tracking-wider text-[11px] pr-2 border-r border-[#E7E5E4]">
            Filters
          </span>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#0A0A0A]/20 bg-white text-[#0A0A0A] font-bold text-xs focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] shadow-xs cursor-pointer"
          >
            <option value="ALL" className="bg-white text-[#0A0A0A]">All States</option>
            <option value="CORROBORATED" className="bg-white text-[#0A0A0A]">Corroborated</option>
            <option value="CONFIRMED" className="bg-white text-[#0A0A0A]">Anchor Confirmed</option>
            <option value="CONFLICTING" className="bg-white text-[#0A0A0A]">Conflicting</option>
            <option value="UNVERIFIED" className="bg-white text-[#0A0A0A]">Unverified</option>
            <option value="STALE" className="bg-white text-[#0A0A0A]">Stale</option>
            <option value="RESOLVED" className="bg-white text-[#0A0A0A]">Resolved</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#0A0A0A]/20 bg-white text-[#0A0A0A] font-bold text-xs focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] shadow-xs cursor-pointer"
          >
            <option value="ALL" className="bg-white text-[#0A0A0A]">All Incident Types</option>
            <option value="ROAD_OBSTRUCTION" className="bg-white text-[#0A0A0A]">Road Obstruction</option>
            <option value="HAZARD_SPILL" className="bg-white text-[#0A0A0A]">Hazard / Fuel Spill</option>
            <option value="CHECKPOINT" className="bg-white text-[#0A0A0A]">Checkpoint</option>
            <option value="MISSING_PERSON" className="bg-white text-[#0A0A0A]">Missing Person</option>
            <option value="SECURITY_GATHERING" className="bg-white text-[#0A0A0A]">Security Gathering</option>
          </select>

          <select
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-[#0A0A0A]/20 bg-white text-[#0A0A0A] font-bold text-xs focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] shadow-xs cursor-pointer"
          >
            <option value={1.5} className="bg-white text-[#0A0A0A]">Within 1.5 km (Immediate)</option>
            <option value={5.0} className="bg-white text-[#0A0A0A]">Within 5 km (Standard Perimeter)</option>
            <option value={15.0} className="bg-white text-[#0A0A0A]">Within 15 km (Regional Corridor)</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#737373] underline hover:text-[#0A0A0A] font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={openFilterDrawer}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D6D3D1] bg-white text-xs font-bold text-[#0A0A0A] min-h-[44px]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#737373]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <span className="text-xs font-semibold text-[#737373] ml-auto">
          {filteredIncidents.length} of {incidents.length} active
        </span>
      </div>

      {/* Incidents Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 animate-pulse"
            >
              <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-36 bg-black/5 rounded-full" />
                  <div className="h-6 w-24 bg-black/5 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-black/5 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-black/5 rounded-lg" />
                  <div className="h-4 w-5/6 bg-black/5 rounded-lg" />
                </div>
                <div className="pt-4 border-t border-[#F5F5F4] flex items-center justify-between">
                  <div className="h-4 w-32 bg-black/5 rounded-md" />
                  <div className="h-8 w-28 bg-black/5 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-12 text-center space-y-4">
            <SlidersHorizontal className="w-10 h-10 text-[#A8A29E] mx-auto" />
            <h3 className="text-xl font-bold text-[#0A0A0A]">No incidents match these filters</h3>
            <p className="text-sm text-[#737373] max-w-sm mx-auto">
              Try widening your distance perimeter or resetting the status filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 text-xs font-bold rounded-full bg-[#0A0A0A] text-white hover:bg-[#262626] transition-transform active:scale-[0.98]"
            >
              Reset all filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => setSelectedIncident(incident)}
            />
          ))}
        </div>
      )}

      {/* Incident Detail Drawer */}
      {selectedIncident && (
        <IncidentDetailDrawer
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={() => {
            const updated = signalStore.getIncidentById(selectedIncident.id);
            if (updated) setSelectedIncident(updated);
            loadData();
          }}
        />
      )}

      {/* Mobile Filter Drawer */}
      <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Incidents</DrawerTitle>
            <DrawerDescription>
              Narrow corridor observations by verification state, incident type, or radius.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 py-4 space-y-5 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Verification State
              </label>
              <select
                value={stagedFilterState}
                onChange={(e) => setStagedFilterState(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#D6D3D1] bg-white text-[#0A0A0A] text-sm font-semibold"
              >
                <option value="ALL">All States</option>
                <option value="CORROBORATED">Corroborated</option>
                <option value="CONFIRMED">Anchor Confirmed</option>
                <option value="CONFLICTING">Conflicting</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="STALE">Stale</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Incident Type
              </label>
              <select
                value={stagedFilterType}
                onChange={(e) => setStagedFilterType(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#D6D3D1] bg-white text-[#0A0A0A] text-sm font-semibold"
              >
                <option value="ALL">All Types</option>
                <option value="ROAD_OBSTRUCTION">Road Obstruction</option>
                <option value="HAZARD_SPILL">Hazard / Fuel Spill</option>
                <option value="CHECKPOINT">Checkpoint</option>
                <option value="MISSING_PERSON">Missing Person</option>
                <option value="SECURITY_GATHERING">Security Gathering</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Max Distance Radius
              </label>
              <select
                value={stagedMaxDistanceKm}
                onChange={(e) => setStagedMaxDistanceKm(Number(e.target.value))}
                className="w-full p-3.5 rounded-xl border border-[#D6D3D1] bg-white text-[#0A0A0A] text-sm font-semibold"
              >
                <option value={1.5}>Within 1.5 km (Immediate)</option>
                <option value={5.0}>Within 5.0 km (Full Perimeter)</option>
                <option value={15.0}>Within 15.0 km (Regional Corridor)</option>
              </select>
            </div>
          </div>

          <DrawerFooter>
            <button
              onClick={applyFilters}
              className="w-full py-4 rounded-full bg-[#0A0A0A] text-white text-sm font-bold active:scale-[0.98] transition-transform min-h-[48px]"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="w-full py-3.5 rounded-full border border-[#D6D3D1] text-xs font-bold text-[#737373] hover:text-[#0A0A0A] min-h-[44px]"
            >
              Clear All
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default function NearbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50dvh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
          <p className="text-xs font-semibold text-[#737373] tracking-wide uppercase">
            Scanning perimeter...
          </p>
        </div>
      }
    >
      <NearbyIncidentsContent />
    </Suspense>
  );
}
