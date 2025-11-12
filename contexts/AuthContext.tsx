'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type SignUpParams = {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    router.push('/dashboard');
  };

  const signUp = async ({ email, password, fullName, phone }: SignUpParams) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName?.trim() || null,
          phone: phone?.trim() || null,
        },
      },
    });

    if (error) throw error;

    // Show success message
    alert('Conta criada! Verifique seu email para confirmar o cadastro.');
  };

  const signOut = async () => {
    try {
      // Limpar estado do usuário primeiro
      setUser(null);
      
      // Limpar localStorage
      localStorage.removeItem('selectedChildId');
      
      // Fazer signOut no Supabase
      await supabase.auth.signOut({ scope: 'local' });
      
      // Redirecionar para login
      router.push('/login');
    } catch (error) {
      // Mesmo se houver erro, garantir que o usuário seja deslogado
      console.error('Error during sign out:', error);
      setUser(null);
      localStorage.clear();
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
