import React from 'react';
import { Apple, Plus, Database, Sparkles } from 'lucide-react';

export type NavTab = 'dashboard' | 'meals' | 'progress' | 'goals' | 'database';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickLog: () => void;
  isMongoAtlas: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickLog,
  isMongoAtlas,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200/80 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left text-neutral-900 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Apple className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-emerald-700">
            NutriTrack
          </span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentTab === 'dashboard'
                ? 'border-emerald-600 text-neutral-900 font-semibold'
                : 'border-transparent hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('meals')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentTab === 'meals'
                ? 'border-emerald-600 text-neutral-900 font-semibold'
                : 'border-transparent hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            Daily Meals
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentTab === 'progress'
                ? 'border-emerald-600 text-neutral-900 font-semibold'
                : 'border-transparent hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            Weight & Progress
          </button>

          <button
            onClick={() => onSelectTab('goals')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentTab === 'goals'
                ? 'border-emerald-600 text-neutral-900 font-semibold'
                : 'border-transparent hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            Targets & Calculator
          </button>

          <button
            onClick={() => onSelectTab('database')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 inline-flex items-center gap-1.5 ${
              currentTab === 'database'
                ? 'border-emerald-600 text-neutral-900 font-semibold'
                : 'border-transparent hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            <span>MongoDB Data</span>
            {isMongoAtlas && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected to MongoDB Atlas" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action & User Photo Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuickLog}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Food</span>
          </button>

          <button
            onClick={() => onSelectTab('goals')}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-neutral-200 hover:border-emerald-500/50 hover:bg-neutral-50 transition-all group focus:outline-none"
            title="User Profile & Nutrition Targets"
          >
            <img
              src="/src/assets/images/user_avatar_1792836173080.jpg"
              alt="Alex Taylor"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/40"
              referrerPolicy="no-referrer"
            />
            <span className="hidden xl:inline text-xs font-semibold text-neutral-800 group-hover:text-emerald-700 whitespace-nowrap">
              Alex
            </span>
          </button>
        </div>

      </div>

      {/* Mobile nav bar row for touch accessibility */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-100 px-2 py-2 text-xs font-medium text-neutral-600 overflow-x-auto">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-neutral-100 text-neutral-900 font-semibold' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('meals')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'meals' ? 'bg-neutral-100 text-neutral-900 font-semibold' : ''}`}
        >
          Meals
        </button>
        <button
          onClick={() => onSelectTab('progress')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'progress' ? 'bg-neutral-100 text-neutral-900 font-semibold' : ''}`}
        >
          Progress
        </button>
        <button
          onClick={() => onSelectTab('goals')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'goals' ? 'bg-neutral-100 text-neutral-900 font-semibold' : ''}`}
        >
          Targets
        </button>
        <button
          onClick={() => onSelectTab('database')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'database' ? 'bg-neutral-100 text-neutral-900 font-semibold' : ''}`}
        >
          MongoDB
        </button>
      </div>
    </header>
  );
};
