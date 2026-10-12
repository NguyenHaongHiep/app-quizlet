import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabase, reinitializeSupabase, getStoredSupabaseConfig } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null } }>;
  signOut: () => Promise<void>;
  updateConfig: (url: string, key: string) => void;
  config: { url: string; key: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(getStoredSupabaseConfig);

  const isConfigured = Boolean(config.url && config.key);

  useEffect(() => {
    const supabase = getSupabase();

    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Initial Session Check with supabase.auth.getSession()
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Lỗi khi lấy Supabase session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching session:', err);
      setLoading(false);
    });

    // 2. Listen to Auth State Changes with supabase.auth.onAuthStateChange()
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [config.url, config.key]);

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        error: {
          name: 'NotConfigured',
          message: 'Vui lòng cấu hình Supabase URL và Anon Key trước khi đăng nhập.',
          status: 400
        } as AuthError
      };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null; data?: { user: User | null } }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        error: {
          name: 'NotConfigured',
          message: 'Vui lòng cấu hình Supabase URL và Anon Key trước khi đăng ký.',
          status: 400
        } as AuthError
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    return { error, data: { user: data.user } };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const updateConfig = (url: string, key: string) => {
    reinitializeSupabase(url, key);
    setConfig({ url, key });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        updateConfig,
        config
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
