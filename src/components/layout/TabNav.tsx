'use client';

import React from 'react';
import { Shield, Sparkles, Radio } from 'lucide-react';
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
      label: 'Corridor Safety Board',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'rumour-filter',
      label: 'Upload & Signal Filter',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'live-feed',
      label: 'Signal Evidence Stream',
      icon: <Radio className="w-4 h-4" />,
      badge: reportCount,
    },
  ];

  return (
    <nav
      className="flex items-center gap-1.5 border-b border-zinc-200/80 pb-2 overflow-x-auto scrollbar-none"
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
              'flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all border select-none shrink-0 min-h-[44px] cursor-pointer',
              isActive
                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-xs'
                : 'bg-white text-[#57534E] hover:text-[#0A0A0A] hover:bg-[#F5F5F4] border-[#E7E5E4]'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-[11px] rounded-full font-mono font-bold',
                  isActive
                    ? 'bg-[#262626] text-[#C7862B]'
                    : 'bg-[#F5F5F4] text-[#737373]'
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
