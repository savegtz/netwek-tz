import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({ text: 'GEMINI_API_KEY is not configured yet in environment.' });
      return;
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are the intelligent assistant inside Zenia, an all-in-one superapp for connecting, creating, discovering, and earning.',
      },
    });
    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Express Gemini API error:', error);
    res.status(500).json({ error: error?.message || 'Server AI error' });
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
