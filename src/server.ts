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

// ---------------------------------------------------------------------------
// Configuração de provedores de IA
//
// AI_PROVIDER (env):
//   'auto'   — tenta Ollama local primeiro; se indisponível, usa Gemini (padrão)
//   'ollama' — somente Ollama (sem fallback para Gemini — máxima privacidade LGPD)
//   'gemini' — somente Gemini (comportamento original)
//
// OLLAMA_BASE_URL — URL do servidor Ollama (padrão: http://localhost:11434)
// OLLAMA_MODEL    — modelo a usar no Ollama (padrão: gemma3:4b)
// GEMINI_API_KEY  — obrigatório apenas quando AI_PROVIDER = 'gemini' ou 'auto'
// ---------------------------------------------------------------------------

const GEMINI_API_KEY  = process.env.GEMINI_API_KEY;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    ?? 'gemma3:4b';
const AI_PROVIDER     = (process.env.AI_PROVIDER   ?? 'auto') as 'auto' | 'ollama' | 'gemini';

const maskKey = (k?: string) => {
  if (!k) return '✗ AUSENTE';
  if (k.length < 8) return '✓ (muito curta — verificar)';
  return `✓ (${k.slice(0, 4)}…${k.slice(-4)}, len=${k.length})`;
};

console.log(`[Singul-AH] AI_PROVIDER: ${AI_PROVIDER}`);
console.log(`[Singul-AH] OLLAMA: ${OLLAMA_BASE_URL} / modelo: ${OLLAMA_MODEL}`);
if (AI_PROVIDER !== 'ollama') {
  if (!GEMINI_API_KEY) {
    console.warn('[Singul-AH] AVISO: GEMINI_API_KEY não encontrada. ' +
      'Se AI_PROVIDER=ollama, isso é esperado. Caso contrário, defina-a em .env.local.');
  } else {
    console.log(`[Singul-AH] GEMINI_API_KEY: ${maskKey(GEMINI_API_KEY)}`);
  }
}

const geminiClient = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

// ---------------------------------------------------------------------------
// Verificar disponibilidade do Ollama
// ---------------------------------------------------------------------------
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const resp = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(2_000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Inferência via Ollama (100% local — dados nunca saem da máquina)
// Base legal: LGPD Art. 13 §4º — sem subprocessador externo, sem transferência
// internacional, sem risco de uso para treino de modelos.
// ---------------------------------------------------------------------------
async function callOllama(prompt: string): Promise<string> {
  const resp = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
    signal: AbortSignal.timeout(120_000), // 2 min — modelos locais são mais lentos
  });
  if (!resp.ok) {
    throw new Error(`Ollama retornou ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json() as { response: string };
  return data.response ?? '';
}

// ---------------------------------------------------------------------------
// Inferência via Gemini (API Google — dados trafegam para servidores nos EUA)
// Salvaguarda: pseudonimização obrigatória antes desta chamada (pseudonymize.ts)
// ---------------------------------------------------------------------------
async function callGemini(prompt: string, modelName: string): Promise<string> {
  if (!geminiClient) throw new Error('GEMINI_API_KEY não configurada no servidor.');
  const result = await geminiClient.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  // Compatibilidade entre versões do SDK @google/genai
  const text = (result as any).text
    ? (result as any).text()
    : (result as any).response?.text() ?? '';
  return text;
}

// ---------------------------------------------------------------------------
// Roteador principal de inferência
// ---------------------------------------------------------------------------
async function callAI(
  prompt: string,
  geminiModel: string,
): Promise<{ text: string; provider: 'ollama' | 'gemini' }> {
  if (AI_PROVIDER === 'ollama') {
    return { text: await callOllama(prompt), provider: 'ollama' };
  }

  if (AI_PROVIDER === 'gemini') {
    return { text: await callGemini(prompt, geminiModel), provider: 'gemini' };
  }

  // AI_PROVIDER === 'auto': tenta Ollama, cai no Gemini se indisponível
  const ollamaUp = await isOllamaAvailable();
  if (ollamaUp) {
    try {
      const text = await callOllama(prompt);
      return { text, provider: 'ollama' };
    } catch (err) {
      console.warn('[Singul-AH] Ollama falhou, usando Gemini como fallback:', (err as Error).message);
    }
  }

  return { text: await callGemini(prompt, geminiModel), provider: 'gemini' };
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

// Health-check: informa qual provedor está ativo sem vazar credenciais.
app.get('/api/health', async (_req, res) => {
  const ollamaAvailable = AI_PROVIDER !== 'gemini' ? await isOllamaAvailable() : false;
  const activeProvider =
    AI_PROVIDER === 'ollama' ? 'ollama' :
    AI_PROVIDER === 'gemini' ? 'gemini' :
    ollamaAvailable ? 'ollama' : 'gemini';

  res.json({
    ok: true,
    aiProvider: AI_PROVIDER,
    activeProvider,
    ollamaAvailable,
    ollamaModel: OLLAMA_MODEL,
    geminiReady: Boolean(GEMINI_API_KEY),
    geminiModel: 'gemini-1.5-flash',
    ts: new Date().toISOString(),
  });
});

app.post('/api/ai', async (req, res) => {
  const { prompt, model: modelName = 'gemini-1.5-flash' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Campo "prompt" ausente ou inválido.' });
  }

  try {
    const { text, provider } = await callAI(prompt, modelName);
    res.json({ result: text, provider });
  } catch (error: any) {
    console.error('[Singul-AH] Erro na inferência de IA:', error?.message ?? error);

    // Mensagens de erro específicas e acionáveis
    if ((error?.message ?? '').includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error:
          'Nenhum provedor de IA disponível. ' +
          'Para uso local (gratuito): instale Ollama (`brew install ollama`) e defina AI_PROVIDER=ollama em .env.local. ' +
          'Para Gemini: defina GEMINI_API_KEY em .env.local.',
      });
    }

    res.status(500).json({ error: error?.message || 'Erro interno no servidor de IA' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[Servidor Singul-AH] Gateway de IA rodando em http://localhost:${PORT}`);
});
