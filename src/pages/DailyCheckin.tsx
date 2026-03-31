import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Frown, Meh, Smile, Target, Zap, ChevronLeft, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DailyCheckin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    focusLevel: 0,
    feltBored: null as boolean | null,
    produced: '',
    blockers: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFocusSelect = (level: number) => {
    setFormData(prev => ({ ...prev, focusLevel: level }));
  };

  const handleBoredSelect = (bored: boolean) => {
    setFormData(prev => ({ ...prev, feltBored: bored }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        navigate('/student-portal');
      }, 2500);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-emerald-200">
          <Rocket size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Missão registrada!</h1>
        <p className="text-slate-500 text-lg font-medium">Seu professor recebeu seu status.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-4 py-4 md:px-6 md:py-6 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={() => navigate('/student-portal')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          title="Voltar ao Portal"
          aria-label="Voltar ao Portal"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Check-in Diário</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Avaliação formativa rápida</p>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-4 py-8 md:py-12 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full space-y-8">
          
          {/* Question 1: Focus */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <label className="block text-lg font-bold text-slate-800 mb-6 text-center">
              Como foi seu nível de foco hoje?
            </label>
            <div className="flex justify-between items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleFocusSelect(level)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 w-16 h-20 md:w-20 md:h-24 rounded-2xl transition-all",
                    formData.focusLevel === level 
                      ? "bg-primary text-white scale-110 shadow-lg shadow-blue-200" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  {level <= 2 ? <Frown size={28} /> : level === 3 ? <Meh size={28} /> : <Smile size={28} />}
                  <span className="text-xs font-bold">{level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Boredom */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <label className="block text-lg font-bold text-slate-800 mb-6 text-center">
              Você sentiu tédio em algum momento da aula regular?
            </label>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => handleBoredSelect(true)}
                className={cn(
                  "flex-1 max-w-[140px] py-4 rounded-2xl font-bold text-lg transition-all",
                  formData.feltBored === true
                    ? "bg-amber-100 text-amber-700 shadow-md border-2 border-amber-200" 
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-2 border-transparent"
                )}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => handleBoredSelect(false)}
                className={cn(
                  "flex-1 max-w-[140px] py-4 rounded-2xl font-bold text-lg transition-all",
                  formData.feltBored === false
                    ? "bg-emerald-100 text-emerald-700 shadow-md border-2 border-emerald-200" 
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-2 border-transparent"
                )}
              >
                Não
              </button>
            </div>
          </div>

          {/* Question 3: Output */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <label className="block text-lg font-bold text-slate-800 mb-2">
              O que você conseguiu produzir no seu projeto hoje?
            </label>
            <p className="text-sm text-slate-400 mb-4">Seja breve, uma ou duas frases.</p>
            <textarea
              required
              value={formData.produced}
              onChange={(e) => setFormData(prev => ({ ...prev, produced: e.target.value }))}
              placeholder="Ex: Assisti o vídeo inteiro e anotei 3 ideias novas..."
              className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-700 font-medium"
            />
          </div>

          {/* Question 4: Blockers */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <label className="block text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Target size={20} className="text-amber-500" />
              Encontrou algum bloqueio?
            </label>
            <p className="text-sm text-slate-400 mb-4">Opcional. Conte se teve dificuldade com algo.</p>
            <textarea
              value={formData.blockers}
              onChange={(e) => setFormData(prev => ({ ...prev, blockers: e.target.value }))}
              placeholder="Ex: O link do tutorial estava quebrado..."
              className="w-full h-24 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:border-amber-400 focus:bg-white transition-colors text-slate-700 font-medium"
            />
          </div>

          <div className="pt-4 pb-12">
            <button
              type="submit"
              disabled={isSubmitting || formData.focusLevel === 0 || formData.feltBored === null || !formData.produced.trim()}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-primary text-white font-black text-lg shadow-[0_8px_20px_rgba(0,87,193,0.3)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={24} className="fill-white" />
                  Enviar Check-in
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
