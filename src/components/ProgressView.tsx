import React, { useState } from 'react';
import { UserProgressItem, NutritionGoals } from '../types';
import { 
  TrendingDown, 
  TrendingUp, 
  Scale, 
  Plus, 
  Trash2, 
  Target, 
  Activity, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface ProgressViewProps {
  progressHistory: UserProgressItem[];
  goals: NutritionGoals;
  onAddProgress: (entry: Partial<UserProgressItem>) => Promise<void>;
  onDeleteProgress: (id: string) => Promise<void>;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progressHistory,
  goals,
  onAddProgress,
  onDeleteProgress,
}) => {
  const [newWeight, setNewWeight] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newBodyFat, setNewBodyFat] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort history chronologically
  const sorted = [...progressHistory].sort((a, b) => a.date.localeCompare(b.date));
  
  const currentEntry = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const currentWeight = currentEntry ? currentEntry.weight : goals.startingWeight;
  const initialWeight = sorted.length > 0 ? sorted[0].weight : goals.startingWeight;
  const targetWeight = goals.targetWeight;
  const unit = goals.weightUnit || 'kg';

  const totalDelta = currentWeight - initialWeight;
  const targetDelta = targetWeight - currentWeight;

  // BMI Calculation: weight (kg) / [height (m)]^2
  const heightM = (goals.heightCm || 175) / 100;
  const currentWeightKg = unit === 'lbs' ? currentWeight * 0.453592 : currentWeight;
  const bmi = heightM > 0 ? (currentWeightKg / (heightM * heightM)).toFixed(1) : '22.0';

  let bmiCategory = 'Normal weight';
  const bmiNum = parseFloat(bmi);
  if (bmiNum < 18.5) bmiCategory = 'Underweight';
  else if (bmiNum >= 25 && bmiNum < 30) bmiCategory = 'Overweight';
  else if (bmiNum >= 30) bmiCategory = 'Obesity range';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(parseFloat(newWeight))) return;

    setIsSubmitting(true);
    try {
      await onAddProgress({
        date: newDate,
        weight: parseFloat(newWeight),
        unit,
        bodyFat: newBodyFat ? parseFloat(newBodyFat) : undefined,
        notes: newNotes.trim() || undefined,
      });
      setNewWeight('');
      setNewBodyFat('');
      setNewNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SVG Chart Dimensions
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Compute scale
  const weights = sorted.map((p) => p.weight);
  if (targetWeight) weights.push(targetWeight);

  const minW = Math.min(...(weights.length > 0 ? weights : [60])) - 1;
  const maxW = Math.max(...(weights.length > 0 ? weights : [80])) + 1;
  const rangeW = maxW - minW || 1;

  const getX = (index: number) => {
    if (sorted.length <= 1) return chartWidth / 2;
    return paddingX + (index / (sorted.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    return chartHeight - paddingY - ((val - minW) / rangeW) * (chartHeight - paddingY * 2);
  };

  const pointsPath = sorted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.weight).toFixed(1)}`)
    .join(' ');

  const targetLineY = targetWeight ? getY(targetWeight) : null;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Weight & Body Composition Progress
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Progress time-series records persisted directly to your MongoDB database.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <span>Current Weight</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {currentWeight}
            </span>
            <span className="text-sm text-neutral-500">{unit}</span>
          </div>
          <p className="text-xs text-neutral-500">
            Started at <strong className="font-mono tabular-nums text-neutral-800">{initialWeight} {unit}</strong>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <span>Total Change</span>
            {totalDelta <= 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {totalDelta > 0 ? `+${totalDelta.toFixed(1)}` : totalDelta.toFixed(1)}
            </span>
            <span className="text-sm text-neutral-500">{unit}</span>
          </div>
          <p className="text-xs text-neutral-500">
            {totalDelta < 0 ? 'Progressive weight loss' : totalDelta > 0 ? 'Surplus / Mass gain' : 'Baseline weight'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <span>Target Goal</span>
            <Target className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {targetWeight}
            </span>
            <span className="text-sm text-neutral-500">{unit}</span>
          </div>
          <p className="text-xs text-neutral-500 font-mono tabular-nums">
            {targetDelta > 0 ? `+${targetDelta.toFixed(1)}` : targetDelta.toFixed(1)} {unit} to target
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <span>Body Mass Index (BMI)</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {bmi}
            </span>
            <span className="text-xs text-neutral-500 font-sans">kg/m²</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium">{bmiCategory}</p>
        </div>

      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Weight Trend Line</h3>
            <p className="text-xs text-neutral-500">
              Historical bodyweight plot vs your defined target threshold.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
              <span className="text-neutral-600 font-medium">Logged Weight</span>
            </div>
            {targetWeight && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-500 border-t border-dashed border-sky-500" />
                <span className="text-neutral-600 font-medium">Target ({targetWeight} {unit})</span>
              </div>
            )}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-neutral-400">
            No weight entries recorded yet. Log your first weigh-in below!
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[500px]"
            >
              {/* Background horizontal grid lines */}
              {[minW, minW + rangeW * 0.33, minW + rangeW * 0.66, maxW].map((val, idx) => {
                const y = getY(val);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#9ca3af"
                      className="font-mono tabular-nums"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Target weight line */}
              {targetLineY !== null && (
                <g>
                  <line
                    x1={paddingX}
                    y1={targetLineY}
                    x2={chartWidth - paddingX}
                    y2={targetLineY}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartWidth - paddingX + 6}
                    y={targetLineY + 3}
                    fontSize="10"
                    fill="#0284c7"
                    className="font-mono font-semibold"
                  >
                    Goal
                  </text>
                </g>
              )}

              {/* Progress Line */}
              {sorted.length > 1 && (
                <path
                  d={pointsPath}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points & Tooltips */}
              {sorted.map((item, idx) => {
                const cx = getX(idx);
                const cy = getY(item.weight);
                return (
                  <g key={item._id} className="group cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#111827"
                      className="font-mono font-bold tabular-nums"
                    >
                      {item.weight}
                    </text>
                    <text
                      x={cx}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#6b7280"
                      className="font-mono"
                    >
                      {item.date.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Log Form & History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form: Add New Weigh-in */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-neutral-900">Record Weigh-in</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Weight ({unit}) *
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 74.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900 font-mono tabular-nums text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Estimated Body Fat % (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 19.5"
                value={newBodyFat}
                onChange={(e) => setNewBodyFat(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Notes</label>
              <input
                type="text"
                placeholder="e.g. Morning fasted, post hydration"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newWeight}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-lg transition-all shadow-xs inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Weigh-in to MongoDB</span>
            </button>
          </form>
        </div>

        {/* Historical Weigh-in Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs lg:col-span-2">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Weigh-in History</h3>
              <p className="text-xs text-neutral-500">MongoDB `user_progress` collection records</p>
            </div>
            <span className="text-xs font-mono tabular-nums text-neutral-500">
              {sorted.length} entries
            </span>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Weight ({unit})</th>
                  <th className="py-2.5 px-4">Body Fat</th>
                  <th className="py-2.5 px-4">Notes</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono tabular-nums text-neutral-700">
                {[...sorted].reverse().map((item) => (
                  <tr key={item._id} className="hover:bg-neutral-50/70">
                    <td className="py-2.5 px-4 font-semibold text-neutral-900 font-sans">{item.date}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-700">{item.weight} {unit}</td>
                    <td className="py-2.5 px-4 text-neutral-500">{item.bodyFat ? `${item.bodyFat}%` : '—'}</td>
                    <td className="py-2.5 px-4 font-sans text-neutral-600 max-w-xs truncate">{item.notes || '—'}</td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      <button
                        onClick={() => onDeleteProgress(item._id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
