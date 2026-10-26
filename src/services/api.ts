import { FoodLogItem, UserProgressItem, NutritionGoals, FoodItemCatalog, DatabaseStatus } from '../types';

export const api = {
  // DB status
  async getStatus(): Promise<{ success: boolean; status: DatabaseStatus }> {
    const res = await fetch('/api/status');
    return res.json();
  },

  async connectMongo(uri: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/mongodb/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return res.json();
  },

  // Food logs
  async getLogs(date: string): Promise<FoodLogItem[]> {
    const res = await fetch(`/api/logs?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    return data.logs || [];
  },

  async addLog(payload: Partial<FoodLogItem>): Promise<FoodLogItem> {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to add food log');
    return data.item;
  },

  async updateLog(id: string, updates: Partial<FoodLogItem>): Promise<FoodLogItem> {
    const res = await fetch(`/api/logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update food log');
    return data.item;
  },

  async deleteLog(id: string): Promise<boolean> {
    const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  async copyYesterday(todayDate: string): Promise<FoodLogItem[]> {
    const res = await fetch('/api/logs/copy-yesterday', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todayDate }),
    });
    const data = await res.json();
    return data.copied || [];
  },

  // Water logs
  async getWater(date: string): Promise<number> {
    const res = await fetch(`/api/water?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    return data.amountMl || 0;
  },

  async setWater(date: string, amountMl: number): Promise<number> {
    const res = await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, amountMl }),
    });
    const data = await res.json();
    return data.amountMl;
  },

  // Nutrition goals
  async getGoals(): Promise<NutritionGoals> {
    const res = await fetch('/api/goals');
    const data = await res.json();
    return data.goals;
  },

  async updateGoals(goals: Partial<NutritionGoals>): Promise<NutritionGoals> {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goals),
    });
    const data = await res.json();
    return data.goals;
  },

  // User progress (weights)
  async getProgress(): Promise<UserProgressItem[]> {
    const res = await fetch('/api/progress');
    const data = await res.json();
    return data.history || [];
  },

  async addProgress(entry: Partial<UserProgressItem>): Promise<UserProgressItem> {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save progress');
    return data.entry;
  },

  async deleteProgress(id: string): Promise<boolean> {
    const res = await fetch(`/api/progress/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  // Foods catalog
  async searchFoods(query: string = '', category?: string): Promise<FoodItemCatalog[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    const res = await fetch(`/api/foods/search?${params.toString()}`);
    const data = await res.json();
    return data.foods || [];
  },

  async addCustomFood(food: Partial<FoodItemCatalog>): Promise<FoodItemCatalog> {
    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(food),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save food');
    return data.food;
  },

  // AI nutrition estimation
  async estimateMeal(query: string): Promise<{
    foodName: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    notes?: string;
  }> {
    const res = await fetch('/api/ai/estimate-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to estimate');
    return data.data;
  },
};
