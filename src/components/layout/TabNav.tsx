'use client';

import React from 'react';
import { Shield, Sparkles, Radio, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'dashboard' | 'rumour-filter' | 'live-feed';

interface TabNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  reportCount: number;
}

export const TabNav: React.FC<TabNavProps> = ({
  activeTab,
  onChangeTab,
  reportCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Road Status Board',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'rumour-filter',
      label: 'AI Rumour & Ingest Filter',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'live-feed',
      label: 'Community Signals & Evidence',
      icon: <Radio className="w-4 h-4" />,
      badge: reportCount,
    },
  ];

  return (
    <nav
      className="flex items-center gap-2 border-b border-zinc-800 pb-1 overflow-x-auto scrollbar-none"
      aria-label="Dashboard views"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors border select-none shrink-0 min-h-[44px]',
              isActive
                ? 'bg-zinc-800 text-emerald-400 border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full font-mono',
                  isActive
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
