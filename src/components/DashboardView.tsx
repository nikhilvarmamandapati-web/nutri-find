import React from 'react';
import { FoodLogItem, NutritionGoals } from '../types';
import { DateNavigator } from './DateNavigator';
import { 
  Flame, 
  Droplet, 
  Plus, 
  ChevronRight, 
  Utensils, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie,
  Copy,
  TrendingDown,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  logs: FoodLogItem[];
  goals: NutritionGoals;
  waterMl: number;
  onUpdateWater: (amount: number) => void;
  onOpenLogModal: (mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onSelectTab: (tab: any) => void;
  onCopyYesterday: () => void;
  isCopying: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentDate,
  onDateChange,
  logs,
  goals,
  waterMl,
  onUpdateWater,
  onOpenLogModal,
  onSelectTab,
  onCopyYesterday,
  isCopying,
}) => {
  // Aggregate daily totals
  const totalCalories = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = logs.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = logs.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = logs.reduce((sum, item) => sum + (item.fat || 0), 0);
  const totalFiber = logs.reduce((sum, item) => sum + (item.fiber || 0), 0);

  const targetCalories = goals.dailyCalories || 2000;
  const remainingCalories = targetCalories - totalCalories;
  const caloriePercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  // Meal breakdown
  const mealSections = [
    { type: 'breakfast' as const, label: 'Breakfast', icon: Coffee, desc: 'Energize your morning' },
    { type: 'lunch' as const, label: 'Lunch', icon: Sun, desc: 'Midday sustained fuel' },
    { type: 'dinner' as const, label: 'Dinner', icon: Moon, desc: 'Evening recovery meal' },
    { type: 'snack' as const, label: 'Snacks & Fuel', icon: Cookie, desc: 'Healthy bite-sized nutrition' },
  ];

  const getMealItems = (type: string) => logs.filter((item) => item.mealType === type);

  // Water calculations
  const targetWater = goals.waterMl || 2500;
  const waterPercent = Math.min(100, Math.round((waterMl / targetWater) * 100));

  // Macro percentages
  const proteinPercent = Math.min(100, Math.round((totalProtein / (goals.proteinGrams || 140)) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / (goals.carbsGrams || 220)) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / (goals.fatGrams || 65)) * 100));

  return (
    <div className="space-y-8">
      {/* Top Controls Header with User Profile Photo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => onSelectTab('goals')}
            className="relative shrink-0 rounded-full focus:outline-none group"
            title="View Profile & Nutrition Goals"
          >
            <img
              src="/src/assets/images/user_avatar_1792836173080.jpg"
              alt="Alex Taylor user profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shadow-2xs group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
              title="Active User"
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Welcome back, Alex
              </h1>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Active Member
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Daily nutritional intake, calorie balance & hydration · Stored in MongoDB
            </p>
          </div>
        </div>
        <DateNavigator currentDate={currentDate} onDateChange={onDateChange} />
      </div>

      {/* Hero Culinary Card */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-900 text-white shadow-sm border border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Utensils className="w-3.5 h-3.5" />
                <span>Whole Food Nutrition Focus</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {remainingCalories >= 0
                  ? `${remainingCalories.toLocaleString()} kcal Remaining Today`
                  : `${Math.abs(remainingCalories).toLocaleString()} kcal Over Daily Target`}
              </h2>
              <p className="text-sm text-neutral-300 max-w-xl">
                Targeting <span className="font-semibold text-white tabular-nums">{targetCalories.toLocaleString()} kcal</span> with high-protein whole foods. Clean macronutrient distribution preserves lean mass while maintaining metabolic rate.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-xs text-neutral-400 block">Logged</span>
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {totalCalories.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-400 ml-1">kcal</span>
              </div>
              <div className="w-px h-8 bg-neutral-800 hidden sm:block" />
              <div>
                <span className="text-xs text-neutral-400 block">Goal Target</span>
                <span className="text-xl font-bold font-mono tabular-nums text-neutral-200">
                  {targetCalories.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-400 ml-1">kcal</span>
              </div>
              <div className="w-px h-8 bg-neutral-800 hidden sm:block" />
              <div>
                <span className="text-xs text-neutral-400 block">Current Diet Phase</span>
                <span className="text-sm font-semibold text-emerald-400 capitalize">
                  {goals.dietGoal.replace('_', ' ')}
                </span>
              </div>

              <div className="ml-auto">
                <button
                  onClick={() => onOpenLogModal()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Food Item</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full">
            <img
              src="/src/assets/images/nutrition_banner_1792836173457.jpg"
              alt="Fresh nutritious culinary ingredients"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-neutral-900 via-neutral-900/40 to-transparent" />
          </div>

        </div>
      </div>

      {/* Main KPI Row: Calories Ring & Macro Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories Progress Box */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Calories Intake
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-sm text-neutral-500">/ {targetCalories} kcal</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  caloriePercent > 105 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 tabular-nums">
              <span>{caloriePercent}% consumed</span>
              <span>{remainingCalories} remaining</span>
            </div>
          </div>
        </div>

        {/* Protein Macro Box */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Protein
            </span>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              {Math.round(totalProtein * 4)} kcal
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {Math.round(totalProtein)}
            </span>
            <span className="text-sm text-neutral-500">/ {goals.proteinGrams || 140} g</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-500 rounded-full"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 tabular-nums">
              <span>{proteinPercent}% of target</span>
              <span>{Math.max(0, (goals.proteinGrams || 140) - Math.round(totalProtein))}g left</span>
            </div>
          </div>
        </div>

        {/* Carbohydrates Macro Box */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Carbohydrates
            </span>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              {Math.round(totalCarbs * 4)} kcal
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {Math.round(totalCarbs)}
            </span>
            <span className="text-sm text-neutral-500">/ {goals.carbsGrams || 220} g</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 tabular-nums">
              <span>{carbsPercent}% of target</span>
              <span>{Math.max(0, (goals.carbsGrams || 220) - Math.round(totalCarbs))}g left</span>
            </div>
          </div>
        </div>

        {/* Fats Macro Box */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Dietary Fats
            </span>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              {Math.round(totalFat * 9)} kcal
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {Math.round(totalFat)}
            </span>
            <span className="text-sm text-neutral-500">/ {goals.fatGrams || 65} g</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-rose-400 transition-all duration-500 rounded-full"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 tabular-nums">
              <span>{fatPercent}% of target</span>
              <span>{Math.max(0, (goals.fatGrams || 65) - Math.round(totalFat))}g left</span>
            </div>
          </div>
        </div>

      </div>

      {/* Hydration & Nutrient Micronutrients Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hydration Tracker */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-sky-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Hydration Log</h3>
                <p className="text-xs text-neutral-500">Goal: {targetWater} ml / day</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                {waterMl.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 ml-1">ml ({waterPercent}%)</span>
            </div>
          </div>

          <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden mb-5">
            <div
              className="h-full bg-sky-500 transition-all duration-500 rounded-full"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onUpdateWater(waterMl + 250)}
              className="px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml (Glass)</span>
            </button>
            <button
              onClick={() => onUpdateWater(waterMl + 500)}
              className="px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 ml (Bottle)</span>
            </button>
            <button
              onClick={() => onUpdateWater(Math.max(0, waterMl - 250))}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors ml-auto"
            >
              -250 ml
            </button>
            <button
              onClick={() => onUpdateWater(0)}
              className="px-2 py-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Dietary Fiber & Calorie Density Summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900">Dietary Fiber & Quality</h3>
              <Info className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>Dietary Fiber</span>
                  <span className="font-mono tabular-nums font-semibold">{totalFiber.toFixed(1)} g / 30 g</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((totalFiber / 30) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 text-xs text-neutral-500 space-y-1">
                <div className="flex justify-between">
                  <span>Logged Meals Count</span>
                  <span className="font-mono tabular-nums text-neutral-800">{logs.length} items</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Weight Delta</span>
                  <span className="font-mono tabular-nums text-neutral-800">
                    {goals.startingWeight} {goals.weightUnit} → {goals.targetWeight} {goals.weightUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('goals')}
            className="mt-4 text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-3 border-t border-neutral-100"
          >
            <span>Adjust Nutrition Targets</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Meal Breakdown Timeline */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Today&apos;s Meal Logs</h2>
            <p className="text-xs text-neutral-500">
              Categorized meal journal with macro values saved in your MongoDB collection.
            </p>
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
              onClick={() => onSelectTab('meals')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <span>Full Journal View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {mealSections.map((meal) => {
            const items = getMealItems(meal.type);
            const mealCals = items.reduce((sum, i) => sum + i.calories, 0);
            const Icon = meal.icon;

            return (
              <div key={meal.type} className="p-5 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{meal.label}</h4>
                      <p className="text-xs text-neutral-500">{meal.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono tabular-nums text-neutral-900">
                        {mealCals}
                      </span>
                      <span className="text-xs text-neutral-500 ml-1">kcal</span>
                    </div>
                    <button
                      onClick={() => onOpenLogModal(meal.type)}
                      className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                      title={`Add food to ${meal.label}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items in this meal */}
                {items.length === 0 ? (
                  <p className="text-xs text-neutral-400 pl-11 italic">No foods logged for {meal.label.toLowerCase()} yet.</p>
                ) : (
                  <div className="pl-11 space-y-1.5">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-md bg-neutral-50 border border-neutral-100 text-neutral-700"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{item.foodName}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-neutral-500 tabular-nums">
                            {item.servings} × {item.servingSize} {item.servingUnit}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-500 font-mono tabular-nums">
                          <span>{item.protein}g P</span>
                          <span>{item.carbs}g C</span>
                          <span>{item.fat}g F</span>
                          <span className="font-semibold text-neutral-900">{item.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
