import React, { useState, useEffect } from 'react';
import { FoodItemCatalog, FoodLogItem } from '../types';
import { api } from '../services/api';
import { 
  X, 
  Search, 
  Sparkles, 
  Plus, 
  Zap, 
  Bookmark, 
  Check, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

interface LogFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  onFoodLogged: (newLog: FoodLogItem) => void;
}

export const LogFoodModal: React.FC<LogFoodModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'breakfast',
  date,
  onFoodLogged,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'ai' | 'quick' | 'custom'>('search');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultMealType);
  
  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [catalogFoods, setCatalogFoods] = useState<FoodItemCatalog[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItemCatalog | null>(null);
  const [servings, setServings] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // AI Tab state
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    foodName: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    notes?: string;
  } | null>(null);

  // Quick Add state
  const [quickName, setQuickName] = useState('');
  const [quickCalories, setQuickCalories] = useState<string>('');
  const [quickProtein, setQuickProtein] = useState<string>('');
  const [quickCarbs, setQuickCarbs] = useState<string>('');
  const [quickFat, setQuickFat] = useState<string>('');

  // Custom Food state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodItemCatalog['category']>('Prepared');
  const [customServingSize, setCustomServingSize] = useState<number>(100);
  const [customServingUnit, setCustomServingUnit] = useState<string>('g');
  const [customCalories, setCustomCalories] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('');
  const [customCarbs, setCustomCarbs] = useState<string>('');
  const [customFat, setCustomFat] = useState<string>('');
  const [customFiber, setCustomFiber] = useState<string>('');
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultMealType) {
      setMealType(defaultMealType);
    }
  }, [defaultMealType]);

  // Load foods catalog
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingCatalog(true);
    api.searchFoods(searchQuery, categoryFilter === 'All' ? undefined : categoryFilter)
      .then((foods) => {
        if (isMounted) {
          setCatalogFoods(foods);
          if (foods.length > 0 && !selectedFood) {
            setSelectedFood(foods[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setIsLoadingCatalog(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, searchQuery, categoryFilter]);

  if (!isOpen) return null;

  // Handle Log from Catalog
  const handleLogCatalogFood = async () => {
    if (!selectedFood) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await api.addLog({
        date,
        mealType,
        foodName: selectedFood.name,
        servingSize: selectedFood.servingSize,
        servingUnit: selectedFood.servingUnit,
        servings: Number(servings),
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber,
        notes: notes.trim() || undefined,
      });
      onFoodLogged(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save food log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle AI Estimate
  const handleAiEstimate = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.estimateMeal(aiInput);
      setAiResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not estimate meal nutrition');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogAiResult = async () => {
    if (!aiResult) return;
    setIsSubmitting(true);
    try {
      const created = await api.addLog({
        date,
        mealType,
        foodName: aiResult.foodName,
        servingSize: aiResult.servingSize,
        servingUnit: aiResult.servingUnit,
        servings: 1,
        calories: aiResult.calories,
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
        fiber: aiResult.fiber,
        notes: aiResult.notes,
      });
      onFoodLogged(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log AI estimated food');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Add
  const handleLogQuickAdd = async () => {
    if (!quickName.trim() || !quickCalories) {
      setErrorMessage('Food name and calories are required');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await api.addLog({
        date,
        mealType,
        foodName: quickName.trim(),
        servingSize: 1,
        servingUnit: 'portion',
        servings: 1,
        calories: Number(quickCalories),
        protein: Number(quickProtein || 0),
        carbs: Number(quickCarbs || 0),
        fat: Number(quickFat || 0),
        fiber: 0,
      });
      onFoodLogged(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log quick calories');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Custom Food
  const handleSaveCustomFood = async () => {
    if (!customName.trim() || !customCalories) {
      setErrorMessage('Please provide food name and calories per serving');
      return;
    }
    setIsSavingCustom(true);
    setErrorMessage(null);
    try {
      const saved = await api.addCustomFood({
        name: customName.trim(),
        category: customCategory,
        servingSize: Number(customServingSize),
        servingUnit: customServingUnit.trim() || 'g',
        calories: Number(customCalories),
        protein: Number(customProtein || 0),
        carbs: Number(customCarbs || 0),
        fat: Number(customFat || 0),
        fiber: Number(customFiber || 0),
      });

      // Also automatically select this food and switch to search tab
      setSelectedFood(saved);
      setActiveTab('search');
      setSearchQuery(saved.name);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save custom food');
    } finally {
      setIsSavingCustom(false);
    }
  };

  const categories = ['All', 'Protein', 'Produce', 'Grains', 'Dairy', 'Fats & Oils', 'Snacks'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Log Nutrition Intake</h2>
            <p className="text-xs text-neutral-500">Record to MongoDB daily nutritional database</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Selector Bar */}
        <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-neutral-600">Assign to Meal:</span>
          <div className="flex items-center gap-1">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMealType(m)}
                className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                  mealType === m
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-200/60'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-neutral-200 flex gap-4 text-xs font-semibold text-neutral-500">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-emerald-600 text-neutral-900'
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            Search Food Database
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-emerald-600 text-neutral-900'
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Natural Language Parser</span>
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-3 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'quick'
                ? 'border-emerald-600 text-neutral-900'
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Calorie Add</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-neutral-900'
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Create Custom Food</span>
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SEARCH CATALOG */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search verified foods (e.g. Chicken, Oats, Salmon, Rice)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                      categoryFilter === c
                        ? 'bg-neutral-900 text-white font-medium'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Results Grid */}
              <div className="border border-neutral-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-neutral-100">
                {isLoadingCatalog ? (
                  <div className="p-8 text-center text-xs text-neutral-400">Loading food database...</div>
                ) : catalogFoods.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No foods found matching &ldquo;{searchQuery}&rdquo;. Try creating a custom food!
                  </div>
                ) : (
                  catalogFoods.map((food) => {
                    const isSelected = selectedFood?._id === food._id;
                    return (
                      <div
                        key={food._id}
                        onClick={() => setSelectedFood(food)}
                        className={`p-3 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-emerald-50/70 border-l-2 border-emerald-600' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                            <span>{food.name}</span>
                            {food.isCustom && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-normal">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {food.servingSize} {food.servingUnit} · {food.category}
                          </div>
                        </div>

                        <div className="text-right font-mono tabular-nums text-neutral-600">
                          <span className="font-bold text-neutral-900">{food.calories} kcal</span>
                          <div className="text-[11px] text-neutral-400">
                            {food.protein}g P · {food.carbs}g C · {food.fat}g F
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Item Serving Adjustment */}
              {selectedFood && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                    <span>Selected: {selectedFood.name}</span>
                    <span className="font-mono tabular-nums text-emerald-700">
                      {Math.round(selectedFood.calories * servings)} kcal total
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-neutral-500 mb-1">Number of Servings:</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={servings}
                        onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono tabular-nums"
                      />
                      <span className="text-[11px] text-neutral-400 mt-0.5 block">
                        Base: 1 serving = {selectedFood.servingSize} {selectedFood.servingUnit}
                      </span>
                    </div>

                    <div>
                      <label className="block text-neutral-500 mb-1">Optional Notes:</label>
                      <input
                        type="text"
                        placeholder="e.g. without dressing..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Calculated Macro Pill Row */}
                  <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between text-xs font-mono tabular-nums text-neutral-600">
                    <span>Prot: {(selectedFood.protein * servings).toFixed(1)}g</span>
                    <span>Carbs: {(selectedFood.carbs * servings).toFixed(1)}g</span>
                    <span>Fat: {(selectedFood.fat * servings).toFixed(1)}g</span>
                    <span>Fiber: {((selectedFood.fiber || 0) * servings).toFixed(1)}g</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI MEAL PARSER */}
          {activeTab === 'ai' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Natural Language Meal Intelligence
                </span>
                <p className="text-[11px] text-emerald-700">
                  Type what you ate in plain English. The AI engine calculates caloric density, macronutrients, and estimated portions.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Describe your meal:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 2 scrambled eggs with cheddar cheese, 2 slices whole wheat toast with butter, and an orange"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-emerald-600 text-neutral-900"
                />
              </div>

              <button
                onClick={handleAiEstimate}
                disabled={isAiLoading || !aiInput.trim()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing nutritional breakdown...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Estimate Nutrition Breakdown</span>
                  </>
                )}
              </button>

              {aiResult && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{aiResult.foodName}</h4>
                      <p className="text-[11px] text-neutral-500">{aiResult.notes}</p>
                    </div>
                    <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                      {aiResult.calories} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center py-2 bg-white rounded-lg border border-neutral-100 font-mono tabular-nums">
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-sans">Protein</span>
                      <span className="font-bold text-sky-700">{aiResult.protein}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-sans">Carbs</span>
                      <span className="font-bold text-amber-700">{aiResult.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-sans">Fat</span>
                      <span className="font-bold text-rose-700">{aiResult.fat}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-sans">Fiber</span>
                      <span className="font-bold text-emerald-700">{aiResult.fiber}g</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogAiResult}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Log this Meal to {mealType}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUICK CALORIE ADD */}
          {activeTab === 'quick' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-500">
                Log a quick calorie amount directly when eating out or when you already know the label values.
              </p>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Item / Meal Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Protein Bar, Coffee with oat milk, Restaurant dinner"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Calories (kcal) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="350"
                    value={quickCalories}
                    onChange={(e) => setQuickCalories(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="20"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="30"
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={quickFat}
                    onChange={(e) => setQuickFat(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
              </div>

              <button
                onClick={handleLogQuickAdd}
                disabled={isSubmitting}
                className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Log to {mealType}</span>
              </button>
            </div>
          )}

          {/* TAB 4: CREATE CUSTOM FOOD */}
          {activeTab === 'custom' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-500">
                Create a customized food item with your specific brand or recipe macros. It will be stored in your MongoDB database forever.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Food Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Homemade Sourdough Loaf"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                  >
                    <option value="Protein">Protein</option>
                    <option value="Grains">Grains</option>
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Fats & Oils">Fats & Oils</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Prepared">Prepared Meal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Serving Size</label>
                  <input
                    type="number"
                    min="1"
                    value={customServingSize}
                    onChange={(e) => setCustomServingSize(parseFloat(e.target.value) || 100)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Serving Unit</label>
                  <input
                    type="text"
                    placeholder="g, ml, slice, cup"
                    value={customServingUnit}
                    onChange={(e) => setCustomServingUnit(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Calories *</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Fat (g)</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={customFiber}
                    onChange={(e) => setCustomFiber(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums text-neutral-900"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveCustomFood}
                disabled={isSavingCustom}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {isSavingCustom ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                <span>Save to MongoDB Food Collection</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {activeTab === 'search' && selectedFood && (
          <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Adding to <strong className="capitalize text-neutral-800">{mealType}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogCatalogFood}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Log Food ({Math.round(selectedFood.calories * servings)} kcal)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
