import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MultimodalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  onReviewPending?: (isPending: boolean) => void;
}

const HoldToConfirmButton: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    const duration = 1500;
    const tick = 30;

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + (tick / duration) * 100;
        if (next >= 100) return 100;
        return next;
      });
    }, tick);

    timeoutRef.current = setTimeout(() => {
      stopHold();
      onConfirm();
    }, duration);
  };

  const stopHold = () => {
    setHolding(false);
    setProgress(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <button
      type="button"
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      className="relative overflow-hidden px-5 py-3 rounded-xl flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm whitespace-nowrap select-none"
    >
      <div 
        className="absolute top-0 left-0 h-full bg-green-500/30 pointer-events-none transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
      <div className="relative z-10 flex items-center gap-2 text-slate-700">
        <CheckCircle2 size={16} className={holding ? "text-green-700" : "text-green-600/50"} /> 
        Segure para Confirmar Fidelidade e Excluir Áudio
      </div>
    </button>
  );
};

export const MultimodalInput: React.FC<MultimodalInputProps> = ({ value, onChange, placeholder, id, onReviewPending }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  useEffect(() => {
    return () => {
      // Cleanup
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setLiveTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlobLocal = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlobLocal);
        setAudioBlob(audioBlobLocal);
        setAudioUrl(url);
        setReviewPending(true);
        onReviewPending?.(true);
        
        // Parar as tracks do microfone 
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Transcrição Simultânea (se suportada)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setLiveTranscript(transcript.trim());
        };

        recognition.start();
      }

    } catch (err) {
      console.error("Erro ao acessar o microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTranscribe = () => {
    setIsTranscribing(true);
    
    setTimeout(() => {
      const currentVal = value.trim();
      const prefix = currentVal ? `${currentVal}\n\n` : '';
      const textToAppend = liveTranscript || "(A transcrição gerou um conteúdo vazio. Verifique o uso de uma IA avançada ou se o áudio não possui voz humana audível.)";
      
      onChange(prefix + textToAppend);
      setIsTranscribing(false);
    }, 1500); // UI delay para respiro
  };

  const handleApproveTranscription = () => {
    setReviewPending(false);
    onReviewPending?.(false);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setLiveTranscript('');
  };

  return (
    <div className="space-y-3 w-full">
      {reviewPending && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-[11px] font-black tracking-widest flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="uppercase">Revisão Necessária: Por favor, leia a transcrição e confirme a fidelidade à resposta original do respondente.</span>
        </div>
      )}
      
      <div className="relative w-full bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 flex flex-col overflow-hidden">
        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isRecording ? "Gravando áudio... (Fale agora)" : (placeholder || "Digite sua resposta ou use o gravador de voz abaixo...")}
          className={cn(
            "w-full bg-transparent px-6 py-4 outline-none resize-none font-medium text-on-surface-variant min-h-[120px] transition-colors",
            isRecording && "text-red-500/90",
            reviewPending && "bg-orange-50/50"
          )}
          readOnly={isTranscribing || isRecording}
        />
        
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-wrap items-center gap-4">
          
          {/* Audio Controls */}
          {!audioUrl ? (
            <div className="flex items-center gap-3 w-full justify-end">
              {isRecording ? (
                <>
                  <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase animate-pulse mr-auto pl-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Gravando...
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all hover:scale-110 active:scale-95 text-white"
                  >
                    <Square size={20} className="fill-white" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-6 py-3 rounded-xl flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-black tracking-widest uppercase shadow-sm"
                >
                  <Mic size={18} />
                  Gravar Resposta
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 w-full flex-wrap">
              <audio src={audioUrl} controls className="h-10 flex-1 min-w-[200px]" />
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                   type="button"
                   onClick={handleTranscribe}
                   disabled={isTranscribing}
                   className={cn(
                     "px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                     isTranscribing 
                       ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                       : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                   )}
                >
                  {isTranscribing ? (
                    <><Loader2 size={16} className="animate-spin" /> Processando...</>
                  ) : (
                    <><Sparkles size={16} /> Transcrever Áudio</>
                  )}
                </button>

                {value.trim() && reviewPending && (
                  <HoldToConfirmButton onConfirm={handleApproveTranscription} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
