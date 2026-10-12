import React, { useState } from 'react';
import { BookOpen, Plus, Upload, RotateCcw, Download, Sparkles, LogOut, User as UserIcon, RefreshCw } from 'lucide-react';
import { useAppState } from '../lib/app-state';
import { useAuth } from '../lib/auth-context';

interface NavbarProps {
  onOpenImportModal: () => void;
  onOpenNewCourseModal: () => void;
  onOpenNewSetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenImportModal,
  onOpenNewCourseModal,
  onOpenNewSetModal
}) => {
  const {
    activeCourseId,
    activeSetId,
    setActiveCourseId,
    setActiveSetId,
    setActiveMode,
    resetToDefaultData,
    exportAllDataAsJson,
    refreshFromSupabase,
    isSyncing
  } = useAppState();

  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleGoHome = () => {
    setActiveCourseId(null);
    setActiveSetId(null);
    setActiveMode(null);
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
  };

  const userEmailDisplay = user?.email || 'Người dùng';
  const userInitial = userEmailDisplay.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#FCFAF6]/95 backdrop-blur-md border-b border-black/[0.05] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Editorial Serif Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B2DFF] rounded-2xl p-1 -ml-1 transition-transform active:scale-98 cursor-pointer"
          >
            <div
              style={{
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
              }}
              className="w-10 h-10 rounded-2xl bg-[#5B2DFF] flex items-center justify-center text-white transition-transform group-hover:scale-105"
            >
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-flow-serif text-lg font-normal tracking-tight text-[#1F1F28] group-hover:text-[#5B2DFF] transition-colors whitespace-nowrap">
                QUIZSTUDY <span className="text-[#C8B4FF] italic font-flow-serif">/</span> FLOW
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E8E93] whitespace-nowrap">
                Nền tảng học thuật đại học
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line typography) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#8E8E93]">
          <button
            onClick={handleGoHome}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#1F1F28] ${
              !activeCourseId && !activeSetId ? 'text-[#5B2DFF] font-semibold' : ''
            }`}
          >
            Tổng quan
          </button>
          
          <button
            onClick={onOpenNewCourseModal}
            className="hover:text-[#1F1F28] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span>Thêm học phần</span>
          </button>

          <button
            onClick={onOpenNewSetModal}
            className="hover:text-[#1F1F28] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span>Tạo bộ thẻ mới</span>
          </button>

          <button
            onClick={exportAllDataAsJson}
            title="Tải bản sao lưu JSON toàn bộ dữ liệu"
            className="hover:text-[#1F1F28] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-[11px] text-[#8E8E93]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sao lưu</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions with Lilac Flow Glow */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => refreshFromSupabase()}
            title="Đồng bộ lại với Supabase"
            className={`p-2 text-[#8E8E93] hover:text-[#5B2DFF] hover:bg-black/5 rounded-full transition-colors cursor-pointer ${
              isSyncing ? 'animate-spin text-[#5B2DFF]' : ''
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => resetToDefaultData()}
            title="Khôi phục dữ liệu mẫu ban đầu"
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Import Excel / CSV Button */}
          <button
            onClick={onOpenImportModal}
            style={{
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#5B2DFF] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] rounded-full transition-all duration-200 active:scale-98 whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#5B2DFF]" />
            <span>Nhập Excel / CSV</span>
          </button>

          {/* Primary Violet Pill Button */}
          <button
            onClick={onOpenNewSetModal}
            style={{
              backgroundColor: '#5B2DFF',
              boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
            }}
            className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-98 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tạo bộ thẻ</span>
          </button>

          {/* Profile / Logout Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-black/5 border border-black/[0.06] transition-all cursor-pointer"
              title={userEmailDisplay}
            >
              <div
                style={{
                  boxShadow: '0 4px 10px rgba(91, 45, 255, 0.25)',
                }}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B2DFF] to-[#C8B4FF] flex items-center justify-center text-white font-semibold text-xs"
              >
                {userInitial}
              </div>
            </button>

            {showUserMenu && (
              <div
                style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03)'
                }}
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-black/[0.08] p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-1"
              >
                <div className="px-3 py-2 border-b border-black/[0.05] mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1F28]">
                    <UserIcon className="w-3.5 h-3.5 text-[#5B2DFF]" />
                    <span>Tài khoản Supabase</span>
                  </div>
                  <p className="text-[11px] text-[#8E8E93] truncate mt-1" title={userEmailDisplay}>
                    {userEmailDisplay}
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenImportModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#1F1F28] hover:bg-black/[0.03] rounded-xl transition-colors text-left"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#8E8E93]" />
                    <span>Nhập câu hỏi từ file</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Đăng xuất (Sign Out)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
