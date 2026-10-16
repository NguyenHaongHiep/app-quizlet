import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Environment Configuration & Project Fallback
// Safe detection across Vite (import.meta.env), Node/bundlers (process.env), and Project Defaults
const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return String(import.meta.env[name]).trim();
    }
  } catch {
    // ignore
  }

  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return String(process.env[name]).trim();
    }
  } catch {
    // ignore
  }

  return '';
};

// Cấu hình cố định dự án (Pre-configured Supabase Project for this web application)
// Người dùng và học sinh vào ứng dụng được kết nối tự động, KHÔNG CẦN nhập cấu hình thủ công.
export const DEFAULT_SUPABASE_URL = 'https://rghcvuceesmwxyikoxad.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_hNvWAnVjOK3glJdc01r-Qg_ldh8KLF3';

const ENV_SUPABASE_URL =
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL') ||
  DEFAULT_SUPABASE_URL;

const ENV_SUPABASE_ANON_KEY =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('SUPABASE_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  DEFAULT_SUPABASE_ANON_KEY;

// Helper to log helpful instructions in browser console when keys are not configured via environment
export const checkAndLogSupabaseEnvStatus = () => {
  const { url, key, source } = getEffectiveSupabaseConfig();
  if (!url || !key) {
    console.warn(
      `%c[Supabase Config Warning] Missing Supabase API Keys!%c\n` +
      `No VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY found in your environment.\n` +
      `• The app is running smoothly in Fallback Mode (Guest / Offline or Browser Config).\n` +
      `• To enable cloud sync permanently, create a '.env' file with:\n` +
      `    VITE_SUPABASE_URL=https://your-project.supabase.co\n` +
      `    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n` +
      `• Or simply enter your Supabase URL & Anon Key in the app UI modal/settings.`,
      'color: #f59e0b; font-weight: bold; font-size: 13px;',
      'color: inherit;'
    );
  } else {
    console.info(
      `%c[Supabase Connected]%c Using Supabase configuration from ${source}: ${url}`,
      'color: #10b981; font-weight: bold;',
      'color: inherit;'
    );
  }
};

// Retrieve effective credentials: LocalStorage override has priority, fallback to environment
export const getEffectiveSupabaseConfig = () => {
  let localUrl = '';
  let localKey = '';

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localUrl = localStorage.getItem('quizstudy_supabase_url') || '';
      localKey = localStorage.getItem('quizstudy_supabase_anon_key') || '';
    }
  } catch (err) {
    console.warn('LocalStorage is not available for Supabase config:', err);
  }

  if (localUrl && localKey) {
    return {
      url: localUrl,
      key: localKey,
      source: 'localStorage' as const,
      isConfigured: true
    };
  }

  if (ENV_SUPABASE_URL && ENV_SUPABASE_ANON_KEY) {
    return {
      url: ENV_SUPABASE_URL,
      key: ENV_SUPABASE_ANON_KEY,
      source: 'environment' as const,
      isConfigured: true
    };
  }

  return {
    url: localUrl || ENV_SUPABASE_URL,
    key: localKey || ENV_SUPABASE_ANON_KEY,
    source: 'none' as const,
    isConfigured: false
  };
};

// Backward-compatible alias
export const getStoredSupabaseConfig = () => {
  const config = getEffectiveSupabaseConfig();
  return {
    url: config.url,
    key: config.key
  };
};

export const setStoredSupabaseConfig = (url: string, key: string) => {
  if (typeof window === 'undefined') return;
  if (url && key) {
    localStorage.setItem('quizstudy_supabase_url', url.trim());
    localStorage.setItem('quizstudy_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('quizstudy_supabase_url');
    localStorage.removeItem('quizstudy_supabase_anon_key');
  }
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Safely initializes Supabase with fallback checks.
 * Prevents uncaught runtime crashes when keys are missing.
 */
export const getSupabase = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getEffectiveSupabaseConfig();

  if (!isConfigured || !url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      // Validate basic URL structure to avoid client constructor fatal crash
      new URL(url);
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (e) {
      console.warn('Failed to safely initialize Supabase client (check URL format):', e);
      return null;
    }
  }

  return supabaseInstance;
};

export const reinitializeSupabase = (url: string, key: string): SupabaseClient | null => {
  setStoredSupabaseConfig(url, key);
  try {
    new URL(url.trim());
    supabaseInstance = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseInstance;
  } catch (e) {
    console.error('Failed to initialize Supabase with provided credentials:', e);
    return null;
  }
};

// Automatically run the startup environment status check once
checkAndLogSupabaseEnvStatus();

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

-- 4. Đánh thức PostgREST làm mới bộ nhớ đệm (schema cache) ngay lập tức
NOTIFY pgrst, 'reload schema';
`;
