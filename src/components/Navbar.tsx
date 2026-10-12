import React from 'react';
import { BookOpen, Plus, Upload, RotateCcw, Download, Sparkles } from 'lucide-react';
import { useAppState } from '../lib/app-state';

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
    exportAllDataAsJson
  } = useAppState();

  const handleGoHome = () => {
    setActiveCourseId(null);
    setActiveSetId(null);
    setActiveMode(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1 -ml-1 transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                UniFlash &amp; Quiz
              </span>
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                Đại học &amp; Học thuật
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean Single-Line text) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={handleGoHome}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              !activeCourseId && !activeSetId ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Tổng quan
          </button>
          
          <button
            onClick={onOpenNewCourseModal}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>Thêm học phần</span>
          </button>

          <button
            onClick={onOpenNewSetModal}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>Thêm bộ thẻ</span>
          </button>

          <button
            onClick={exportAllDataAsJson}
            title="Tải bản sao lưu JSON toàn bộ dữ liệu"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-xs text-slate-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sao lưu</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={resetToDefaultData}
            title="Khôi phục dữ liệu mẫu ban đầu"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200/60 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tải file Excel / CSV</span>
          </button>

          <button
            onClick={onOpenNewSetModal}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors whitespace-nowrap shadow-xs shadow-indigo-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tạo bộ thẻ mới</span>
          </button>
        </div>
      </div>
    </header>
  );
};
