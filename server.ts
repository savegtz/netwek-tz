import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'node:dns';
import { GoogleGenAI } from '@google/genai';

// Ensure IPv4 is resolved first to prevent IPv6 blackhole timeouts in container environments
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Server-side AI endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;

    // Quick health-check / ping optimization
    const lastMsg = (messages?.[messages.length - 1]?.content || '').trim().toLowerCase();
    if (lastMsg === 'ping' && messages?.length === 1) {
      res.json({ text: 'pong', status: 'ready' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({
        text: 'Habari! Zenia AI iko tayari kukusaidia. Karibu uulize swali au uombe ushauri wowote.',
      });
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
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are the intelligent assistant inside Zenia, an all-in-one superapp for connecting, creating, discovering, and earning.',
        },
      });
      generatedText = response.text || '';
    } catch (primaryErr: any) {
      console.warn('Primary model note, using fallback:', primaryErr?.message || primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are the intelligent assistant inside Zenia, an all-in-one superapp for connecting, creating, discovering, and earning.',
        },
      });
      generatedText = fallbackResponse.text || '';
    }

    res.json({ text: generatedText });
  } catch (error: any) {
    console.warn('Express Gemini API graceful fallback:', error?.message || error);
    res.json({
      text: 'Habari! Ninaweza kukusaidia kuandika jumbe, kutafsiri lugha, kueleza kuhusu bidhaa, au kutoa maelezo ya Zenia Superapp.',
    });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zenia server running on port ${PORT}`);
});
