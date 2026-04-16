import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Fallback para .env padrão

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('AVISO: GEMINI_API_KEY não encontrada nas variáveis de ambiente.');
}

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

app.post('/api/ai', async (req, res) => {
  const { prompt, model: modelName = 'gemini-1.5-flash' } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
  }

  try {
    const result = await client.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    // Na SDK @google/genai, o resultado é o GenerateContentResponse que contém os candidates
    const text = (result as any).text ? (result as any).text() : (result as any).response?.text() || '';
    
    res.json({ result: text });
  } catch (error: any) {
    console.error('Erro na API da Gemini no Servidor:', error);
    res.status(500).json({ error: error.message || 'Erro interno no servidor de IA' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[Servidor Singul-AH] Gateway de IA rodando em http://localhost:${PORT}`);
});
