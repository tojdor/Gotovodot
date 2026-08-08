import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  recognizeIngredientsFromPhoto,
  generateRecipesList,
  analyzeLiveCookingFrame,
  generateSpeechAudio,
} from './src/server/geminiService.ts';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/live-ws' });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS / Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Gotovo AI Kitchen Assistant', timestamp: new Date().toISOString() });
});

// 1. Multimodal ingredient recognition by photo
app.post('/api/recognize-ingredients', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 parameter is required' });
    }
    const result = await recognizeIngredientsFromPhoto(imageBase64, mimeType || 'image/jpeg');
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/recognize-ingredients:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze photo' });
  }
});

// 2. Generate 2-4 recipes list
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const {
      categories = ['Завтраки'],
      manualIngredients = [],
      photoIngredients = [],
      maxTimeMinutes = 30,
      maxCalories = 600,
      dietaryPreferences = [],
      userNotes = '',
    } = req.body;

    const result = await generateRecipesList({
      categories,
      manualIngredients,
      photoIngredients,
      maxTimeMinutes: Number(maxTimeMinutes) || 30,
      maxCalories: Number(maxCalories) || 600,
      dietaryPreferences,
      userNotes,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/generate-recipes:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate recipes' });
  }
});

// 3. Live cooking video guidance endpoint
app.post('/api/live-guidance', async (req, res) => {
  try {
    const {
      frameBase64,
      userQuery,
      currentRecipeTitle,
      currentStepIndex,
      currentStepInstruction,
    } = req.body;

    const result = await analyzeLiveCookingFrame({
      frameBase64,
      userQuery,
      currentRecipeTitle,
      currentStepIndex: Number(currentStepIndex) || 0,
      currentStepInstruction,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/live-guidance:', error);
    res.status(500).json({ error: error?.message || 'Failed to get live guidance' });
  }
});

// 4. TTS speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await generateSpeechAudio(text, voice);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate speech' });
  }
});

// Real-time WebSocket connection for Live Cooking Companion
wss.on('connection', (ws: WebSocket) => {
  console.log('[Gotovo Live WS] Client connected to live cooking session');

  ws.on('message', async (data: string | Buffer) => {
    try {
      const payload = JSON.parse(data.toString());
      if (payload.type === 'frame_query') {
        const guidance = await analyzeLiveCookingFrame({
          frameBase64: payload.frameBase64,
          userQuery: payload.userQuery,
          currentRecipeTitle: payload.recipeTitle,
          currentStepIndex: payload.stepIndex,
          currentStepInstruction: payload.stepInstruction,
        });

        ws.send(JSON.stringify({
          type: 'guidance_response',
          guidance,
          timestamp: Date.now(),
        }));
      }
    } catch (err) {
      console.error('[Gotovo Live WS] Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[Gotovo Live WS] Client disconnected');
  });
});

export { app, server };
