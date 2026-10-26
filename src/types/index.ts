export interface FoodLogItem {
  _id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  servingSize: number;
  servingUnit: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  notes?: string;
  createdAt: string;
}

export interface UserProgressItem {
  _id: string;
  userId: string;
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
  bodyFat?: number;
  notes?: string;
  createdAt: string;
}

export interface NutritionGoals {
  _id?: string;
  userId: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterMl: number;
  startingWeight: number;
  targetWeight: number;
  weightUnit: 'kg' | 'lbs';
  heightCm: number;
  age: number;
  gender: 'female' | 'male' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietGoal: 'maintain' | 'mild_loss' | 'weight_loss' | 'muscle_gain';
  updatedAt: string;
}

export interface FoodItemCatalog {
  _id: string;
  name: string;
  category: 'Protein' | 'Grains' | 'Produce' | 'Dairy' | 'Fats & Oils' | 'Snacks' | 'Beverages' | 'Prepared';
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isCustom?: boolean;
}

export interface DatabaseStatus {
  connected: boolean;
  mode: 'mongodb_atlas' | 'mongodb_embedded';
  databaseName: string;
  storageEngine: string;
  counts: {
    foodLogs: number;
    progressEntries: number;
    customFoods: number;
    waterLogs: number;
  };
  hasMongoUriEnv: boolean;
}
