import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys from environment variables or custom local config
const SUPABASE_URL_DEFAULT = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY_DEFAULT = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// In case the user enters their credentials in the UI settings or .env
export const getStoredSupabaseConfig = () => {
  const localUrl = localStorage.getItem('quizstudy_supabase_url');
  const localKey = localStorage.getItem('quizstudy_supabase_anon_key');
  return {
    url: localUrl || SUPABASE_URL_DEFAULT,
    key: localKey || SUPABASE_ANON_KEY_DEFAULT
  };
};

export const setStoredSupabaseConfig = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('quizstudy_supabase_url', url.trim());
    localStorage.setItem('quizstudy_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('quizstudy_supabase_url');
    localStorage.removeItem('quizstudy_supabase_anon_key');
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
};

export const reinitializeSupabase = (url: string, key: string): SupabaseClient => {
  setStoredSupabaseConfig(url, key);
  supabaseInstance = createClient(url.trim(), key.trim(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return supabaseInstance;
};

// SQL Schema Reference for creating tables with Row Level Security (RLS)
export const SUPABASE_SQL_SCHEMA = `-- 1. Bảng lưu Học phần (courses) với RLS
create table if not exists public.courses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  code text not null,
  name text not null,
  description text default '',
  icon text default '',
  color text default '#5B2DFF',
  semester text default '',
  created_at timestamptz default now()
);

alter table public.courses enable row level security;

create policy "Users can view their own courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own courses"
  on public.courses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

-- 2. Bảng lưu Bộ thẻ học (study_sets) với RLS
create table if not exists public.study_sets (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  description text default '',
  color text default '#5B2DFF',
  icon text default '',
  questions jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.study_sets enable row level security;

create policy "Users can view their own study sets"
  on public.study_sets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own study sets"
  on public.study_sets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own study sets"
  on public.study_sets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own study sets"
  on public.study_sets for delete
  using (auth.uid() = user_id);

-- 3. Bảng lưu Thống kê học tập (user_stats) với RLS
create table if not exists public.user_stats (
  user_id uuid references auth.users(id) on delete cascade primary key,
  streak_days int default 1,
  total_cards_studied int default 0,
  quizzes_completed int default 0,
  accuracy_rate int default 100,
  updated_at timestamptz default now()
);

alter table public.user_stats enable row level security;

create policy "Users can view and manage their stats"
  on public.user_stats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
`;
