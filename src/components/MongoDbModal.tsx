import React, { useState, useEffect } from 'react';
import { DatabaseStatus, FoodLogItem, UserProgressItem, NutritionGoals, FoodItemCatalog } from '../types';
import { api } from '../services/api';
import { 
  Database, 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Link2, 
  Layers, 
  FileJson,
  Check,
  AlertCircle
} from 'lucide-react';

interface MongoDbModalProps {
  status: DatabaseStatus | null;
  onRefreshStatus: () => void;
  logs: FoodLogItem[];
  progress: UserProgressItem[];
  goals: NutritionGoals;
}

export const MongoDbModal: React.FC<MongoDbModalProps> = ({
  status,
  onRefreshStatus,
  logs,
  progress,
  goals,
}) => {
  const [mongoUri, setMongoUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectResult, setConnectResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeCollection, setActiveCollection] = useState<'food_logs' | 'user_progress' | 'nutrition_goals' | 'custom_foods'>('food_logs');
  const [customFoodsList, setCustomFoodsList] = useState<FoodItemCatalog[]>([]);

  useEffect(() => {
    api.searchFoods('').then((f) => setCustomFoodsList(f)).catch(() => {});
  }, []);

  const handleConnectMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;

    setIsConnecting(true);
    setConnectResult(null);
    try {
      const res = await api.connectMongo(mongoUri.trim());
      setConnectResult(res);
      if (res.success) {
        onRefreshStatus();
      }
    } catch (err: any) {
      setConnectResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/export';
  };

  const isRemote = status?.mode === 'mongodb_atlas' || status?.connected;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-emerald-600" />
            <span>MongoDB Database & Schema Explorer</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Underlying document storage architecture powering daily nutritional records and user progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshStatus}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
            title="Refresh database status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportData}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-800 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export Database (JSON)</span>
          </button>
        </div>
      </div>

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Connection status */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Database Engine
            </span>
            {isRemote ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>MongoDB Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Embedded Mongo Engine</span>
              </span>
            )}
          </div>

          <div className="my-3">
            <h3 className="text-lg font-bold text-neutral-900">
              {status?.databaseName || 'nutritrack_db'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {status?.storageEngine || 'MongoDB Persistent Document Engine'}
            </p>
          </div>

          <div className="text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>Protocol</span>
            <span className="font-mono text-neutral-700 font-semibold">mongodb:// v6.x</span>
          </div>
        </div>

        {/* Collections Overview */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Collection Statistics
            </span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="my-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <span className="text-neutral-500 block">food_logs</span>
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                {status?.counts.foodLogs ?? logs.length}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Daily meal documents</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <span className="text-neutral-500 block">user_progress</span>
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                {status?.counts.progressEntries ?? progress.length}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Weigh-in documents</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <span className="text-neutral-500 block">custom_foods</span>
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                {status?.counts.customFoods ?? customFoodsList.length}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Nutrient items</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <span className="text-neutral-500 block">nutrition_goals</span>
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                1
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Target profile document</span>
            </div>
          </div>

          <div className="text-xs text-neutral-500 border-t border-neutral-100 pt-2 flex items-center justify-between">
            <span>Storage persistence</span>
            <span className="text-emerald-700 font-medium">Auto-synced on each mutation</span>
          </div>
        </div>

      </div>

      {/* Live Document Viewer */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-600" />
              <span>Live MongoDB Document Inspector</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Browse actual documents stored in each collection.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveCollection('food_logs')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCollection === 'food_logs' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'text-neutral-600'
              }`}
            >
              food_logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveCollection('user_progress')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCollection === 'user_progress' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'text-neutral-600'
              }`}
            >
              user_progress ({progress.length})
            </button>
            <button
              onClick={() => setActiveCollection('custom_foods')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCollection === 'custom_foods' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'text-neutral-600'
              }`}
            >
              custom_foods ({customFoodsList.length})
            </button>
            <button
              onClick={() => setActiveCollection('nutrition_goals')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCollection === 'nutrition_goals' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'text-neutral-600'
              }`}
            >
              nutrition_goals
            </button>
          </div>
        </div>

        <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-300 max-h-96 overflow-y-auto">
          {activeCollection === 'food_logs' && (
            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(logs, null, 2)}
            </pre>
          )}

          {activeCollection === 'user_progress' && (
            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(progress, null, 2)}
            </pre>
          )}

          {activeCollection === 'custom_foods' && (
            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(customFoodsList, null, 2)}
            </pre>
          )}

          {activeCollection === 'nutrition_goals' && (
            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(goals, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Connect to Remote MongoDB Atlas form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-neutral-900">
            External MongoDB Connection (Atlas / Dedicated Instance)
          </h3>
        </div>
        <p className="text-xs text-neutral-500 mb-4 max-w-2xl">
          By default, NutriTrack runs seamlessly using the built-in document database engine with file persistence. If you have a MongoDB Atlas connection string (e.g. <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">mongodb+srv://user:pass@cluster.mongodb.net/diet_tracker</code>), you can connect it directly here or set <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">MONGODB_URI</code> in your environment.
        </p>

        {connectResult && (
          <div
            className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
              connectResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {connectResult.success ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{connectResult.message}</span>
          </div>
        )}

        <form onSubmit={handleConnectMongo} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="mongodb+srv://username:password@cluster.mongodb.net/diet_tracker"
            value={mongoUri}
            onChange={(e) => setMongoUri(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono text-neutral-900 focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={isConnecting || !mongoUri.trim()}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition-all shadow-xs whitespace-nowrap"
          >
            {isConnecting ? 'Verifying...' : 'Test & Connect to MongoDB'}
          </button>
        </form>
      </div>
    </div>
  );
};
