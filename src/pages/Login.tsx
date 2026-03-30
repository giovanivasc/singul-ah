import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, Key, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

import { useAuth } from '../contexts/AuthContext';
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-outline">
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-card atmospheric-shadow overflow-hidden"
      >
        <div className="p-8 md:p-12 flex flex-col items-center">
          <header className="mb-10 text-center">
            <div className="flex items-center justify-center mb-3">
              <Brain className="text-primary mr-3" size={40} />
              <h1 className="text-2xl font-black tracking-tight text-on-surface">Singul-AH</h1>
            </div>
            <p className="text-on-surface-variant text-sm font-medium opacity-60 max-w-[240px] mx-auto leading-relaxed">
              Acesso ao Portal de Educação Individualizada
            </p>
          </header>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {error && (
              <div className="bg-error-container/20 text-error text-xs p-3 rounded-lg border border-error/10 text-center font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant ml-4" htmlFor="email">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline/60" size={18} />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high/60 border-none rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200" 
                  id="email" 
                  name="email" 
                  placeholder="seu@email.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant ml-4" htmlFor="password">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline/60" size={18} />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high/60 border-none rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <a className="text-xs font-bold text-primary hover:text-primary-container transition-colors duration-200" href="#">
                Esqueceu a senha?
              </a>
            </div>

            <button 
              className="w-full bg-primary text-white font-bold py-4 rounded-full atmospheric-shadow hover:brightness-105 active:scale-[0.98] transition-all duration-200 mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Entrar'}
            </button>
          </form>

          <footer className="mt-10 w-full text-center">
            <div className="relative flex items-center justify-center mb-8">
              <div className="flex-grow border-t border-surface-variant/50"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-outline/60 uppercase tracking-widest">OU</span>
              <div className="flex-grow border-t border-surface-variant/50"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-3 bg-surface-container-low border border-outline-variant/5 rounded-2xl hover:bg-surface-container transition-colors duration-200 group"
                disabled={loading}
              >
                <img 
                  alt="Google" 
                  className="w-5 h-5 group-hover:scale-110 transition-transform" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdMtP0Y01FLPLKWOvvzhTYnZkI3xovzqnFh6ay7g_wlnBCoek2UT6ieyIDRxTaanEkRm_sTOoGpMZJu4kHen8Hy_VBAWDOxdpwf2rRMMlVMHq4cQ1GW-V7zsT7Fg9XXgMeSuKi3WS3PLzuTk8y_VZ11CnMH8Ozz9G8GXC9nw8IAnDGLRMaQ4ZQ04xbTjO8eKjdkhtcF0HCviXFtUc4QjnYO5jK6N4J1CuSBb4E4whnzPiiGXttqqREPTASENjOqN-VkiOf5Y9YnltA"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold text-on-surface-variant">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-surface-container-low border border-outline-variant/5 rounded-2xl hover:bg-surface-container transition-colors duration-200 group" disabled={loading}>
                <Key className="text-on-surface opacity-70 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-xs font-bold text-on-surface-variant">SSO</span>
              </button>
            </div>

            <p className="mt-8 text-xs text-on-surface-variant/80">
              Não tem uma conta? 
              <a className="text-primary font-bold hover:underline ml-1" href="#">Solicitar acesso</a>
            </p>
          </footer>
        </div>
      </motion.main>

      <div className="fixed -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/10 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}
