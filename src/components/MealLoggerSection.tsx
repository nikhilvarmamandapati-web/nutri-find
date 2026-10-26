import React, { useState } from 'react';
import { FoodLogItem, NutritionGoals } from '../types';
import { DateNavigator } from './DateNavigator';
import { 
  Coffee, 
  Sun, 
  Moon, 
  Cookie, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

interface MealLoggerSectionProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  logs: FoodLogItem[];
  goals: NutritionGoals;
  onOpenLogModal: (mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onDeleteLog: (id: string) => void;
  onUpdateLog: (id: string, updates: Partial<FoodLogItem>) => void;
  onCopyYesterday: () => void;
  isCopying: boolean;
}

export const MealLoggerSection: React.FC<MealLoggerSectionProps> = ({
  currentDate,
  onDateChange,
  logs,
  goals,
  onOpenLogModal,
  onDeleteLog,
  onUpdateLog,
  onCopyYesterday,
  isCopying,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editServings, setEditServings] = useState<number>(1);
  const [editNotes, setEditNotes] = useState<string>('');

  const mealCategories = [
    { type: 'breakfast' as const, title: 'Breakfast', icon: Coffee, desc: 'First nourishment of the day' },
    { type: 'lunch' as const, title: 'Lunch', icon: Sun, desc: 'Midday balance' },
    { type: 'dinner' as const, title: 'Dinner', icon: Moon, desc: 'Evening replenishment' },
    { type: 'snack' as const, title: 'Snacks & Supplements', icon: Cookie, desc: 'Between-meal fuel' },
  ];

  const totalCalories = logs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = logs.reduce((acc, curr) => acc + curr.protein, 0);
  const totalCarbs = logs.reduce((acc, curr) => acc + curr.carbs, 0);
  const totalFat = logs.reduce((acc, curr) => acc + curr.fat, 0);

  const startEdit = (item: FoodLogItem) => {
    setEditingId(item._id);
    setEditServings(item.servings);
    setEditNotes(item.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (item: FoodLogItem) => {
    const ratio = editServings / (item.servings || 1);
    onUpdateLog(item._id, {
      servings: editServings,
      calories: Math.round(item.calories * ratio),
      protein: Math.round(item.protein * ratio * 10) / 10,
      carbs: Math.round(item.carbs * ratio * 10) / 10,
      fat: Math.round(item.fat * ratio * 10) / 10,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Daily Meal Journal
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Detailed meal-by-meal log stored in MongoDB with serving scaling and macro tracking.
          </p>
        </div>
        <DateNavigator currentDate={currentDate} onDateChange={onDateChange} />
      </div>

      {/* Daily Nutrients Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-xs text-neutral-400 block">Total Calories</span>
            <span className="text-lg font-bold font-mono tabular-nums text-neutral-900">
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500"> / {goals.dailyCalories} kcal</span>
          </div>
          <div className="w-px h-7 bg-neutral-200 hidden sm:block" />
          <div>
            <span className="text-xs text-neutral-400 block">Protein</span>
            <span className="text-base font-bold font-mono tabular-nums text-sky-700">
              {Math.round(totalProtein)}g
            </span>
            <span className="text-xs text-neutral-500"> / {goals.proteinGrams}g</span>
          </div>
          <div className="w-px h-7 bg-neutral-200 hidden sm:block" />
          <div>
            <span className="text-xs text-neutral-400 block">Carbs</span>
            <span className="text-base font-bold font-mono tabular-nums text-amber-700">
              {Math.round(totalCarbs)}g
            </span>
            <span className="text-xs text-neutral-500"> / {goals.carbsGrams}g</span>
          </div>
          <div className="w-px h-7 bg-neutral-200 hidden sm:block" />
          <div>
            <span className="text-xs text-neutral-400 block">Fat</span>
            <span className="text-base font-bold font-mono tabular-nums text-rose-700">
              {Math.round(totalFat)}g
            </span>
            <span className="text-xs text-neutral-500"> / {goals.fatGrams}g</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {logs.length === 0 && (
            <button
              onClick={onCopyYesterday}
              disabled={isCopying}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopying ? 'Copying...' : "Copy Yesterday's Meals"}</span>
            </button>
          )}
          <button
            onClick={() => onOpenLogModal()}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Food Item</span>
          </button>
        </div>
      </div>

      {/* Meal Groups */}
      <div className="space-y-4">
        {mealCategories.map((cat) => {
          const items = logs.filter((l) => l.mealType === cat.type);
          const mealCals = items.reduce((sum, i) => sum + i.calories, 0);
          const mealProtein = items.reduce((sum, i) => sum + i.protein, 0);
          const mealCarbs = items.reduce((sum, i) => sum + i.carbs, 0);
          const mealFat = items.reduce((sum, i) => sum + i.fat, 0);
          const Icon = cat.icon;

          return (
            <div key={cat.type} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
              {/* Category Header */}
              <div className="px-5 py-4 bg-neutral-50/60 border-b border-neutral-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200/80 text-neutral-700 flex items-center justify-center shadow-2xs">
                    <Icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">{cat.title}</h3>
                    <p className="text-xs text-neutral-500">{cat.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono tabular-nums text-neutral-900">
                      {mealCals}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">kcal</span>
                    <div className="text-[11px] font-mono text-neutral-500 tabular-nums">
                      {Math.round(mealProtein)}g P · {Math.round(mealCarbs)}g C · {Math.round(mealFat)}g F
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenLogModal(cat.type)}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    title={`Add food to ${cat.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  <p>Nothing logged for {cat.title.toLowerCase()} yet.</p>
                  <button
                    onClick={() => onOpenLogModal(cat.type)}
                    className="mt-2 text-emerald-700 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log {cat.title}</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {items.map((item) => {
                    const isEditing = editingId === item._id;

                    if (isEditing) {
                      return (
                        <div key={item._id} className="p-4 bg-emerald-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="font-semibold text-neutral-900">{item.foodName}</span>
                            <div className="flex items-center gap-2">
                              <label className="text-neutral-500">Servings:</label>
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={editServings}
                                onChange={(e) => setEditServings(Math.max(0.1, parseFloat(e.target.value) || 1))}
                                className="w-16 px-2 py-1 bg-white border border-neutral-300 rounded font-mono tabular-nums text-neutral-900"
                              />
                              <span className="text-neutral-500">({item.servingSize} {item.servingUnit})</span>
                            </div>
                            <input
                              type="text"
                              placeholder="Notes (optional)..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-neutral-300 rounded text-neutral-900 mt-1"
                            />
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => saveEdit(item)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2.5 py-1 bg-neutral-200 text-neutral-700 rounded font-medium hover:bg-neutral-300 inline-flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item._id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-neutral-900">{item.foodName}</h4>
                            {item.notes && (
                              <span className="text-xs text-neutral-400 font-normal italic">
                                ({item.notes})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center gap-2">
                            <span className="tabular-nums font-mono">{item.servings} serving{item.servings !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span>{item.servingSize * item.servings} {item.servingUnit}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-neutral-600">
                            <span>{item.protein}g <span className="text-neutral-400 font-sans">Prot</span></span>
                            <span>{item.carbs}g <span className="text-neutral-400 font-sans">Carb</span></span>
                            <span>{item.fat}g <span className="text-neutral-400 font-sans">Fat</span></span>
                            <span className="text-sm font-bold text-neutral-900">
                              {item.calories} <span className="text-xs font-normal text-neutral-400 font-sans">kcal</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-neutral-400">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteLog(item._id)}
                              className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
