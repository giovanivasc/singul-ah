import express from 'express';
import cors from 'cors';
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

const allowedOrigins = process.env.APP_URL
  ? [process.env.APP_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const maskKey = (k?: string) => {
  if (!k) return '✗ AUSENTE';
  if (k.length < 8) return '✓ (muito curta — verificar)';
  return `✓ (${k.slice(0, 4)}…${k.slice(-4)}, len=${k.length})`;
};

if (!GEMINI_API_KEY) {
  console.warn('[Singul-AH] AVISO: GEMINI_API_KEY não encontrada. Defina-a em .env.local na raiz do projeto e reinicie o servidor.');
} else {
  console.log(`[Singul-AH] GEMINI_API_KEY: ${maskKey(GEMINI_API_KEY)}`);
}

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

// Health-check simples (sem vazar chave). Usado pelo front para detectar
// rapidamente se o gateway de IA está de pé e pronto.
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    aiReady: Boolean(GEMINI_API_KEY),
    model: 'gemini-1.5-flash',
    ts: new Date().toISOString()
  });
});

app.post('/api/ai', async (req, res) => {
  const { prompt, model: modelName = 'gemini-1.5-flash' } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY não configurada no servidor. Adicione-a em .env.local e reinicie `npm run dev`.'
    });
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
