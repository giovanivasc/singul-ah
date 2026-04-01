import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MultimodalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export const MultimodalInput: React.FC<MultimodalInputProps> = ({ value, onChange, placeholder, id }) => {
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("A gravação de áudio não é suportada por este navegador. Tente utilizar o Google Chrome, Edge ou Safari atualizado.");
        return;
      }

      const initialValue = value; // Captura state inicial para evitar bugs de clojure com o React
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        const space = initialValue && !initialValue.endsWith(' ') && !initialValue.endsWith('\n') ? ' ' : '';
        onChange(initialValue + space + transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Erro na gravação de áudio:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="relative w-full bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 group">
      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isRecording ? "Ouvindo... (Pode falar)" : (placeholder || "Digite ou grave sua resposta...")}
        className={cn(
          "w-full bg-transparent px-6 py-4 pb-16 outline-none resize-none font-medium text-on-surface-variant min-h-[120px] transition-colors",
          isRecording && "text-primary/90"
        )}
      />
      
      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleRecording}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 atmospheric-shadow",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110 shadow-lg shadow-red-500/30" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRecording ? (
            <Square size={20} className="text-white fill-white" />
          ) : (
            <Mic size={22} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
};
