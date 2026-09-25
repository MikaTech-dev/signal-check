'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Incident, IncidentState, IncidentType } from '@/types';
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
  DrawerClose,
} from '@/components/ui/drawer';
import {
  PlusCircle,
  Radio,
  MapPin,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';

function NearbyIncidentsContent() {
  const searchParams = useSearchParams();
  const deepLinkedIncidentId = searchParams.get('incident');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5.0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Staged filter values (only applied on "Apply")
  const [stagedFilterState, setStagedFilterState] = useState<string>('ALL');
  const [stagedFilterType, setStagedFilterType] = useState<string>('ALL');
  const [stagedMaxDistanceKm, setStagedMaxDistanceKm] = useState<number>(5.0);

  const currentUser = signalStore.getCurrentUser();
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
      // Fall back to local store when server is unreachable
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Open drawer and pre-populate staged values with current active values
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

  // Filter and sort incidents by distance
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
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#E7E5E4]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-[#C7862B]" />
            <h1 className="text-base sm:text-lg font-bold text-[#0A0A0A] tracking-tight">
              Nearby Incidents
            </h1>
          </div>
          <p className="text-xs text-[#57534E] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#737373]" />
            <span>Simulated origin:</span>
            <span className="font-semibold text-[#171717]">Lugbe Market Central, Abuja</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#737373] text-xs font-medium flex items-center gap-1.5 min-h-[44px]"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/report"
            className="px-4 py-2 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] active:scale-[0.98] transition-transform flex items-center gap-1.5 min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4 text-[#C7862B]" />
            <span>Report</span>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] text-xs text-[#57534E] flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#C7862B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Reports reflect community observations within a 5 km radius. This system does not declare any route safe.
        </p>
      </div>

      {/* Filter row: desktop inline, mobile via drawer */}
      <div className="flex items-center justify-between gap-2">
        {/* Desktop filters - hidden on small screens */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#737373] font-semibold pr-2 border-r border-[#E7E5E4]">Filters</span>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="p-1.5 rounded border border-[#D6D3D1] bg-white text-[#171717] font-medium text-xs"
          >
            <option value="ALL">All states</option>
            <option value="CORROBORATED">Corroborated</option>
            <option value="CONFIRMED">Anchor confirmed</option>
            <option value="CONFLICTING">Conflicting</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="STALE">Stale</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1.5 rounded border border-[#D6D3D1] bg-white text-[#171717] font-medium text-xs"
          >
            <option value="ALL">All incident types</option>
            <option value="ROAD_OBSTRUCTION">Road obstruction</option>
            <option value="HAZARD_SPILL">Hazard / fuel spill</option>
            <option value="CHECKPOINT">Checkpoint</option>
            <option value="MISSING_PERSON">Missing person</option>
            <option value="SECURITY_GATHERING">Security gathering</option>
          </select>

          <select
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
            className="p-1.5 rounded border border-[#D6D3D1] bg-white text-[#171717] font-medium text-xs"
          >
            <option value={1.5}>Within 1.5 km</option>
            <option value={5.0}>Within 5 km</option>
            <option value={15.0}>Within 15 km</option>
          </select>
        </div>

        {/* Mobile filter trigger */}
        <button
          onClick={openFilterDrawer}
          className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded border border-[#E7E5E4] bg-white text-xs font-semibold text-[#171717] min-h-[44px]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#737373]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#0A0A0A] text-[#FAFAF9] text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <span className="text-[11px] text-[#737373] ml-auto whitespace-nowrap">
          {filteredIncidents.length} of {incidents.length} shown
        </span>
      </div>

      {/* Incidents feed */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-lg p-8 text-center space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-[#A8A29E] mx-auto" />
          <h3 className="text-sm font-bold text-[#0A0A0A]">No incidents match these filters</h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            Try widening the distance or clearing the state filter.
          </p>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs font-bold rounded bg-[#0A0A0A] text-[#FAFAF9]"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => setSelectedIncident(incident)}
            />
          ))}
        </div>
      )}

      {/* Incident detail drawer */}
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

      {/* Mobile filter drawer */}
      <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter incidents</DrawerTitle>
            <DrawerDescription>
              Narrow the feed by status, type, or distance from your location.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-2 space-y-4 overflow-y-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717]">Status</label>
              <select
                value={stagedFilterState}
                onChange={(e) => setStagedFilterState(e.target.value)}
                className="w-full p-2.5 rounded border border-[#D6D3D1] bg-white text-[#171717] text-xs"
              >
                <option value="ALL">All states</option>
                <option value="CORROBORATED">Corroborated</option>
                <option value="CONFIRMED">Anchor confirmed</option>
                <option value="CONFLICTING">Conflicting</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="STALE">Stale</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717]">Incident type</label>
              <select
                value={stagedFilterType}
                onChange={(e) => setStagedFilterType(e.target.value)}
                className="w-full p-2.5 rounded border border-[#D6D3D1] bg-white text-[#171717] text-xs"
              >
                <option value="ALL">All types</option>
                <option value="ROAD_OBSTRUCTION">Road obstruction</option>
                <option value="HAZARD_SPILL">Hazard / fuel spill</option>
                <option value="CHECKPOINT">Checkpoint</option>
                <option value="MISSING_PERSON">Missing person</option>
                <option value="SECURITY_GATHERING">Security gathering</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717]">Max distance</label>
              <select
                value={stagedMaxDistanceKm}
                onChange={(e) => setStagedMaxDistanceKm(Number(e.target.value))}
                className="w-full p-2.5 rounded border border-[#D6D3D1] bg-white text-[#171717] text-xs"
              >
                <option value={1.5}>Within 1.5 km (immediate)</option>
                <option value={5.0}>Within 5 km (full perimeter)</option>
                <option value={15.0}>Within 15 km (regional)</option>
              </select>
            </div>
          </div>

          <DrawerFooter>
            <button
              onClick={applyFilters}
              className="w-full py-3 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold min-h-[48px]"
            >
              Apply filters
            </button>
            <button
              onClick={resetFilters}
              className="w-full py-3 rounded border border-[#E7E5E4] text-xs font-semibold text-[#737373] min-h-[44px]"
            >
              Clear all
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default function NearbyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#737373]">Loading nearby incidents...</div>}>
      <NearbyIncidentsContent />
    </Suspense>
  );
}
