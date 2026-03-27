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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and simulate transcription
      setIsRecording(false);
      handleTranscription();
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  const handleTranscription = () => {
    setIsTranscribing(true);
    
    // Simulate a delay for transcribing (Gemini logic would go here)
    setTimeout(() => {
      const mockText = "Esta é uma transcrição simulada da resposta fornecida via áudio para este campo específico do Inventário Familiar.";
      onChange(value ? `${value}\n${mockText}` : mockText);
      setIsTranscribing(false);
    }, 2000);
  };

  return (
    <div className="relative w-full bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 group">
      <textarea
        id={id}
        ref={textareaRef}
        value={isRecording ? (value ? `${value}\n(Gravando áudio...)` : "(Gravando áudio...)") : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Digite ou grave sua resposta..."}
        className={cn(
          "w-full bg-transparent px-6 py-4 outline-none resize-none font-medium text-on-surface-variant min-h-[120px] transition-colors",
          isRecording && "text-primary/60 italic"
        )}
        readOnly={isRecording || isTranscribing}
      />
      
      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        <AnimatePresence>
          {isTranscribing && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full"
            >
              <Loader2 size={12} className="animate-spin" />
              <span>Processando Áudio...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={toggleRecording}
          disabled={isTranscribing}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 atmospheric-shadow",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110" 
              : "bg-primary hover:bg-primary-dark",
            isTranscribing && "opacity-50 cursor-not-allowed"
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
