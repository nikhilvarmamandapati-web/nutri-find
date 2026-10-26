import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';

export interface FoodLogItem {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  servingSize: number;
  servingUnit: string;
  servings: number;
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber: number;   // grams
  notes?: string;
  createdAt: string;
}

export interface UserProgressItem {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
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
  createdAt?: string;
}

export interface WaterLogItem {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  updatedAt: string;
}

interface DatabaseState {
  food_logs: FoodLogItem[];
  user_progress: UserProgressItem[];
  nutrition_goals: NutritionGoals[];
  custom_foods: FoodItemCatalog[];
  water_logs: WaterLogItem[];
}

const DEFAULT_USER_ID = 'user_default';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'mongodb_store.json');

// Default starter food database (verified common foods with accurate macros)
const INITIAL_FOOD_DATABASE: FoodItemCatalog[] = [
  { _id: 'food_1', name: 'Oatmeal (Rolled Oats)', category: 'Grains', servingSize: 50, servingUnit: 'g (dry)', calories: 190, protein: 7, carbs: 34, fat: 3.5, fiber: 5 },
  { _id: 'food_2', name: 'Banana (Medium)', category: 'Produce', servingSize: 1, servingUnit: 'medium (118g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1 },
  { _id: 'food_3', name: 'Whole Milk', category: 'Dairy', servingSize: 240, servingUnit: 'ml (1 cup)', calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0 },
  { _id: 'food_4', name: 'Whey Protein Powder', category: 'Protein', servingSize: 30, servingUnit: 'g (1 scoop)', calories: 120, protein: 24, carbs: 2, fat: 1.5, fiber: 0 },
  { _id: 'food_5', name: 'Large Egg (Boiled or Poached)', category: 'Protein', servingSize: 1, servingUnit: 'large (50g)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },
  { _id: 'food_6', name: 'Whole Wheat Toast', category: 'Grains', servingSize: 1, servingUnit: 'slice (38g)', calories: 80, protein: 4, carbs: 14, fat: 1, fiber: 2 },
  { _id: 'food_7', name: 'Avocado', category: 'Produce', servingSize: 100, servingUnit: 'g (half fruit)', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { _id: 'food_8', name: 'Chicken Breast (Grilled)', category: 'Protein', servingSize: 150, servingUnit: 'g (cooked)', calories: 248, protein: 46, carbs: 0, fat: 5.4, fiber: 0 },
  { _id: 'food_9', name: 'Brown Rice (Cooked)', category: 'Grains', servingSize: 150, servingUnit: 'g (1 cup)', calories: 165, protein: 3.8, carbs: 35, fat: 1.4, fiber: 2.3 },
  { _id: 'food_10', name: 'Steamed Broccoli', category: 'Produce', servingSize: 100, servingUnit: 'g (1 cup)', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 2.6 },
  { _id: 'food_11', name: 'Extra Virgin Olive Oil', category: 'Fats & Oils', servingSize: 14, servingUnit: 'ml (1 tbsp)', calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0 },
  { _id: 'food_12', name: 'Atlantic Salmon (Baked)', category: 'Protein', servingSize: 150, servingUnit: 'g (fillet)', calories: 310, protein: 34, carbs: 0, fat: 18, fiber: 0 },
  { _id: 'food_13', name: 'Sweet Potato (Baked)', category: 'Produce', servingSize: 150, servingUnit: 'g (medium)', calories: 135, protein: 3, carbs: 31, fat: 0.2, fiber: 4.5 },
  { _id: 'food_14', name: 'Greek Yogurt (0% Nonfat)', category: 'Dairy', servingSize: 170, servingUnit: 'g (3/4 cup)', calories: 100, protein: 18, carbs: 6, fat: 0, fiber: 0 },
  { _id: 'food_15', name: 'Blueberries (Fresh)', category: 'Produce', servingSize: 100, servingUnit: 'g (1/2 cup)', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 },
  { _id: 'food_16', name: 'Raw Almonds', category: 'Snacks', servingSize: 28, servingUnit: 'g (handful)', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
  { _id: 'food_17', name: 'Apple (Honeycrisp)', category: 'Produce', servingSize: 1, servingUnit: 'medium (182g)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { _id: 'food_18', name: 'Peanut Butter (Natural)', category: 'Fats & Oils', servingSize: 32, servingUnit: 'g (2 tbsp)', calories: 190, protein: 8, carbs: 7, fat: 16, fiber: 2 },
  { _id: 'food_19', name: 'Quinoa (Cooked)', category: 'Grains', servingSize: 185, servingUnit: 'g (1 cup)', calories: 222, protein: 8.1, carbs: 39.4, fat: 3.6, fiber: 5.2 },
  { _id: 'food_20', name: 'Black Beans (Boiled)', category: 'Protein', servingSize: 170, servingUnit: 'g (1 cup)', calories: 227, protein: 15.2, carbs: 40.8, fat: 0.9, fiber: 15 }
];

export class DatabaseService {
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private isConnectedToMongo = false;
  private currentUri: string = '';
  private memoryStore: DatabaseState = {
    food_logs: [],
    user_progress: [],
    nutrition_goals: [],
    custom_foods: [...INITIAL_FOOD_DATABASE],
    water_logs: [],
  };

  constructor() {
    this.ensureDataDir();
    this.loadFromFile();
    this.initializeDefaults();
    this.tryInitMongo();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data dir', err);
      }
    }
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryStore = {
          food_logs: parsed.food_logs || [],
          user_progress: parsed.user_progress || [],
          nutrition_goals: parsed.nutrition_goals || [],
          custom_foods: parsed.custom_foods && parsed.custom_foods.length > 0 ? parsed.custom_foods : [...INITIAL_FOOD_DATABASE],
          water_logs: parsed.water_logs || [],
        };
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing fresh store.', err);
    }
  }

  private persistToFile() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  private initializeDefaults() {
    // If no nutrition goals exist, create a balanced default
    if (this.memoryStore.nutrition_goals.length === 0) {
      const defaultGoal: NutritionGoals = {
        _id: 'goal_' + Date.now(),
        userId: DEFAULT_USER_ID,
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
      };
      this.memoryStore.nutrition_goals.push(defaultGoal);
    }

    // Seed realistic sample progress history if empty
    if (this.memoryStore.user_progress.length === 0) {
      const today = new Date();
      const samplePoints: { daysAgo: number; weight: number }[] = [
        { daysAgo: 21, weight: 76.5 },
        { daysAgo: 14, weight: 75.8 },
        { daysAgo: 7, weight: 75.1 },
        { daysAgo: 3, weight: 74.7 },
        { daysAgo: 0, weight: 74.4 },
      ];

      samplePoints.forEach((p, idx) => {
        const d = new Date(today);
        d.setDate(d.getDate() - p.daysAgo);
        const dateStr = d.toISOString().split('T')[0];
        this.memoryStore.user_progress.push({
          _id: 'prog_' + (idx + 1),
          userId: DEFAULT_USER_ID,
          date: dateStr,
          weight: p.weight,
          unit: 'kg',
          bodyFat: 21.5 - idx * 0.4,
          notes: idx === 0 ? 'Starting diet phase' : 'Steady weekly weigh-in',
          createdAt: d.toISOString(),
        });
      });
    }

    // Seed sample meals for today if empty
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = this.memoryStore.food_logs.filter((l) => l.date === todayStr);
    if (todayLogs.length === 0) {
      const sampleLogs: Omit<FoodLogItem, '_id' | 'createdAt'>[] = [
        {
          userId: DEFAULT_USER_ID,
          date: todayStr,
          mealType: 'breakfast',
          foodName: 'Oatmeal (Rolled Oats)',
          servingSize: 50,
          servingUnit: 'g (dry)',
          servings: 1,
          calories: 190,
          protein: 7,
          carbs: 34,
          fat: 3.5,
          fiber: 5,
        },
        {
          userId: DEFAULT_USER_ID,
          date: todayStr,
          mealType: 'breakfast',
          foodName: 'Banana (Medium)',
          servingSize: 1,
          servingUnit: 'medium (118g)',
          servings: 1,
          calories: 105,
          protein: 1.3,
          carbs: 27,
          fat: 0.3,
          fiber: 3.1,
        },
        {
          userId: DEFAULT_USER_ID,
          date: todayStr,
          mealType: 'breakfast',
          foodName: 'Whey Protein Powder',
          servingSize: 30,
          servingUnit: 'g (1 scoop)',
          servings: 1,
          calories: 120,
          protein: 24,
          carbs: 2,
          fat: 1.5,
          fiber: 0,
        },
        {
          userId: DEFAULT_USER_ID,
          date: todayStr,
          mealType: 'lunch',
          foodName: 'Chicken Breast (Grilled)',
          servingSize: 150,
          servingUnit: 'g (cooked)',
          servings: 1.2,
          calories: 298,
          protein: 55,
          carbs: 0,
          fat: 6.5,
          fiber: 0,
        },
        {
          userId: DEFAULT_USER_ID,
          date: todayStr,
          mealType: 'lunch',
          foodName: 'Brown Rice (Cooked)',
          servingSize: 150,
          servingUnit: 'g (1 cup)',
          servings: 1,
          calories: 165,
          protein: 3.8,
          carbs: 35,
          fat: 1.4,
          fiber: 2.3,
        },
        {
          userId: DEFAULT_USER_ID,
          date: todayStr,
          mealType: 'lunch',
          foodName: 'Steamed Broccoli',
          servingSize: 100,
          servingUnit: 'g (1 cup)',
          servings: 1.5,
          calories: 52,
          protein: 3.6,
          carbs: 10.8,
          fat: 0.6,
          fiber: 3.9,
        },
      ];

      sampleLogs.forEach((item, index) => {
        this.memoryStore.food_logs.push({
          ...item,
          _id: 'seed_log_' + (index + 1),
          createdAt: new Date().toISOString(),
        });
      });

      this.memoryStore.water_logs.push({
        _id: 'water_today',
        userId: DEFAULT_USER_ID,
        date: todayStr,
        amountMl: 1750,
        updatedAt: new Date().toISOString(),
      });
    }

    this.persistToFile();
  }

  private async tryInitMongo() {
    const uri = process.env.MONGODB_URI;
    if (uri && uri.trim() !== '') {
      await this.connectToMongo(uri.trim());
    } else {
      console.log('No MONGODB_URI provided in environment. Using embedded MongoDB document storage engine.');
    }
  }

  public async connectToMongo(uri: string): Promise<{ success: boolean; message: string }> {
    try {
      if (this.mongoClient) {
        await this.mongoClient.close().catch(() => {});
      }
      this.currentUri = uri;
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
      await client.connect();
      const db = client.db();
      await db.command({ ping: 1 });
      this.mongoClient = client;
      this.mongoDb = db;
      this.isConnectedToMongo = true;
      console.log('Successfully connected to external MongoDB database:', db.databaseName);

      // Sync memory data to Mongo if Mongo collections are empty
      await this.syncToRemoteMongo();

      return { success: true, message: `Connected to MongoDB database: ${db.databaseName}` };
    } catch (err: any) {
      console.warn('Failed to connect to MongoDB URI. Remaining on persistent embedded document store:', err.message);
      this.isConnectedToMongo = false;
      this.mongoClient = null;
      this.mongoDb = null;
      return { success: false, message: err.message || 'Connection failed' };
    }
  }

  private async syncToRemoteMongo() {
    if (!this.mongoDb) return;
    try {
      const logsCount = await this.mongoDb.collection('food_logs').countDocuments();
      if (logsCount === 0 && this.memoryStore.food_logs.length > 0) {
        await this.mongoDb.collection('food_logs').insertMany(this.memoryStore.food_logs as any);
      }

      const goalsCount = await this.mongoDb.collection('nutrition_goals').countDocuments();
      if (goalsCount === 0 && this.memoryStore.nutrition_goals.length > 0) {
        await this.mongoDb.collection('nutrition_goals').insertMany(this.memoryStore.nutrition_goals as any);
      }

      const progressCount = await this.mongoDb.collection('user_progress').countDocuments();
      if (progressCount === 0 && this.memoryStore.user_progress.length > 0) {
        await this.mongoDb.collection('user_progress').insertMany(this.memoryStore.user_progress as any);
      }

      const foodsCount = await this.mongoDb.collection('custom_foods').countDocuments();
      if (foodsCount === 0 && this.memoryStore.custom_foods.length > 0) {
        await this.mongoDb.collection('custom_foods').insertMany(this.memoryStore.custom_foods as any);
      }
    } catch (err) {
      console.error('Error syncing seed data to MongoDB:', err);
    }
  }

  public getStatus() {
    return {
      connected: this.isConnectedToMongo,
      mode: this.isConnectedToMongo ? 'mongodb_atlas' : 'mongodb_embedded',
      databaseName: this.isConnectedToMongo && this.mongoDb ? this.mongoDb.databaseName : 'nutritrack_local_db',
      storageEngine: this.isConnectedToMongo ? 'MongoDB Remote Driver' : 'Embedded JSON Document Store',
      counts: {
        foodLogs: this.memoryStore.food_logs.length,
        progressEntries: this.memoryStore.user_progress.length,
        customFoods: this.memoryStore.custom_foods.length,
        waterLogs: this.memoryStore.water_logs.length,
      },
      hasMongoUriEnv: !!process.env.MONGODB_URI,
    };
  }

  // --- Food Logs Collection ---
  public async getFoodLogs(userId: string = DEFAULT_USER_ID, date?: string): Promise<FoodLogItem[]> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const query: any = { userId };
        if (date) query.date = date;
        const docs = await this.mongoDb.collection('food_logs').find(query).toArray();
        return docs.map((d: any) => ({ ...d, _id: d._id.toString() }));
      } catch (e) {
        console.warn('Mongo read error, reading from local store:', e);
      }
    }
    return this.memoryStore.food_logs.filter((item) => {
      if (item.userId !== userId) return false;
      if (date && item.date !== date) return false;
      return true;
    });
  }

  public async addFoodLog(item: Omit<FoodLogItem, '_id' | 'createdAt'>): Promise<FoodLogItem> {
    const newItem: FoodLogItem = {
      ...item,
      _id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('food_logs').insertOne({ ...newItem } as any);
      } catch (err) {
        console.warn('Failed to insert into Mongo, saving to local store:', err);
      }
    }

    this.memoryStore.food_logs.push(newItem);
    this.persistToFile();
    return newItem;
  }

  public async updateFoodLog(id: string, updates: Partial<FoodLogItem>): Promise<FoodLogItem | null> {
    const index = this.memoryStore.food_logs.findIndex((l) => l._id === id);
    if (index === -1) return null;

    const updated = { ...this.memoryStore.food_logs[index], ...updates };
    this.memoryStore.food_logs[index] = updated;
    this.persistToFile();

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('food_logs').updateOne({ _id: id as any }, { $set: updates });
      } catch (e) {
        console.warn('Mongo update error:', e);
      }
    }

    return updated;
  }

  public async deleteFoodLog(id: string): Promise<boolean> {
    const index = this.memoryStore.food_logs.findIndex((l) => l._id === id);
    if (index === -1) return false;

    this.memoryStore.food_logs.splice(index, 1);
    this.persistToFile();

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('food_logs').deleteOne({ _id: id as any });
      } catch (e) {
        console.warn('Mongo delete error:', e);
      }
    }

    return true;
  }

  public async copyMealsFromYesterday(todayDate: string, userId: string = DEFAULT_USER_ID): Promise<FoodLogItem[]> {
    const targetDate = new Date(todayDate);
    targetDate.setDate(targetDate.getDate() - 1);
    const yesterdayStr = targetDate.toISOString().split('T')[0];

    const yesterdayLogs = await this.getFoodLogs(userId, yesterdayStr);
    const copied: FoodLogItem[] = [];

    for (const log of yesterdayLogs) {
      const added = await this.addFoodLog({
        userId,
        date: todayDate,
        mealType: log.mealType,
        foodName: log.foodName,
        servingSize: log.servingSize,
        servingUnit: log.servingUnit,
        servings: log.servings,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        fiber: log.fiber,
        notes: log.notes ? `Copied from yesterday: ${log.notes}` : undefined,
      });
      copied.push(added);
    }

    return copied;
  }

  // --- Nutrition Goals Collection ---
  public async getGoals(userId: string = DEFAULT_USER_ID): Promise<NutritionGoals> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const doc = await this.mongoDb.collection('nutrition_goals').findOne({ userId });
        if (doc) {
          return { ...(doc as any), _id: doc._id.toString() };
        }
      } catch (e) {
        console.warn('Mongo getGoals error:', e);
      }
    }

    const found = this.memoryStore.nutrition_goals.find((g) => g.userId === userId);
    if (found) return found;

    // Fallback default
    return {
      userId,
      dailyCalories: 2000,
      proteinGrams: 130,
      carbsGrams: 220,
      fatGrams: 65,
      waterMl: 2500,
      startingWeight: 75,
      targetWeight: 70,
      weightUnit: 'kg',
      heightCm: 175,
      age: 28,
      gender: 'female',
      activityLevel: 'moderate',
      dietGoal: 'weight_loss',
      updatedAt: new Date().toISOString(),
    };
  }

  public async updateGoals(userId: string = DEFAULT_USER_ID, goals: Partial<NutritionGoals>): Promise<NutritionGoals> {
    const index = this.memoryStore.nutrition_goals.findIndex((g) => g.userId === userId);
    let updated: NutritionGoals;

    if (index >= 0) {
      updated = {
        ...this.memoryStore.nutrition_goals[index],
        ...goals,
        updatedAt: new Date().toISOString(),
      };
      this.memoryStore.nutrition_goals[index] = updated;
    } else {
      updated = {
        userId,
        dailyCalories: goals.dailyCalories || 2000,
        proteinGrams: goals.proteinGrams || 130,
        carbsGrams: goals.carbsGrams || 220,
        fatGrams: goals.fatGrams || 65,
        waterMl: goals.waterMl || 2500,
        startingWeight: goals.startingWeight || 75,
        targetWeight: goals.targetWeight || 70,
        weightUnit: goals.weightUnit || 'kg',
        heightCm: goals.heightCm || 175,
        age: goals.age || 28,
        gender: goals.gender || 'female',
        activityLevel: goals.activityLevel || 'moderate',
        dietGoal: goals.dietGoal || 'weight_loss',
        updatedAt: new Date().toISOString(),
        ...goals,
      };
      this.memoryStore.nutrition_goals.push(updated);
    }

    this.persistToFile();

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('nutrition_goals').updateOne(
          { userId },
          { $set: updated },
          { upsert: true }
        );
      } catch (e) {
        console.warn('Mongo update goals error:', e);
      }
    }

    return updated;
  }

  // --- User Progress / Weight Tracking Collection ---
  public async getProgress(userId: string = DEFAULT_USER_ID): Promise<UserProgressItem[]> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const docs = await this.mongoDb.collection('user_progress').find({ userId }).sort({ date: 1 }).toArray();
        return docs.map((d: any) => ({ ...d, _id: d._id.toString() }));
      } catch (e) {
        console.warn('Mongo getProgress error:', e);
      }
    }
    return [...this.memoryStore.user_progress.filter((p) => p.userId === userId)].sort((a, b) => a.date.localeCompare(b.date));
  }

  public async addProgress(entry: Omit<UserProgressItem, '_id' | 'createdAt'>): Promise<UserProgressItem> {
    // If an entry for this date already exists, update it, else create new
    const existingIndex = this.memoryStore.user_progress.findIndex(
      (p) => p.userId === entry.userId && p.date === entry.date
    );

    let result: UserProgressItem;
    if (existingIndex >= 0) {
      result = {
        ...this.memoryStore.user_progress[existingIndex],
        ...entry,
      };
      this.memoryStore.user_progress[existingIndex] = result;
    } else {
      result = {
        ...entry,
        _id: 'prog_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      this.memoryStore.user_progress.push(result);
    }

    this.persistToFile();

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('user_progress').updateOne(
          { userId: entry.userId, date: entry.date },
          { $set: result },
          { upsert: true }
        );
      } catch (e) {
        console.warn('Mongo progress update error:', e);
      }
    }

    return result;
  }

  public async deleteProgress(id: string): Promise<boolean> {
    const idx = this.memoryStore.user_progress.findIndex((p) => p._id === id);
    if (idx === -1) return false;

    this.memoryStore.user_progress.splice(idx, 1);
    this.persistToFile();

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('user_progress').deleteOne({ _id: id as any });
      } catch (e) {
        console.warn('Mongo delete progress error:', e);
      }
    }

    return true;
  }

  // --- Water Logs Collection ---
  public async getWater(date: string, userId: string = DEFAULT_USER_ID): Promise<number> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const doc = await this.mongoDb.collection('water_logs').findOne({ userId, date });
        if (doc) return (doc as any).amountMl || 0;
      } catch (e) {
        console.warn('Mongo getWater error:', e);
      }
    }
    const item = this.memoryStore.water_logs.find((w) => w.userId === userId && w.date === date);
    return item ? item.amountMl : 0;
  }

  public async setWater(date: string, amountMl: number, userId: string = DEFAULT_USER_ID): Promise<number> {
    const safeAmount = Math.max(0, amountMl);
    const existingIndex = this.memoryStore.water_logs.findIndex((w) => w.userId === userId && w.date === date);

    if (existingIndex >= 0) {
      this.memoryStore.water_logs[existingIndex].amountMl = safeAmount;
      this.memoryStore.water_logs[existingIndex].updatedAt = new Date().toISOString();
    } else {
      this.memoryStore.water_logs.push({
        _id: 'water_' + Date.now(),
        userId,
        date,
        amountMl: safeAmount,
        updatedAt: new Date().toISOString(),
      });
    }

    this.persistToFile();

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('water_logs').updateOne(
          { userId, date },
          { $set: { amountMl: safeAmount, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
      } catch (e) {
        console.warn('Mongo setWater error:', e);
      }
    }

    return safeAmount;
  }

  // --- Foods Catalog & Custom Food Collection ---
  public async searchFoods(query: string = '', category?: string): Promise<FoodItemCatalog[]> {
    let list: FoodItemCatalog[] = [];

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const filter: any = {};
        if (query) {
          filter.name = { $regex: query, $options: 'i' };
        }
        if (category && category !== 'All') {
          filter.category = category;
        }
        const docs = await this.mongoDb.collection('custom_foods').find(filter).toArray();
        if (docs.length > 0) {
          list = docs.map((d: any) => ({ ...d, _id: d._id.toString() }));
        }
      } catch (e) {
        console.warn('Mongo searchFoods error:', e);
      }
    }

    if (list.length === 0) {
      list = [...this.memoryStore.custom_foods];
      if (category && category !== 'All') {
        list = list.filter((f) => f.category === category);
      }
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        list = list.filter((f) => f.name.toLowerCase().includes(q));
      }
    }

    return list;
  }

  public async addCustomFood(food: Omit<FoodItemCatalog, '_id' | 'createdAt'>): Promise<FoodItemCatalog> {
    const newItem: FoodItemCatalog = {
      ...food,
      _id: 'food_' + Date.now(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    this.memoryStore.custom_foods.push(newItem);
    this.persistToFile();

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('custom_foods').insertOne({ ...newItem } as any);
      } catch (e) {
        console.warn('Mongo addCustomFood error:', e);
      }
    }

    return newItem;
  }

  // Export full JSON database for backup
  public exportAllData() {
    return {
      exportedAt: new Date().toISOString(),
      mode: this.isConnectedToMongo ? 'mongodb_atlas' : 'embedded_json',
      data: this.memoryStore,
    };
  }
}

export const dbService = new DatabaseService();
