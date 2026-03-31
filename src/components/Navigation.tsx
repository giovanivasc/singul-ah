import React from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Home, Users, Settings, Search, Bell, LogOut, 
  ClipboardList, Brain, PencilRuler, FolderArchive, TrendingUp,
  Compass, ChevronLeft, LayoutDashboard, ClipboardCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export function Logo() {
  return (
    <NavLink 
      to="/dashboard"
      className={({ isActive }) => cn(
        "group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 mb-4",
        "text-slate-400 hover:text-primary",
        isActive ? "bg-primary/10 ring-2 ring-primary/30" : ""
      )}
    >
      <div className={cn(
        "absolute inset-0 rounded-full transition-all duration-500 scale-0 group-hover:scale-100 bg-white shadow-[0_4px_20px_rgba(0,87,193,0.15)]",
        "hidden group-hover:block"
      )} />
      
      <div className="z-10 flex items-center justify-center w-10 h-10 bg-primary/5 rounded-2xl group-hover:rotate-[360deg] transition-all duration-700 group-hover:bg-primary group-hover:text-white">
        <Compass size={24} strokeWidth={1.5} />
      </div>
    </NavLink>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const { studentId } = useParams();
  const location = useLocation();

  const baseNavItems = [
    { icon: Home, label: 'Visão Geral', path: '/dashboard' },
    { icon: Users, label: 'Alunos', path: '/students' },
    { icon: LayoutDashboard, label: 'Portal', path: '/student-portal' },
    { icon: ClipboardCheck, label: 'Check-in', path: '/daily-checkin' },
  ];

  const contextualNavItems = studentId ? [
    { icon: ClipboardList, label: 'Estudo de Caso', path: `/students/${studentId}/case-study` },
    { icon: Brain, label: 'Mapeamento', path: `/students/${studentId}/mapping` },
    { icon: PencilRuler, label: 'Construtor PEI', path: `/students/${studentId}/builder` },
    { icon: TrendingUp, label: 'Avaliação', path: `/students/${studentId}/evaluation` },
  ] : [];

  return (
    <aside className="fixed left-4 top-1/2 -translate-y-1/2 w-20 h-[85vh] rounded-[30px] z-50 bg-[#1A1A1A] shadow-[0px_10px_40px_rgba(0,0,0,0.3)] flex flex-col items-center justify-between py-8 hidden md:flex">
      <div className="flex flex-col items-center gap-4 w-full">
        <Logo />
        
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 mb-4 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center bg-slate-700">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-white text-xs font-bold">{user?.email?.[0].toUpperCase()}</span>
          )}
        </div>
        
        <div className="w-full flex flex-col items-center gap-3">
          {baseNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 relative group",
                  isActive 
                    ? "bg-primary text-white shadow-[0_0_15px_rgba(0,87,193,0.4)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="absolute left-16 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {studentId && (
            <>
              <div className="w-10 h-[1px] bg-white/10 my-2" />
              {contextualNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 relative group",
                      isActive 
                        ? "bg-secondary-container text-on-secondary-container shadow-[0_0_15px_rgba(255,183,77,0.2)]" 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    )
                  }
                >
                   {({ isActive }) => (
                    <>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="absolute left-16 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </div>
      </div>

      <button className="text-gray-400 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-full relative group">
        <Settings size={22} />
        <span className="absolute left-16 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Configurações
        </span>
      </button>
    </aside>
  );
}

export function BottomNav() {
  const { studentId } = useParams();
  const navItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: Users, label: 'Alunos', path: '/students' },
    { icon: LayoutDashboard, label: 'Portal', path: '/student-portal' },
    { icon: ClipboardCheck, label: 'Check-in', path: '/daily-checkin' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-[32px] bg-white/90 backdrop-blur-md flex justify-around items-center px-4 pb-6 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center px-3 py-1.5 transition-all text-outline",
              isActive 
                ? "bg-blue-50 text-primary rounded-2xl" 
                : "text-slate-400"
            )
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-bold mt-1">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function TopBar({ 
  title, 
  showBack = false, 
  children,
  rightActions
}: { 
  title?: string; 
  showBack?: boolean;
  children?: React.ReactNode;
  rightActions?: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center w-full px-6 py-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-blue-50 transition-colors text-primary flex items-center justify-center"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="md:hidden flex items-center justify-center">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Compass size={22} />
             </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          {title === "Singul-AH" && !showBack && (
            <div className="md:flex hidden items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Compass size={18} />
              </div>
            </div>
          )}
          <h1 className="text-xl font-black tracking-tight text-on-surface">
            {title === "Singul-AH" ? <span className="flex items-center gap-1">Singul<span className="text-primary">-AH</span></span> : title}
          </h1>
        </div>
        {children}
      </div>
      <div className="flex items-center gap-6">
        {rightActions && <div className="flex items-center gap-3">{rightActions}</div>}
        <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
          <button className="p-2 rounded-full hover:bg-blue-50 transition-colors relative">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-on-surface">{user?.user_metadata?.full_name || 'Usuário'}</p>
              <p className="text-[10px] text-on-surface-variant opacity-60 truncate max-w-[120px]">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden atmospheric-shadow border-2 border-white flex items-center justify-center bg-primary/10">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-primary text-sm font-black">{user?.email?.[0].toUpperCase()}</span>
              )}
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2 rounded-xl text-outline/40 hover:text-error hover:bg-error/5 transition-all duration-200"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
