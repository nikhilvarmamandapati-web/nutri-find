import React, { useState, useEffect, useCallback } from 'react';
import { FoodLogItem, UserProgressItem, NutritionGoals, DatabaseStatus } from './types';
import { api } from './services/api';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MealLoggerSection } from './components/MealLoggerSection';
import { ProgressView } from './components/ProgressView';
import { GoalsView } from './components/GoalsView';
import { MongoDbModal } from './components/MongoDbModal';
import { LogFoodModal } from './components/LogFoodModal';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [logs, setLogs] = useState<FoodLogItem[]>([]);
  const [waterMl, setWaterMl] = useState<number>(0);
  const [progressHistory, setProgressHistory] = useState<UserProgressItem[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [goals, setGoals] = useState<NutritionGoals>({
    userId: 'user_default',
    dailyCalories: 2150,
    proteinGrams: 140,
    carbsGrams: 220,
    fatGrams: 65,
    waterMl: 2500,
    startingWeight: 76.5,
    targetWeight: 72.0,
    weightUnit: 'kg',
    heightCm: 175,
    age: 28,
    gender: 'female',
    activityLevel: 'moderate',
    dietGoal: 'weight_loss',
    updatedAt: new Date().toISOString(),
  });

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isCopying, setIsCopying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load status & goals & progress on start
  const fetchGlobalData = useCallback(async () => {
    try {
      const [statusRes, goalsRes, progRes] = await Promise.all([
        api.getStatus().catch(() => null),
        api.getGoals().catch(() => null),
        api.getProgress().catch(() => []),
      ]);

      if (statusRes?.status) setDbStatus(statusRes.status);
      if (goalsRes) setGoals(goalsRes);
      if (progRes) setProgressHistory(progRes);
    } catch (err) {
      console.error('Error fetching global initial data:', err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Load date-specific food and water logs
  const fetchDateLogs = useCallback(async (date: string) => {
    try {
      const [fetchedLogs, fetchedWater] = await Promise.all([
        api.getLogs(date),
        api.getWater(date),
      ]);
      setLogs(fetchedLogs);
      setWaterMl(fetchedWater);
    } catch (err) {
      console.error('Error fetching date logs:', err);
    }
  }, []);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  useEffect(() => {
    fetchDateLogs(currentDate);
  }, [currentDate, fetchDateLogs]);

  // Handlers
  const handleOpenLogModal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'breakfast') => {
    setModalMealType(mealType);
    setIsLogModalOpen(true);
  };

  const handleFoodLogged = (newLog: FoodLogItem) => {
    setLogs((prev) => [...prev, newLog]);
    showToast(`Logged "${newLog.foodName}" (${newLog.calories} kcal)`);
    // refresh db status counts
    api.getStatus().then((s) => s?.status && setDbStatus(s.status)).catch(() => {});
  };

  const handleUpdateLog = async (id: string, updates: Partial<FoodLogItem>) => {
    try {
      const updated = await api.updateLog(id, updates);
      setLogs((prev) => prev.map((l) => (l._id === id ? updated : l)));
      showToast('Food entry updated');
    } catch (err: any) {
      showToast('Failed to update entry');
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const ok = await api.deleteLog(id);
      if (ok) {
        setLogs((prev) => prev.filter((l) => l._id !== id));
        showToast('Food entry deleted');
        api.getStatus().then((s) => s?.status && setDbStatus(s.status)).catch(() => {});
      }
    } catch (err) {
      showToast('Error deleting item');
    }
  };

  const handleUpdateWater = async (amount: number) => {
    try {
      const saved = await api.setWater(currentDate, amount);
      setWaterMl(saved);
    } catch (err) {
      console.error('Failed to update water', err);
    }
  };

  const handleCopyYesterday = async () => {
    setIsCopying(true);
    try {
      const copied = await api.copyYesterday(currentDate);
      if (copied.length === 0) {
        showToast("No meals found in yesterday's journal to copy");
      } else {
        setLogs(copied);
        showToast(`Copied ${copied.length} meals from yesterday!`);
        api.getStatus().then((s) => s?.status && setDbStatus(s.status)).catch(() => {});
      }
    } catch (err) {
      showToast('Failed to copy meals');
    } finally {
      setIsCopying(false);
    }
  };

  const handleSaveGoals = async (updated: Partial<NutritionGoals>) => {
    const res = await api.updateGoals(updated);
    setGoals(res);
    showToast('Nutritional targets saved to MongoDB');
  };

  const handleAddProgress = async (entry: Partial<UserProgressItem>) => {
    const created = await api.addProgress(entry);
    setProgressHistory((prev) => {
      const filtered = prev.filter((p) => p.date !== created.date);
      return [...filtered, created].sort((a, b) => a.date.localeCompare(b.date));
    });
    showToast(`Weigh-in recorded for ${created.date}`);
    api.getStatus().then((s) => s?.status && setDbStatus(s.status)).catch(() => {});
  };

  const handleDeleteProgress = async (id: string) => {
    const ok = await api.deleteProgress(id);
    if (ok) {
      setProgressHistory((prev) => prev.filter((p) => p._id !== id));
      showToast('Weigh-in entry removed');
      api.getStatus().then((s) => s?.status && setDbStatus(s.status)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg border border-neutral-800 flex items-center gap-2 animate-bounce-subtle">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickLog={() => handleOpenLogModal('breakfast')}
        isMongoAtlas={dbStatus?.mode === 'mongodb_atlas'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {initialLoading ? (
          <div className="h-96 flex flex-col items-center justify-center text-neutral-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Connecting to NutriTrack database...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                logs={logs}
                goals={goals}
                waterMl={waterMl}
                onUpdateWater={handleUpdateWater}
                onOpenLogModal={handleOpenLogModal}
                onSelectTab={setCurrentTab}
                onCopyYesterday={handleCopyYesterday}
                isCopying={isCopying}
              />
            )}

            {currentTab === 'meals' && (
              <MealLoggerSection
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                logs={logs}
                goals={goals}
                onOpenLogModal={handleOpenLogModal}
                onDeleteLog={handleDeleteLog}
                onUpdateLog={handleUpdateLog}
                onCopyYesterday={handleCopyYesterday}
                isCopying={isCopying}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressView
                progressHistory={progressHistory}
                goals={goals}
                onAddProgress={handleAddProgress}
                onDeleteProgress={handleDeleteProgress}
              />
            )}

            {currentTab === 'goals' && (
              <GoalsView goals={goals} onSaveGoals={handleSaveGoals} />
            )}

            {currentTab === 'database' && (
              <MongoDbModal
                status={dbStatus}
                onRefreshStatus={fetchGlobalData}
                logs={logs}
                progress={progressHistory}
                goals={goals}
              />
            )}
          </>
        )}

      </main>

      {/* Log Food Modal */}
      <LogFoodModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultMealType={modalMealType}
        date={currentDate}
        onFoodLogged={handleFoodLogged}
      />

      {/* Minimalist Editorial Footer */}
      <footer className="mt-auto border-t border-neutral-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">NutriTrack</span>
            <span>·</span>
            <span>Diet & Calorie Logger</span>
            <span>·</span>
            <span>MongoDB Database Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('database')}
              className="hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                {dbStatus?.mode === 'mongodb_atlas' ? 'MongoDB Atlas' : 'Embedded MongoDB Store'}
              </span>
            </button>
            <button
              onClick={() => setCurrentTab('goals')}
              className="hover:text-emerald-700 transition-colors"
            >
              Nutrition Targets
            </button>
            <button
              onClick={() => setCurrentTab('progress')}
              className="hover:text-emerald-700 transition-colors"
            >
              Weight Tracking
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
