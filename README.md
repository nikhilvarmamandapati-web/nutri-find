# NutriTrack - Diet & Calorie Logger

A full-stack diet and calorie logging application with daily macronutrient balance, hydration tracking, bodyweight progress analytics, and MongoDB document storage.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB (supports external MongoDB Atlas / local MongoDB instances, with an automatic persistent embedded JSON document store fallback)
- **AI Integration**: Google GenAI SDK (`@google/genai`) for natural language meal parsing

---

## Features

- **Daily Calorie & Macro Dashboard**: Real-time caloric balance, remaining budget, and gram breakdowns for Protein, Carbohydrates, Fats, and Dietary Fiber.
- **Categorized Meal Logger**: Log Breakfast, Lunch, Dinner, and Snacks with custom portion sizes, inline edits, and one-click "Copy Yesterday's Meals".
- **Multi-Source Food Entry**:
  - Curated database of verified whole foods and staples.
  - Natural language AI meal breakdown (e.g., *"2 scrambled eggs with toast and avocado"*).
  - Quick calorie add for dining out.
  - Custom food creator with MongoDB persistence.
- **Hydration Tracker**: Real-time water intake logger (+250ml glass, +500ml bottle).
- **Weight & Body Progress**: Daily weigh-in logger with body fat %, interactive SVG trend chart, target threshold line, and BMI calculations.
- **Metabolic Calculator & Target Settings**: Built-in Mifflin-St Jeor BMR/TDEE calculator and customizable macronutrient goals.
- **MongoDB Data Explorer**: Live inspection of documents in `food_logs`, `user_progress`, `nutrition_goals`, and `custom_foods` collections, plus full JSON database export.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn`
- *(Optional)* A MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.

---

## Getting Started

### 1. Clone or Open the Project Directory

```bash
cd /path/to/nutritrack
```

### 2. Install Dependencies

Install all required frontend and backend packages:

```bash
npm install
```

### 3. Environment Variables Configuration

Create a `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Add your optional configuration:

```env
# Optional: MongoDB connection string (e.g., MongoDB Atlas or local MongoDB)
# If left blank, NutriTrack seamlessly uses its built-in persistent document store.
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/diet_tracker?retryWrites=true&w=majority"

# Optional: Gemini API Key for AI natural language meal estimation
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Port number (defaults to 3000)
PORT=3000
```

> **Note on MongoDB**: If you don't supply a `MONGODB_URI`, the app will automatically start and persist all your data locally in `./data/mongodb_store.json` using the same document collection semantics. You can also connect to MongoDB Atlas at runtime via the in-app **MongoDB Data** tab.

---

## Running the Application

### Development Mode

To start the full-stack server (Express backend + Vite development server):

```bash
npm run dev
```

The application will be running at:
[http://localhost:3000](http://localhost:3000)

### Production Build & Run

To build the client bundle and run the production server:

```bash
# Build the Vite React frontend
npm run build

# Start the Node.js production server
npm start
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware in development mode on port 3000 |
| `npm run build` | Compiles and builds the production React assets into `dist/` |
| `npm start` | Runs the full-stack server using `tsx server.ts` |
| `npm run lint` | Runs TypeScript type checking without emitting files |
| `npm run clean` | Cleans build artifacts |

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Current MongoDB connection status and collection document counts |
| `POST` | `/api/mongodb/connect` | Test or switch to a new MongoDB URI at runtime |
| `GET` | `/api/logs?date=YYYY-MM-DD` | Retrieve logged meals for a specific date |
| `POST` | `/api/logs` | Log a new food item |
| `PUT` | `/api/logs/:id` | Update an existing food log entry |
| `DELETE` | `/api/logs/:id` | Remove a food log entry |
| `POST` | `/api/logs/copy-yesterday` | Duplicate yesterday's meals to the target date |
| `GET` | `/api/water?date=YYYY-MM-DD` | Retrieve hydration intake for a date |
| `POST` | `/api/water` | Update hydration intake |
| `GET` | `/api/progress` | Fetch historical weight and body metric entries |
| `POST` | `/api/progress` | Log a new weigh-in entry |
| `DELETE` | `/api/progress/:id` | Delete a weigh-in entry |
| `GET` | `/api/goals` | Retrieve user target goals and biometric profile |
| `PUT` | `/api/goals` | Update daily targets and metabolic metrics |
| `GET` | `/api/foods/search` | Search foods catalog (custom + verified base foods) |
| `POST` | `/api/foods` | Save a new custom food item to MongoDB |
| `POST` | `/api/ai/estimate-nutrition` | AI natural language nutritional parsing |
| `GET` | `/api/export` | Download full JSON backup of all collections |
