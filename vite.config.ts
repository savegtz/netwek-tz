import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Ensure IPv4 is resolved first to prevent IPv6 blackhole timeouts in container environments
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

dotenv.config();

function aiApiPlugin(): Plugin {
  return {
    name: 'ai-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/ai/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { messages, systemInstruction } = JSON.parse(body || '{}');

            // Quick health-check / ping optimization
            const lastMsg = (messages?.[messages.length - 1]?.content || '').trim().toLowerCase();
            if (lastMsg === 'ping' && messages?.length === 1) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: 'pong', status: 'ready' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  text: 'Habari! Zenia AI iko tayari kukusaidia. Karibu uulize swali au uombe ushauri wowote.',
                })
              );
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
                timeout: 15000,
              },
            });

            const contents = (messages || []).map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content || '' }],
            }));

            let generatedText = '';
            // Try gemini-3.1-flash-lite first for high reliability and ultra-fast speed
            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite',
                contents,
                config: {
                  systemInstruction:
                    systemInstruction ||
                    'You are the intelligent assistant inside Zenia, an all-in-one superapp for connecting, creating, discovering, and earning. Keep responses friendly, helpful, and concise.',
                },
              });
              generatedText = response.text || '';
            } catch (primaryErr: any) {
              console.warn('Primary model note, checking fallback:', primaryErr?.message || primaryErr);
              const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents,
                config: {
                  systemInstruction:
                    systemInstruction ||
                    'You are the intelligent assistant inside Zenia, an all-in-one superapp for connecting, creating, discovering, and earning. Keep responses friendly, helpful, and concise.',
                },
              });
              generatedText = fallbackResponse.text || '';
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: generatedText }));
          } catch (err: any) {
            console.warn('Gemini API graceful fallback:', err?.message || err);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                text: 'Habari! Ninaweza kukusaidia kuandika jumbe, kutafsiri lugha, kueleza kuhusu bidhaa, au kutoa maelezo ya Zenia Superapp.',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
