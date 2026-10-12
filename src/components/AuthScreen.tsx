import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { BookOpen, LogIn, UserPlus, KeyRound, Mail, Sparkles, AlertCircle, CheckCircle, Database, Copy, Check } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { isConfigured, signIn, signUp, updateConfig, config, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Supabase Project Config Modal / Form (Mặc định ẩn để giao diện luôn gọn gàng)
  const [showConfig, setShowConfig] = useState(false);
  const [inputUrl, setInputUrl] = useState(config.url);
  const [inputKey, setInputKey] = useState(config.key);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isConfigured) {
      setErrorMessage(
        'Dự án chưa được kết nối với Supabase API Keys. Bạn có thể bấm "Trải nghiệm ngay (Chế độ Khách)" ở trên để vào học ngay, hoặc bấm "Cấu hình Supabase" ở góc trên để nhập URL & Key.'
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message || 'Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.');
        }
      } else {
        const { error, data } = await signUp(email, password);
        if (error) {
          setErrorMessage(error.message || 'Đăng ký tài khoản không thành công.');
        } else {
          if (data?.user && !data.user.confirmed_at && data.user.identities?.length) {
            setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (hoặc bạn có thể đăng nhập ngay nếu dự án tắt xác nhận email).');
          } else {
            setSuccessMessage('Đăng ký tài khoản thành công! Bạn có thể bắt đầu sử dụng.');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra trong quá trình xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Supabase Project URL và Public Anon Key.');
      return;
    }
    updateConfig(inputUrl.trim(), inputKey.trim());
    setShowConfig(false);
    setErrorMessage(null);
    setSuccessMessage('Cấu hình Supabase đã được lưu thành công!');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-[#1F1F28] flex flex-col justify-between selection:bg-[#C8B4FF] selection:text-[#5B2DFF]">
      {/* Header Bar */}
      <header className="border-b border-black/[0.04] bg-[#FCFAF6]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{ boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)' }}
            className="w-10 h-10 rounded-2xl bg-[#5B2DFF] flex items-center justify-center text-white"
          >
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-flow-serif text-lg font-semibold tracking-tight text-[#1F1F28]">
              QUIZSTUDY <span className="text-[#C8B4FF] italic font-flow-serif">/</span> FLOW
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-[#8E8E93]">
              Hệ thống Học tập Cá nhân hóa & Supabase Auth
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 text-xs font-medium text-[#8E8E93] hover:text-[#5B2DFF] bg-black/[0.03] hover:bg-black/[0.06] px-3.5 py-1.5 rounded-full transition-all"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isConfigured ? 'Cấu hình Supabase' : 'Chưa kết nối Supabase'}</span>
          {isConfigured && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          {/* Quick Start / Guest Mode Callout */}
          <div
            style={{
              boxShadow: '0 10px 30px rgba(91, 45, 255, 0.08), 0 2px 6px rgba(0,0,0,0.02)'
            }}
            className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-white via-purple-50/40 to-white border border-[#C8B4FF]/40 flex flex-col gap-3.5 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <div
                style={{
                  boxShadow: '0 6px 16px rgba(91, 45, 255, 0.25)'
                }}
                className="w-10 h-10 rounded-2xl bg-[#5B2DFF] text-white flex items-center justify-center shrink-0 mt-0.5"
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-flow-serif font-medium text-sm text-[#1F1F28]">
                    Dùng thử nhanh không cần đăng ký
                  </h3>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#5B2DFF]/10 text-[#5B2DFF]">
                    Offline
                  </span>
                </div>
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  Vào học ngay với bộ dữ liệu mẫu, tạo flashcard và làm bài trắc nghiệm mà không cần tài khoản hay cấu hình.
                </p>
              </div>
            </div>
            <button
              onClick={continueAsGuest}
              style={{
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.25)'
              }}
              className="w-full py-2.5 px-4 rounded-full bg-[#5B2DFF] hover:bg-[#4820d9] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
            >
              <span>Vào học ngay với tư cách Khách</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* Config Box Drawer / Toggle */}
          {showConfig && (
            <div
              style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)'
              }}
              className="mb-6 p-6 rounded-3xl bg-white border border-black/[0.06] transition-all animate-in fade-in"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#5B2DFF]" />
                  <h3 className="font-flow-serif text-base font-semibold text-[#1F1F28]">
                    Cấu hình Dự án Supabase
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfig(false)}
                  className="text-xs text-[#8E8E93] hover:text-[#1F1F28] px-2 py-1 rounded-full hover:bg-black/5"
                >
                  Đóng
                </button>
              </div>

              <p className="text-xs text-[#8E8E93] mb-4 leading-relaxed">
                Dành cho người muốn đồng bộ đám mây: Nhập thông tin kết nối từ Supabase Dashboard (Settings → API) để đồng bộ dữ liệu người dùng.
              </p>

              <form onSubmit={handleSaveConfig} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F28] mb-1">
                    Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-[#FCFAF6] border border-black/[0.08] focus:border-[#5B2DFF] focus:outline-none focus:ring-2 focus:ring-[#5B2DFF]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1F28] mb-1">
                    Project Anon / Public API Key
                  </label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-[#FCFAF6] border border-black/[0.08] focus:border-[#5B2DFF] focus:outline-none focus:ring-2 focus:ring-[#5B2DFF]/20"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSql(!showSql)}
                    className="text-xs text-[#5B2DFF] hover:underline flex items-center gap-1"
                  >
                    {showSql ? 'Ẩn câu lệnh SQL' : 'Xem câu lệnh SQL tạo bảng'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#5B2DFF] text-white text-xs font-medium hover:bg-[#4820d9] transition-all cursor-pointer"
                  >
                    Lưu cấu hình
                  </button>
                </div>
              </form>

              {showSql && (
                <div className="mt-4 pt-4 border-t border-black/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#1F1F28]">SQL Editor (Chạy trên Supabase):</span>
                    <button
                      onClick={handleCopySql}
                      className="text-xs text-[#5B2DFF] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Đã sao chép' : 'Sao chép SQL'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] p-3 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto max-h-48 leading-relaxed font-mono">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Authentication Card (Lilac Flow Neumorphic) */}
          <div
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)'
            }}
            className="rounded-3xl bg-white border border-black/[0.06] p-7 sm:p-9 relative overflow-hidden"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B2DFF] via-[#C8B4FF] to-[#5B2DFF]" />

            {/* Title Section */}
            <div className="text-center mb-7">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B2DFF]/10 text-[#5B2DFF] text-[11px] font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Supabase Auth
              </span>
              <h2 className="font-flow-serif text-2xl font-normal text-[#1F1F28] tracking-tight">
                {mode === 'signin' ? 'Đăng nhập vào QuizStudy' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-xs text-[#8E8E93] mt-1.5">
                {mode === 'signin'
                  ? 'Ôn luyện thông minh với dữ liệu bộ thẻ của riêng bạn'
                  : 'Đăng ký để đồng bộ hóa học phần và bộ thẻ cá nhân'}
              </p>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.edu.vn"
                    required
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl bg-[#FCFAF6] border border-black/[0.08] text-[#1F1F28] placeholder-[#8E8E93]/60 focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#1F1F28]">
                    Mật khẩu
                  </label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-[#8E8E93]">
                      Tối thiểu 6 ký tự
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl bg-[#FCFAF6] border border-black/[0.08] text-[#1F1F28] placeholder-[#8E8E93]/60 focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)'
                }}
                className="w-full mt-3 py-3.5 px-6 rounded-full bg-[#5B2DFF] hover:bg-[#4820d9] text-white font-medium text-xs tracking-wide transition-all duration-200 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký tài khoản</span>
                  </>
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="mt-6 pt-5 border-t border-black/[0.05] text-center">
              {mode === 'signin' ? (
                <p className="text-xs text-[#8E8E93]">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#5B2DFF] font-semibold hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p className="text-xs text-[#8E8E93]">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#5B2DFF] font-semibold hover:underline cursor-pointer"
                  >
                    Đăng nhập tại đây
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Discreet Config Trigger */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="inline-flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-[#5B2DFF] transition-colors cursor-pointer py-1 px-3 rounded-full hover:bg-black/[0.03]"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{showConfig ? 'Ẩn cấu hình Supabase' : 'Tùy chọn: Kết nối Supabase Cloud Database'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer attribution */}
      <footer className="py-6 text-center text-xs text-[#8E8E93] border-t border-black/[0.04]">
        <span>QUIZSTUDY / FLOW • Ứng dụng học tập (made by NHH and Gehihi)</span>
      </footer>
    </div>
  );
};
