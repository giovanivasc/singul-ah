import React, { useState, useEffect } from 'react';
import { User, MapPin, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { cn } from '../lib/utils';

interface StudentHeaderBannerProps {
  title?: string;
  className?: string;
}

export function StudentHeaderBanner({ title, className }: StudentHeaderBannerProps) {
  const { studentId } = useParams();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase.from('students').select('*').eq('id', studentId).single();
        if (!error && data) {
           let fetched = data;
           const localData = localStorage.getItem(`student_extras_${studentId}`);
           if (localData) {
              fetched = { ...fetched, ...JSON.parse(localData) };
           }
           setStudent(fetched);
        }
      } catch(e) { }
    };
    fetchStudent();
  }, [studentId]);

  if (!student) return null;

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = student.date_of_birth ? calculateAge(student.date_of_birth) : 0;

  return (
    <div className={cn("w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-40 sticky top-16 shadow-sm relative", className)}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
             {student.avatar_url ? (
               <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
             ) : (
               <User size={20} className="text-slate-400" />
             )}
           </div>
           <div className="flex flex-col">
             <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{student.full_name}</h2>
             <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><User size={10} className="text-primary" /> {age ? `${age} Anos` : 'N/D'}</span>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><GraduationCap size={10} className="text-primary" /> {student.grade || 'N/D'}</span>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 italic hidden sm:flex"><MapPin size={10} className="text-primary" /> {student.school || 'Sem escola'}</span>
             </div>
           </div>
         </div>
         
         {title && (
           <div className="shrink-0 hidden md:block">
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {title}
              </span>
           </div>
         )}
      </div>
    </div>
  );
}
