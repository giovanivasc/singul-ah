import React from 'react';
import { Play, BookOpen, PenTool, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  type: 'exploratorio' | 'treinamento' | 'mao-na-massa';
  status: 'todo' | 'in-progress' | 'done';
  tags: { label: string; color: string }[];
}

const mockTasks: Task[] = [];

export function ProjectKanban() {
  const columns = [
    {
      id: 'exploratorio',
      title: 'Exploratório (Tipo I)',
      description: 'Vídeos, leituras e descobertas',
      icon: BookOpen,
      color: 'border-blue-200 bg-blue-50/50',
      headerColor: 'text-blue-700 bg-blue-100',
    },
    {
      id: 'treinamento',
      title: 'Treinamento (Tipo II)',
      description: 'Tutoriais e metodologias',
      icon: PenTool,
      color: 'border-emerald-200 bg-emerald-50/50',
      headerColor: 'text-emerald-700 bg-emerald-100',
    },
    {
      id: 'mao-na-massa',
      title: 'Mão na Massa (Tipo III)',
      description: 'Construção do produto real',
      icon: Play,
      color: 'border-purple-200 bg-purple-50/50',
      headerColor: 'text-purple-700 bg-purple-100',
    }
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(col => {
        const tasks = mockTasks.filter(t => t.type === col.id);
        
        return (
          <div key={col.id} className={cn("rounded-[32px] border-2 p-6 flex flex-col gap-5", col.color)}>
            <div className="flex items-center gap-4 mb-2">
              <div className={cn("p-3 rounded-2xl shadow-sm", col.headerColor)}>
                <col.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1A1A1A] text-lg leading-tight">{col.title}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{col.description}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {tasks.map(task => (
                <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.tags.map(tag => (
                      <span key={tag.label} className={cn("text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider", tag.color)}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  
                  <h4 className="font-bold text-base text-slate-800 mb-4 group-hover:text-primary transition-colors leading-snug">
                    {task.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      {task.status === 'done' ? (
                        <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                          <CheckCircle2 size={14} strokeWidth={3} />
                        </div>
                      ) : task.status === 'in-progress' ? (
                        <div className="bg-amber-100 text-amber-600 p-1 rounded-full">
                          <Clock size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="bg-slate-100 text-slate-400 p-1 rounded-full">
                          <Clock size={14} strokeWidth={3} />
                        </div>
                      )}
                      <span className={cn(
                        "text-xs font-bold",
                        task.status === 'done' ? "text-emerald-700" : task.status === 'in-progress' ? "text-amber-700" : "text-slate-500"
                      )}>
                        {task.status === 'done' ? 'Concluído' : task.status === 'in-progress' ? 'Em andamento' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-3xl bg-white/50 backdrop-blur-sm">
                  <span className="text-sm font-bold text-slate-400">Arraste tarefas para cá</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}
