import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { dbService } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({});
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// ---------------- API ROUTES ----------------

// System & MongoDB Status
app.get('/api/status', (req: Request, res: Response) => {
  try {
    const status = dbService.getStatus();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Switch or test MongoDB connection string
app.post('/api/mongodb/connect', async (req: Request, res: Response) => {
  try {
    const { uri } = req.body;
    if (!uri || typeof uri !== 'string') {
      res.status(400).json({ success: false, error: 'Valid MongoDB URI string is required' });
      return;
    }
    const result = await dbService.connectToMongo(uri);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Food Logs
app.get('/api/logs', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const userId = (req.query.userId as string) || 'user_default';
    const logs = await dbService.getFoodLogs(userId, date);
    res.json({ success: true, date, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/logs', async (req: Request, res: Response) => {
  try {
    const {
      userId = 'user_default',
      date = new Date().toISOString().split('T')[0],
      mealType,
      foodName,
      servingSize = 1,
      servingUnit = 'serving',
      servings = 1,
      calories = 0,
      protein = 0,
      carbs = 0,
      fat = 0,
      fiber = 0,
      notes,
    } = req.body;

    if (!mealType || !foodName) {
      res.status(400).json({ success: false, error: 'mealType and foodName are required' });
      return;
    }

    const item = await dbService.addFoodLog({
      userId,
      date,
      mealType,
      foodName,
      servingSize: Number(servingSize),
      servingUnit: String(servingUnit),
      servings: Number(servings),
      calories: Math.round(Number(calories) * Number(servings)),
      protein: Math.round(Number(protein) * Number(servings) * 10) / 10,
      carbs: Math.round(Number(carbs) * Number(servings) * 10) / 10,
      fat: Math.round(Number(fat) * Number(servings) * 10) / 10,
      fiber: Math.round(Number(fiber || 0) * Number(servings) * 10) / 10,
      notes,
    });

    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/logs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await dbService.updateFoodLog(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Log entry not found' });
      return;
    }
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/logs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await dbService.deleteFoodLog(id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Log entry not found' });
      return;
    }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/logs/copy-yesterday', async (req: Request, res: Response) => {
  try {
    const { todayDate = new Date().toISOString().split('T')[0], userId = 'user_default' } = req.body;
    const copied = await dbService.copyMealsFromYesterday(todayDate, userId);
    res.json({ success: true, count: copied.length, copied });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Water Logs
app.get('/api/water', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const userId = (req.query.userId as string) || 'user_default';
    const amountMl = await dbService.getWater(date, userId);
    res.json({ success: true, date, amountMl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/water', async (req: Request, res: Response) => {
  try {
    const { date = new Date().toISOString().split('T')[0], amountMl, userId = 'user_default' } = req.body;
    if (typeof amountMl !== 'number') {
      res.status(400).json({ success: false, error: 'amountMl must be a number' });
      return;
    }
    const updated = await dbService.setWater(date, amountMl, userId);
    res.json({ success: true, date, amountMl: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User Nutrition Goals
app.get('/api/goals', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user_default';
    const goals = await dbService.getGoals(userId);
    res.json({ success: true, goals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/goals', async (req: Request, res: Response) => {
  try {
    const userId = (req.body.userId as string) || 'user_default';
    const updated = await dbService.updateGoals(userId, req.body);
    res.json({ success: true, goals: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User Weight & Progress Tracking
app.get('/api/progress', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user_default';
    const history = await dbService.getProgress(userId);
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/progress', async (req: Request, res: Response) => {
  try {
    const {
      userId = 'user_default',
      date = new Date().toISOString().split('T')[0],
      weight,
      unit = 'kg',
      bodyFat,
      notes,
    } = req.body;

    if (!weight || isNaN(Number(weight))) {
      res.status(400).json({ success: false, error: 'Valid weight number is required' });
      return;
    }

    const entry = await dbService.addProgress({
      userId,
      date,
      weight: Number(weight),
      unit: unit === 'lbs' ? 'lbs' : 'kg',
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      notes,
    });

    res.status(201).json({ success: true, entry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/progress/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await dbService.deleteProgress(id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Progress entry not found' });
      return;
    }
    res.json({ success: true, message: 'Deleted progress entry' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Foods Catalog Search & Custom Food Insertion
app.get('/api/foods/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const category = (req.query.category as string) || undefined;
    const foods = await dbService.searchFoods(q, category);
    res.json({ success: true, foods });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/foods', async (req: Request, res: Response) => {
  try {
    const { name, category = 'Prepared', servingSize = 100, servingUnit = 'g', calories, protein = 0, carbs = 0, fat = 0, fiber = 0 } = req.body;
    if (!name || calories === undefined) {
      res.status(400).json({ success: false, error: 'Name and calories are required' });
      return;
    }

    const created = await dbService.addCustomFood({
      name: String(name).trim(),
      category: category as any,
      servingSize: Number(servingSize),
      servingUnit: String(servingUnit),
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      fiber: Number(fiber),
    });

    res.status(201).json({ success: true, food: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Nutrition Estimator (Natural Language Meal Breakdown)
app.post('/api/ai/estimate-nutrition', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ success: false, error: 'Food description query is required' });
      return;
    }

    // Try Gemini if available
    if (aiClient) {
      try {
        const prompt = `You are a certified sports nutritionist and biochemical nutrition database.
Estimate accurate nutritional values for this meal or food description: "${query}".
Return ONLY a valid JSON object matching this exact TypeScript structure without any Markdown wrappers or backticks:
{
  "foodName": "Concise standard food or meal title",
  "servingSize": 1,
  "servingUnit": "plate/serving/item",
  "calories": 450,
  "protein": 32,
  "carbs": 40,
  "fat": 15,
  "fiber": 6,
  "confidence": "high",
  "notes": "Short breakdown of components"
}`;

        const geminiRes = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = geminiRes.text?.trim() || '';
        const cleaned = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleaned);

        res.json({ success: true, source: 'gemini', data: parsed });
        return;
      } catch (aiErr) {
        console.warn('Gemini estimation failed, using heuristic parser:', aiErr);
      }
    }

    // Heuristic Smart Fallback if Gemini is not configured or throws
    const lower = query.toLowerCase();
    let calories = 300;
    let protein = 15;
    let carbs = 30;
    let fat = 12;
    let fiber = 4;

    if (lower.includes('salad') || lower.includes('lettuce') || lower.includes('spinach')) {
      calories = 220; protein = 8; carbs = 14; fat = 15; fiber = 5;
    }
    if (lower.includes('chicken') || lower.includes('turkey') || lower.includes('steak') || lower.includes('beef')) {
      calories += 220; protein += 32; fat += 8;
    }
    if (lower.includes('egg')) {
      calories += 140; protein += 12; fat += 10;
    }
    if (lower.includes('rice') || lower.includes('pasta') || lower.includes('bread') || lower.includes('oat')) {
      calories += 180; carbs += 38; protein += 4;
    }
    if (lower.includes('protein shake') || lower.includes('whey') || lower.includes('shake')) {
      calories = 180; protein = 30; carbs = 6; fat = 2; fiber = 1;
    }
    if (lower.includes('pizza') || lower.includes('burger')) {
      calories = 650; protein = 28; carbs = 60; fat = 32; fiber = 3;
    }

    res.json({
      success: true,
      source: 'smart_heuristic',
      data: {
        foodName: query.trim(),
        servingSize: 1,
        servingUnit: 'portion',
        calories,
        protein,
        carbs,
        fat,
        fiber,
        confidence: 'estimated',
        notes: 'Estimated based on standard nutritional density profiles',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full export
app.get('/api/export', (req: Request, res: Response) => {
  try {
    const backup = dbService.exportAllData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="nutritrack_mongodb_backup.json"');
    res.send(JSON.stringify(backup, null, 2));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- VITE / FRONTEND SERVING ----------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`NutriTrack Backend & App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
