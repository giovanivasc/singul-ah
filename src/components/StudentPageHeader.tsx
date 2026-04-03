import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, GraduationCap, MapPin, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentPageHeaderProps {
  title: string;
  studentId?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function StudentPageHeader({ title, studentId, onBack, showBack = true }: StudentPageHeaderProps) {
  const navigate = useNavigate();
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

  const age = student?.date_of_birth ? calculateAge(student.date_of_birth) : 0;

  return (
    <div className="mb-8 flex items-center gap-6">
      {showBack && (
        <button 
          onClick={onBack ? onBack : () => navigate(-1)}
          className="w-12 h-12 rounded-2xl bg-white atmospheric-shadow flex items-center justify-center text-slate-400 hover:text-primary transition-all shrink-0"
          title="Voltar"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <div>
         <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2">
            {title}
         </h1>
         {student && (
           <div className="flex items-center gap-3 flex-wrap">
             <span className="text-lg font-medium text-slate-700">{student.full_name}</span>
             <div className="flex items-center gap-2">
               <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5"><User size={12}/> {age ? `${age} Anos` : 'N/D'}</span>
               <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5"><GraduationCap size={12}/> {student.grade || 'N/D'}</span>
               <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5"><MapPin size={12}/> {student.school || 'Sem escola'}</span>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
