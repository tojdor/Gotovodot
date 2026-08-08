import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import {
  recognizeIngredientsFromPhoto,
  generateRecipesList,
  analyzeLiveCookingFrame,
  generateSpeechAudio,
} from './src/server/geminiService.ts';

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        let bodyBuffer = '';
        req.on('data', (chunk) => {
          bodyBuffer += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          let body: any = {};
          if (bodyBuffer) {
            try {
              body = JSON.parse(bodyBuffer);
            } catch (e) {
              body = {};
            }
          }

          try {
            if (req.url === '/api/health') {
              res.statusCode = 200;
              return res.end(JSON.stringify({ status: 'ok', service: 'Gotovo AI Kitchen Assistant' }));
            }

            if (req.url === '/api/recognize-ingredients' && req.method === 'POST') {
              const { imageBase64, mimeType } = body;
              if (!imageBase64) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'imageBase64 is required' }));
              }
              const result = await recognizeIngredientsFromPhoto(imageBase64, mimeType || 'image/jpeg');
              res.statusCode = 200;
              return res.end(JSON.stringify(result));
            }

            if (req.url === '/api/generate-recipes' && req.method === 'POST') {
              const {
                categories = ['Завтраки'],
                manualIngredients = [],
                photoIngredients = [],
                maxTimeMinutes = 30,
                maxCalories = 600,
                dietaryPreferences = [],
                userNotes = '',
              } = body;

              const result = await generateRecipesList({
                categories,
                manualIngredients,
                photoIngredients,
                maxTimeMinutes: Number(maxTimeMinutes) || 30,
                maxCalories: Number(maxCalories) || 600,
                dietaryPreferences,
                userNotes,
              });

              res.statusCode = 200;
              return res.end(JSON.stringify(result));
            }

            if (req.url === '/api/live-guidance' && req.method === 'POST') {
              const {
                frameBase64,
                userQuery,
                currentRecipeTitle,
                currentStepIndex,
                currentStepInstruction,
              } = body;

              const result = await analyzeLiveCookingFrame({
                frameBase64,
                userQuery,
                currentRecipeTitle,
                currentStepIndex: Number(currentStepIndex) || 0,
                currentStepInstruction,
              });

              res.statusCode = 200;
              return res.end(JSON.stringify(result));
            }

            if (req.url === '/api/tts' && req.method === 'POST') {
              const { text, voice = 'kore' } = body;
              const result = await generateSpeechAudio(text || '', voice);
              res.statusCode = 200;
              return res.end(JSON.stringify(result));
            }

            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'API endpoint not found' }));
          } catch (err: any) {
            console.error('API Error:', err);
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err?.message || 'Server Internal Error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
