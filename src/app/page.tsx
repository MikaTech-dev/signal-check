'use client';

import React, { useState } from 'react';
import { RouteStatus, SafetyReport, AiAnalysisResult } from '@/types';
import { INITIAL_ROUTES, INITIAL_REPORTS } from '@/lib/mockData';
import { Header } from '@/components/layout/Header';
import { TabNav, TabType } from '@/components/layout/TabNav';
import { AmaraQuickDecision } from '@/components/dashboard/AmaraQuickDecision';
import { RouteCard } from '@/components/dashboard/RouteCard';
import { RouteDetailModal } from '@/components/dashboard/RouteDetailModal';
import { ReportForm } from '@/components/reports/ReportForm';
import { EvidenceList } from '@/components/reports/EvidenceList';
import { ShieldCheck, Info, Radio, Layers, Sparkles } from 'lucide-react';

export default function Home() {
  const [routes, setRoutes] = useState<RouteStatus[]>(INITIAL_ROUTES);
  const [reports, setReports] = useState<SafetyReport[]>(INITIAL_REPORTS);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<RouteStatus | null>(null);

  // Add new report and update affected corridor status
  const handleAddReport = (rawText: string, analysis: AiAnalysisResult) => {
    const newReport: SafetyReport = {
      id: `rep-${Date.now()}`,
      rawText,
      submittedAt: '6:41 PM (Just now)',
      location: analysis.location,
      sourceType: analysis.source_type,
      incidentType: analysis.incident_type,
      claim: analysis.claim,
      confidenceScore: analysis.confidence,
      urgency: analysis.urgency,
      needsHumanReview: analysis.needs_human_review,
      isFirsthand: analysis.is_firsthand,
      reasoning: analysis.reasoning,
      verifiedByAi: true,
    };

    setReports((prev) => [newReport, ...prev]);

    // Recalculate or update the corresponding route status
    setRoutes((prevRoutes) =>
      prevRoutes.map((route) => {
        const matchesRoute =
          analysis.location.toLowerCase().includes(route.name.toLowerCase()) ||
          route.name.toLowerCase().includes(analysis.location.toLowerCase());

        if (!matchesRoute) return route;

        const newFirsthandCount = route.firsthandCount + (analysis.is_firsthand ? 1 : 0);
        const newHearsayCount = route.hearsayCount + (!analysis.is_firsthand ? 1 : 0);

        let newStatus = route.status;
        let newConfidence = route.confidenceScore;
        let newSummary = route.summary;

        if (analysis.is_firsthand) {
          if (analysis.incident_type.toLowerCase().includes('clear') || analysis.incident_type.toLowerCase().includes('normal')) {
            newStatus = 'SAFE';
            newConfidence = Math.min(98, route.confidenceScore + 6);
            newSummary = `Fresh eyewitness report at 6:41 PM confirms clear movement: "${analysis.claim}"`;
          } else if (analysis.urgency === 'HIGH' || analysis.urgency === 'CRITICAL') {
            newStatus = 'DANGER';
            newConfidence = Math.max(85, analysis.confidence);
            newSummary = `Urgent alert from eyewitness: "${analysis.claim}"`;
          }
        } else {
          // Hearsay report increases caution if unverified
          if (route.status === 'SAFE' && analysis.urgency === 'HIGH') {
            newStatus = 'CAUTION';
            newSummary = `Unverified rumour flagged by DeepSeek Flash. Awaiting direct eyewitness confirmation.`;
          }
        }

        return {
          ...route,
          status: newStatus,
          confidenceScore: newConfidence,
          lastUpdated: '6:41 PM (Just now)',
          firsthandCount: newFirsthandCount,
          hearsayCount: newHearsayCount,
          summary: newSummary,
          activeIncidents: [analysis.incident_type, ...route.activeIncidents.slice(0, 2)],
        };
      })
    );

    // Switch view to live dashboard so user sees immediate impact
    setActiveTab('dashboard');
  };

  const handleSelectRouteForReport = (routeId: string) => {
    setActiveTab('rumour-filter');
  };

  const unverifiedRumorCount = reports.filter(
    (r) => !r.isFirsthand || r.sourceType === 'UNVERIFIED_WHATSAPP' || r.sourceType === 'HEARSAY_RUMOR'
  ).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Application Header */}
      <Header
        reportCount={reports.length}
        unverifiedRumorCount={unverifiedRumorCount}
        onOpenQuickReport={() => setActiveTab('rumour-filter')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <TabNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          reportCount={reports.length}
        />

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Amara's Immediate Decision Hero */}
            <AmaraQuickDecision
              routes={routes}
              onSelectRouteForReport={handleSelectRouteForReport}
            />

            {/* Regional Corridor Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    Regional Corridor Status Overview
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Live road statuses based on verified signals and filtered noise.
                  </p>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  3 active monitoring zones
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    onOpenDetails={setSelectedRouteForModal}
                  />
                ))}
              </div>
            </div>

            {/* Challenge Context Note */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-0.5">
                  How SafeRoute Solves Amara&apos;s Problem:
                </strong>
                When market closing occurs under regional tension, unverified WhatsApp forwards cause panic while real hazards go uncommunicated. SafeRoute uses DeepSeek Flash to separate firsthand observations from hearsay, giving Amara clear road confidence before she steps out.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Rumour & Ingest Filter */}
        {activeTab === 'rumour-filter' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
            <ReportForm onAddReportToLive={handleAddReport} />
          </div>
        )}

        {/* Tab 3: Community Signals & Evidence */}
        {activeTab === 'live-feed' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <EvidenceList reports={reports} />
          </div>
        )}
      </main>

      {/* Route Detail Modal */}
      <RouteDetailModal
        route={selectedRouteForModal}
        reports={reports}
        isOpen={Boolean(selectedRouteForModal)}
        onClose={() => setSelectedRouteForModal(null)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>SafeRoute Signal: AI-filtered community safety infrastructure</span>
          <span className="font-mono text-zinc-600">DeepSeek Flash / Next.js / TypeScript</span>
        </div>
      </footer>
    </div>
  );
}
