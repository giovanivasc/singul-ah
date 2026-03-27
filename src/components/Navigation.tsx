import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, BookOpen, GitMerge, FolderClosed, Settings, Search, Bell, LogOut } from 'lucide-react';
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
      
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10 z-10 transition-all duration-700 group-hover:rotate-[360deg] group-active:scale-95"
      >
        {/* Outer Ring with geometric ticks */}
        <circle cx="12" cy="12" r="10" className="opacity-20" />
        <circle cx="12" cy="12" r="8" className="opacity-10" />
        
        {/* Cardinal Directions (NESW) */}
        <text x="12" y="4.5" textAnchor="middle" fontSize="2.5" fontWeight="bold" className="fill-current opacity-40">N</text>
        <text x="19.5" y="13" textAnchor="middle" fontSize="2.5" fontWeight="bold" className="fill-current opacity-40">E</text>
        <text x="12" y="21" textAnchor="middle" fontSize="2.5" fontWeight="bold" className="fill-current opacity-40">S</text>
        <text x="4.5" y="13" textAnchor="middle" fontSize="2.5" fontWeight="bold" className="fill-current opacity-40">W</text>

        {/* Inner geometric pattern */}
        <path d="M12 7L13.5 12L12 17L10.5 12Z" fill="currentColor" fillOpacity="0.05" />
        <path d="M7 12L12 10.5L17 12L12 13.5Z" fill="currentColor" fillOpacity="0.05" />

        {/* The AH Leaf - Symbolic centerpiece */}
        <path 
          d="M12 16.5C12 16.5 15.5 14 15.5 11.5C15.5 9 13.5 7.5 12 7.5C10.5 7.5 8.5 9 8.5 11.5C8.5 14 12 16.5 12 16.5Z" 
          fill="currentColor"
          className="transition-all duration-500 group-hover:fill-primary group-hover:opacity-100 opacity-60"
        />
        
        {/* Leaf details */}
        <path d="M12 8.5V15" stroke="white" strokeWidth="0.5" className="opacity-30 group-hover:opacity-60" />
        <path d="M12 10L14 10" stroke="white" strokeWidth="0.3" className="opacity-20 group-hover:opacity-40" />
        <path d="M12 12L10 12" stroke="white" strokeWidth="0.3" className="opacity-20 group-hover:opacity-40" />
      </svg>
    </NavLink>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const navItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: Users, label: 'Alunos', path: '/students' },
    { icon: BookOpen, label: 'Instrumentos', path: '/instruments' },
    { icon: GitMerge, label: 'Convergência', path: '/convergence' },
    { icon: FolderClosed, label: 'Repositório', path: '/repository' },
  ];

  return (
    <aside className="fixed left-4 top-1/2 -translate-y-1/2 w-20 h-[85vh] rounded-[30px] z-50 bg-[#1A1A1A] shadow-[0px_10px_40px_rgba(0,0,0,0.3)] flex flex-col items-center justify-between py-8 hidden md:flex">
      <div className="flex flex-col items-center gap-4">
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
        
        <button className="text-gray-400 hover:text-white transition-colors">
          <Search size={24} />
        </button>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(0,87,193,0.4)]" 
                  : "text-gray-400 hover:text-white"
              )
            }
          >
            <item.icon size={24} />
          </NavLink>
        ))}
      </div>

      <button className="text-gray-400 hover:text-white transition-colors">
        <Settings size={24} />
      </button>
    </aside>
  );
}

export function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: Users, label: 'Alunos', path: '/students' },
    { icon: BookOpen, label: 'Instrumentos', path: '/instruments' },
    { icon: GitMerge, label: 'Convergência', path: '/convergence' },
    { icon: FolderClosed, label: 'Repositório', path: '/repository' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-[32px] bg-white/90 backdrop-blur-md flex justify-around items-center px-4 pb-6 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center px-3 py-1.5 transition-all",
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
  return (
    <header className="flex justify-between items-center w-full px-6 py-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {showBack ? (
          <button className="p-2 rounded-full hover:bg-blue-50 transition-colors text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <div className="md:hidden">
            <Logo />
          </div>
        )}
        {title && <h1 className="text-xl font-bold tracking-tight text-primary">{title}</h1>}
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
