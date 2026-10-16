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
    <div className="relative min-h-screen text-[#1F1F28] flex flex-col justify-between selection:bg-[#C8B4FF] selection:text-[#5B2DFF] overflow-x-hidden">
      {/* Animated Background from Pinterest (with video + GIF support and elegant dark/tint overlay) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        {/* Animated video background (smooth, high quality, loops automatically) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/login-bg-fallback.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter blur-[1px] brightness-[0.88] contrast-[1.05]"
        >
          <source src="/assets/login-bg.mp4" type="video/mp4" />
          {/* Fallback to GIF if video tag unsupported */}
          <img
            src="/assets/login-bg.gif"
            alt="Study Animation Background"
            className="w-full h-full object-cover object-center"
          />
        </video>

        {/* Ambient artistic gradient overlays to maintain readability & modern aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/30 to-purple-950/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-white/10 bg-white/70 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div
            style={{ boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)' }}
            className="w-10 h-10 rounded-2xl bg-[#5B2DFF] flex items-center justify-center text-white"
          >
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-flow-serif text-lg font-semibold tracking-tight text-[#1F1F28]">
              QUIZSTUDY <span className="text-[#5B2DFF] italic font-flow-serif">/</span> FLOW
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              Hệ thống Học tập & Ôn thi Cá nhân hóa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-300/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống trực tuyến</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">

          {/* Config Box Drawer (Chỉ mở khi Admin/Dev bấm vào nút ở chân trang) */}
          {showConfig && (
            <div
              style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)'
              }}
              className="mb-6 p-6 rounded-3xl bg-white border border-[#5B2DFF]/20 transition-all animate-in fade-in"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#5B2DFF]" />
                  <h3 className="font-flow-serif text-sm font-semibold text-[#1F1F28]">
                    Cài đặt Máy chủ Supabase (Dành cho Quản trị viên)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="text-xs text-[#8E8E93] hover:text-[#1F1F28] px-2 py-1 rounded-full hover:bg-black/5"
                >
                  Đóng
                </button>
              </div>

              <p className="text-[11px] text-[#8E8E93] mb-4 leading-relaxed">
                Máy chủ đã được tự động kết nối sẵn từ hệ thống. Bạn chỉ cần chỉnh sửa tại đây nếu muốn đổi sang dự án Supabase khác.
              </p>

              <form onSubmit={handleSaveConfig} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1F1F28] mb-1">
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
                  <label className="block text-[11px] font-semibold text-[#1F1F28] mb-1">
                    Project Anon Key
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
                    {showSql ? 'Ẩn câu lệnh SQL' : 'Xem SQL tạo bảng'}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-[#5B2DFF] text-white text-xs font-medium hover:bg-[#4820d9] transition-all cursor-pointer"
                  >
                    Lưu
                  </button>
                </div>
              </form>

              {showSql && (
                <div className="mt-4 pt-4 border-t border-black/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#1F1F28]">SQL Editor:</span>
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

          {/* Authentication Card (Frosted Glassmorphism over Animated Aesthetic Background) */}
          <div
            style={{
              boxShadow: '0 20px 50px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.1)'
            }}
            className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 p-7 sm:p-9 relative overflow-hidden transition-all duration-300"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B2DFF] via-[#C8B4FF] to-[#5B2DFF]" />

            {/* Mode Selector Tabs */}
            <div className="flex p-1 mb-6 rounded-2xl bg-black/[0.03] border border-black/[0.04]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#5B2DFF] shadow-sm'
                    : 'text-[#8E8E93] hover:text-[#1F1F28]'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#5B2DFF] shadow-sm'
                    : 'text-[#8E8E93] hover:text-[#1F1F28]'
                }`}
              >
                Tạo tài khoản mới
              </button>
            </div>

            {/* Title Section */}
            <div className="text-center mb-6">
              <h2 className="font-flow-serif text-2xl font-normal text-[#1F1F28] tracking-tight">
                {mode === 'signin' ? 'Chào mừng bạn trở lại' : 'Tạo tài khoản học tập'}
              </h2>
              <p className="text-xs text-[#8E8E93] mt-1.5">
                {mode === 'signin'
                  ? 'Đăng nhập để truy cập các bộ thẻ và kết quả của bạn'
                  : 'Đăng ký miễn phí để lưu trữ và đồng bộ hóa tiến trình'}
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
                    placeholder="student@example.com"
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
                  <span className="text-[11px] text-[#8E8E93]">
                    Tối thiểu 6 ký tự
                  </span>
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
                className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#5B2DFF] hover:bg-[#4820d9] text-white font-semibold text-xs tracking-wide transition-all duration-200 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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

            {/* Guest Mode Divider */}
            <div className="mt-6 pt-5 border-t border-black/[0.05] text-center">
              <button
                type="button"
                onClick={continueAsGuest}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#FCFAF6] hover:bg-black/[0.04] border border-black/[0.06] text-xs font-medium text-[#1F1F28] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5B2DFF]" />
                <span>Trải nghiệm nhanh không cần tài khoản (Chế độ Khách)</span>
              </button>
            </div>
          </div>

          {/* Discreet Admin Server Config Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-[11px] text-[#8E8E93] hover:text-[#5B2DFF] transition-colors cursor-pointer py-1 px-3 rounded-full hover:bg-black/[0.03]"
            >
              {showConfig ? '▲ Đóng cấu hình máy chủ' : '⚙️ Tùy chọn máy chủ (Dành cho Quản trị viên)'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer attribution */}
      <footer className="relative z-10 py-5 text-center text-xs font-medium text-white/80 bg-black/30 backdrop-blur-md border-t border-white/10">
        <span>QUIZSTUDY / FLOW • Ứng dụng học tập (made by NHH and Gehihi)</span>
      </footer>
    </div>
  );
};
