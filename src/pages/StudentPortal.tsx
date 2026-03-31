import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectKanban } from '../components/ProjectKanban';
import { ClipboardCheck, Sparkles } from 'lucide-react';

export default function StudentPortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-8 bg-slate-50">
      <div className="max-w-[1400px] mx-auto space-y-8 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-black mb-4 uppercase tracking-widest">
              <Sparkles size={16} />
              <span>Espaço de Autodesenvolvimento</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight">
              Bem-vindo(a) ao seu <span className="text-primary">QG de Projetos!</span>
            </h1>
            <p className="text-slate-500 mt-4 text-base font-medium max-w-2xl">
              Este é o seu espaço projetado para explorar, treinar habilidades e construir ideias incríveis no seu próprio ritmo, seguindo a jornada da Tríade de Renzulli.
            </p>
          </div>
        </header>
        
        <main>
          <ProjectKanban />
        </main>
      </div>

      <button
        onClick={() => navigate('/daily-checkin')}
        className="fixed bottom-8 right-8 z-50 bg-primary hover:bg-blue-700 text-white pl-4 pr-6 py-4 rounded-full shadow-[0_12px_30px_rgba(0,87,193,0.3)] hover:shadow-[0_16px_40px_rgba(0,87,193,0.4)] transition-all hover:-translate-y-1.5 flex items-center gap-3 font-bold text-lg group"
      >
        <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
          <ClipboardCheck size={24} />
        </div>
        Check-in Diário
      </button>
    </div>
  );
}
