import React, { useState } from 'react';
import { NutritionGoals } from '../types';
import { 
  Target, 
  Calculator, 
  Save, 
  Check, 
  Sparkles, 
  User, 
  Flame, 
  Activity,
  Droplet
} from 'lucide-react';

interface GoalsViewProps {
  goals: NutritionGoals;
  onSaveGoals: (updated: Partial<NutritionGoals>) => Promise<void>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onSaveGoals }) => {
  const [dailyCalories, setDailyCalories] = useState(goals.dailyCalories);
  const [proteinGrams, setProteinGrams] = useState(goals.proteinGrams);
  const [carbsGrams, setCarbsGrams] = useState(goals.carbsGrams);
  const [fatGrams, setFatGrams] = useState(goals.fatGrams);
  const [waterMl, setWaterMl] = useState(goals.waterMl);
  const [startingWeight, setStartingWeight] = useState(goals.startingWeight);
  const [targetWeight, setTargetWeight] = useState(goals.targetWeight);
  const [weightUnit, setWeightUnit] = useState(goals.weightUnit || 'kg');
  const [heightCm, setHeightCm] = useState(goals.heightCm || 175);
  const [age, setAge] = useState(goals.age || 28);
  const [gender, setGender] = useState(goals.gender || 'female');
  const [activityLevel, setActivityLevel] = useState(goals.activityLevel || 'moderate');
  const [dietGoal, setDietGoal] = useState(goals.dietGoal || 'weight_loss');

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate Macro Caloric Contribution
  const proteinCals = proteinGrams * 4;
  const carbsCals = carbsGrams * 4;
  const fatCals = fatGrams * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  // Mifflin-St Jeor BMR Formula
  const weightInKg = weightUnit === 'lbs' ? startingWeight * 0.453592 : startingWeight;
  const bmr =
    gender === 'male'
      ? 10 * weightInKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightInKg + 6.25 * heightCm - 5 * age - 161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

  // Goal adjustment
  const goalDeltas: Record<string, number> = {
    maintain: 0,
    mild_loss: -250,
    weight_loss: -500,
    muscle_gain: 300,
  };

  const recommendedCalories = Math.max(1200, tdee + (goalDeltas[dietGoal] || 0));

  // Recommended macros
  const applyRecommendedCalculator = () => {
    const cals = recommendedCalories;
    // 2.0g protein / kg
    const prot = Math.round(weightInKg * 2.0);
    // 25% fats
    const fat = Math.round((cals * 0.25) / 9);
    // Remaining carbs
    const carbCals = cals - prot * 4 - fat * 9;
    const carb = Math.max(50, Math.round(carbCals / 4));

    setDailyCalories(cals);
    setProteinGrams(prot);
    setCarbsGrams(carb);
    setFatGrams(fat);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveGoals({
        dailyCalories: Number(dailyCalories),
        proteinGrams: Number(proteinGrams),
        carbsGrams: Number(carbsGrams),
        fatGrams: Number(fatGrams),
        waterMl: Number(waterMl),
        startingWeight: Number(startingWeight),
        targetWeight: Number(targetWeight),
        weightUnit,
        heightCm: Number(heightCm),
        age: Number(age),
        gender,
        activityLevel,
        dietGoal,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* User Profile Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/user_avatar_1792836173080.jpg"
            alt="Alex Taylor user profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">Alex Taylor</h2>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Premium Tracker
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              nikhilvarmamandapati@gmail.com · Member since Oct 2026
            </p>
            <div className="flex items-center gap-3 text-xs text-neutral-600 mt-2 font-mono tabular-nums">
              <span>Goal: {goals.dietGoal.replace('_', ' ')}</span>
              <span>·</span>
              <span>Target: {goals.targetWeight} {goals.weightUnit}</span>
              <span>·</span>
              <span>Daily: {goals.dailyCalories} kcal</span>
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-neutral-200 sm:pl-6 text-xs space-y-1 text-neutral-500">
          <span className="block font-medium text-neutral-700">Account Database</span>
          <span className="font-mono text-emerald-700 font-semibold block">MongoDB Connected</span>
          <span className="text-[11px] text-neutral-400">User ID: {goals.userId}</span>
        </div>
      </div>

      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Nutrition Targets & Metabolic Calculator
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Configure daily macronutrient budgets, hydration targets, and body profile stored in MongoDB.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Biometric Profile & Calculator */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-neutral-900">Metabolic Profile & TDEE</h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-neutral-500">
                BMR: <strong className="font-mono tabular-nums text-neutral-800">{Math.round(bmr)} kcal</strong>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-500">
                Maintenance TDEE: <strong className="font-mono tabular-nums text-neutral-800">{tdee} kcal</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-neutral-900"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Age (Years)</label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 28)}
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 175)}
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Current Weight ({weightUnit})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={startingWeight}
                  onChange={(e) => setStartingWeight(parseFloat(e.target.value) || 75)}
                  className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as any)}
                  className="p-2 border border-neutral-300 rounded-lg bg-white text-neutral-900"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-neutral-900"
              >
                <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                <option value="light">Lightly Active (1-3 workout days/wk)</option>
                <option value="moderate">Moderately Active (3-5 workout days/wk)</option>
                <option value="active">Very Active (6-7 vigorous workout days)</option>
                <option value="very_active">Extremely Active (Athletic training/physical labor)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Primary Nutritional Goal</label>
              <select
                value={dietGoal}
                onChange={(e) => setDietGoal(e.target.value as any)}
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-neutral-900"
              >
                <option value="weight_loss">Weight Loss (-500 kcal deficit)</option>
                <option value="mild_loss">Mild Fat Loss (-250 kcal deficit)</option>
                <option value="maintain">Weight Maintenance (TDEE)</option>
                <option value="muscle_gain">Lean Muscle Gain (+300 kcal surplus)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Target Goal Weight ({weightUnit})</label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 70)}
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
              />
            </div>
          </div>

          {/* Assistant Action Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Scientifically Calculated Energy Target
              </span>
              <p className="text-xs text-emerald-800">
                Recommended intake is <strong className="font-mono tabular-nums">{recommendedCalories} kcal/day</strong> based on Mifflin-St Jeor formula and selected activity factor.
              </p>
            </div>

            <button
              type="button"
              onClick={applyRecommendedCalculator}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition-all shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              Apply Recommended Macros
            </button>
          </div>
        </div>

        {/* Section 2: Macro Targets Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-neutral-900">Custom Macronutrient & Hydration Targets</h2>
            </div>
            <span className="text-xs font-mono tabular-nums text-neutral-500">
              Macro sum: {totalMacroCals} kcal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Daily Calories (kcal) *
              </label>
              <input
                type="number"
                min="800"
                max="8000"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(parseInt(e.target.value) || 2000)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono tabular-nums text-base font-bold text-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Protein Target (g)
              </label>
              <input
                type="number"
                min="20"
                max="500"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(parseInt(e.target.value) || 120)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono tabular-nums text-base font-bold text-sky-700"
                required
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {proteinGrams * 4} kcal ({Math.round(((proteinGrams * 4) / (dailyCalories || 1)) * 100)}%)
              </span>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Carbohydrates (g)
              </label>
              <input
                type="number"
                min="0"
                max="800"
                value={carbsGrams}
                onChange={(e) => setCarbsGrams(parseInt(e.target.value) || 200)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono tabular-nums text-base font-bold text-amber-700"
                required
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {carbsGrams * 4} kcal ({Math.round(((carbsGrams * 4) / (dailyCalories || 1)) * 100)}%)
              </span>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Dietary Fat (g)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={fatGrams}
                onChange={(e) => setFatGrams(parseInt(e.target.value) || 60)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono tabular-nums text-base font-bold text-rose-700"
                required
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {fatGrams * 9} kcal ({Math.round(((fatGrams * 9) / (dailyCalories || 1)) * 100)}%)
              </span>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Water Target (ml)
              </label>
              <input
                type="number"
                min="500"
                step="250"
                value={waterMl}
                onChange={(e) => setWaterMl(parseInt(e.target.value) || 2500)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono tabular-nums text-base font-bold text-sky-600"
                required
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                ~{(waterMl / 250).toFixed(0)} glasses/day
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between">
          <div>
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Nutrition targets updated & persisted to MongoDB!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs rounded-lg transition-all shadow-xs inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Targets to MongoDB'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
