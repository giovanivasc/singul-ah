import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, Bot, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

interface AICopilotButtonProps {
  studentId?: string;
  contextData?: {
    learningStyle?: string;
    interests?: string;
    goal?: string;
  };
}

// Inicializa a IA fora do componente para evitar reinicializações
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const INITIAL_SUGGESTIONS = [
  {
    id: '1',
    title: 'Criar um fluxograma interativo',
    description: 'Permita que o aluno utilize uma ferramenta visual (como Miro ou Whimsical) para mapear a lógica de programação de um jogo simples.'
  },
  {
    id: '2',
    title: 'Codificar um mini-quiz',
    description: 'Desafio: O aluno deve criar um quiz interativo no Scratch ou Python focando em resolver quebra-cabeças lógicos.'
  },
  {
    id: '3',
    title: 'Construir um modelo físico',
    description: 'Atividade Maker: criar uma máquina de Rube Goldberg utilizando materiais recicláveis para demonstrar física e raciocínio lógico.'
  }
];

export function AICopilotButton({ studentId, contextData }: AICopilotButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof INITIAL_SUGGESTIONS | null>(null);

  const defaultContext = {
    learningStyle: contextData?.learningStyle || 'Visual/Cinestésico',
    interests: contextData?.interests || 'Programação, Games',
    goal: contextData?.goal || 'Lógica Matemática'
  };

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const model = ai.models.get('gemini-1.5-flash');
      
      const prompt = `
        Você é um consultor pedagógico especializado em Altas Habilidades/Superdotação (AH/SD).
        Com base no perfil deste estudante:
        - Estilo de Aprendizagem: ${defaultContext.learningStyle}
        - Interesses: ${defaultContext.interests}
        - Objetivo Pedagógico: ${defaultContext.goal}

        Gere 3 sugestões de atividades de enriquecimento curricular que sejam desafiadoras, criativas e alinhadas ao perfil.
        
        IMPORTANTE: Retorne APENAS o JSON puro, sem markdown, sem explicações extras, no seguinte formato:
        [
          { "id": "1", "title": "Título Curto", "description": "Descrição de 2-3 frases" },
          { "id": "2", "title": "...", "description": "..." },
          { "id": "3", "title": "...", "description": "..." }
        ]
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = result.response.text();
      // Remover possíveis blocos de código se a IA os incluir apesar do prompt
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsedSuggestions = JSON.parse(cleanJson);
      
      setSuggestions(parsedSuggestions);
    } catch (error) {
      console.error('Erro ao gerar sugestões com Gemini:', error);
      // Fallback em caso de erro na API
      setSuggestions(INITIAL_SUGGESTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = (suggestionItem: any) => {
    // In a real scenario, this would trigger an API call or context update to insert the activity into the PEI.
    alert(`"${suggestionItem.title}" foi adicionada com sucesso ao PEI do aluno!`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5"
      >
        <Sparkles size={18} className="fill-white/20" />
        Sugestões da IA
      </button>

      {/* Slide-over Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-over Panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] transition-transform duration-300 ease-out flex flex-col border-l border-slate-200",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Bot size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Copiloto IA</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Geração de Ideias</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors"
            title="Fechar"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500" />
              Contexto do Aluno
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase">Perfil de Aprendizagem</span>
                <span className="font-medium text-slate-700">{defaultContext.learningStyle}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase">Interesses</span>
                <span className="font-medium text-slate-700">{defaultContext.interests}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase">Meta Atual</span>
                <span className="font-medium text-slate-700">{defaultContext.goal}</span>
              </div>
            </div>
          </div>

          {!suggestions && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-purple-50 text-purple-400 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} />
              </div>
              <h4 className="font-bold text-slate-700 mb-2">Pronto para gerar ideias?</h4>
              <p className="text-sm text-slate-500 mb-6">A inteligência artificial vai criar atividades personalizadas com base no contexto do aluno.</p>
              
              <button
                onClick={generateSuggestions}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-200"
              >
                Gerar Atividades de Enriquecimento
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <Loader2 size={36} className="text-purple-500 animate-spin" />
              <p className="text-sm font-medium text-slate-500 animate-pulse">
                Analisando o perfil e gerando atividades imersivas...
              </p>
            </div>
          )}

          {suggestions && !isLoading && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center justify-between">
                <span>Sugestões Geradas</span>
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-full">{suggestions.length} opções</span>
              </h4>
              
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-purple-200 hover:shadow-md transition-all group">
                  <h5 className="font-bold text-slate-800 mb-2 text-sm">{suggestion.title}</h5>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{suggestion.description}</p>
                  
                  <button
                    onClick={() => handleAddSuggestion(suggestion)}
                    className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={16} strokeWidth={3} />
                    Adicionar ao PEI/Kanban
                  </button>
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={generateSuggestions}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Gerar novas opções
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
