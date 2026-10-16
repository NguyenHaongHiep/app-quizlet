import React, { useState, useMemo } from 'react';
import {
  Layers,
  BarChart3,
  Home,
  Plus,
  Upload,
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Database,
  Cloud,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';
import { useAppState } from '../lib/app-state';
import { useAuth } from '../lib/auth-context';
import { sound } from '../lib/sound';

interface SidebarProps {
  currentView: 'dashboard' | 'modules' | 'analytics';
  onNavigateView: (view: 'dashboard' | 'modules' | 'analytics') => void;
  onOpenNewCourse: () => void;
  onOpenNewSet: () => void;
  onOpenImport: () => void;
  onOpenDbSetup: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigateView,
  onOpenNewCourse,
  onOpenNewSet,
  onOpenImport,
  onOpenDbSetup,
  isOpenMobile,
  onCloseMobile,
  isDarkMode,
  onToggleDarkMode
}) => {
  const {
    courses,
    studySets,
    activeSetId,
    setActiveSetId,
    setActiveMode,
    searchQuery,
    setSearchQuery,
    syncError,
    isSyncing
  } = useAppState();

  const { user, signOut } = useAuth();
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(() => {
    // Default open all courses
    const init: Record<string, boolean> = {};
    courses.forEach(c => { init[c.id] = true; });
    return init;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());

  const handleToggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const toggleCourseExpand = (courseId: string) => {
    sound.playClick();
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleSelectSet = (setId: string) => {
    sound.playClick();
    setActiveSetId(setId);
    setActiveMode(null);
    onNavigateView('modules');
    onCloseMobile();
  };

  // Filter courses & sets by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses.map(c => ({
        course: c,
        sets: studySets.filter(s => s.courseId === c.id)
      }));
    }
    const q = searchQuery.toLowerCase();
    return courses
      .map(c => {
        const matchesCourse = c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
        const matchedSets = studySets.filter(s =>
          s.courseId === c.id && (
            matchesCourse ||
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.questions.some(item =>
              item.prompt.toLowerCase().includes(q) ||
              item.correctAnswer.toLowerCase().includes(q)
            )
          )
        );
        return {
          course: c,
          sets: matchedSets,
          hasMatch: matchesCourse || matchedSets.length > 0
        };
      })
      .filter(item => item.hasMatch);
  }, [courses, studySets, searchQuery]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] flex flex-col glass-sidebar transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 1. Header & Brand Title */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007afc] to-[#a855f7] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-none text-slate-900 dark:text-white">
                QUIZSTUDY
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">
                FLOW EDITION
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Instant Search Bar */}
        <div className="px-4 pt-3.5 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm nhanh học phần, bộ thẻ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-2 text-xs rounded-xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007afc]/40 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Primary Navigation Links */}
        <div className="px-3 py-2 space-y-1">
          <button
            onClick={() => {
              sound.playClick();
              setActiveSetId(null);
              setActiveMode(null);
              onNavigateView('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
              currentView === 'dashboard' && !activeSetId
                ? 'bg-[#0a2540] dark:bg-sky-950 text-white shadow-sm font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Trang chủ (Home)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigateView('analytics');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-[#0a2540] dark:bg-sky-950 text-white shadow-sm font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Thống kê &amp; Tiến độ (Analytics)</span>
          </button>

          {syncError && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenDbSetup();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span>Cơ sở dữ liệu Supabase</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-600 text-white rounded">Fix</span>
            </button>
          )}
        </div>

        {/* 4. Body: Study Modules & Decks Accordion */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Học phần &amp; Bộ thẻ
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenNewCourse}
                title="Tạo học phần mới"
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenImport}
                title="Nhập file Excel/CSV"
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 transition"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div className="px-3 py-6 text-center text-slate-400 text-xs">
              Chưa có học phần nào phù hợp
            </div>
          ) : (
            filteredData.map(({ course, sets }) => {
              const isExpanded = expandedCourses[course.id] ?? true;

              return (
                <div key={course.id} className="rounded-xl overflow-hidden bg-white/40 dark:bg-white/[0.03] border border-white/30 dark:border-white/5">
                  {/* Module Header Accordion Toggle */}
                  <button
                    onClick={() => toggleCourseExpand(course.id)}
                    className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/5 transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: course.color || '#007afc' }}
                      />
                      <span className="truncate">{course.code}: {course.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-slate-400">
                      <span className="text-[10px] font-mono opacity-70">
                        {sets.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {/* Nested Decks List */}
                  {isExpanded && (
                    <div className="px-1.5 pb-2 pt-0.5 space-y-1">
                      {sets.length === 0 ? (
                        <div className="px-3 py-1.5 text-[11px] text-slate-400 italic">
                          Chưa có bộ thẻ nào
                        </div>
                      ) : (
                        sets.map(set => {
                          const isSelected = activeSetId === set.id;

                          return (
                            <button
                              key={set.id}
                              onClick={() => handleSelectSet(set.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer text-left ${
                                isSelected
                                  ? 'bg-[#0a2540] dark:bg-sky-900 text-white font-semibold shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-300' : 'text-slate-400'}`} />
                                <span className="truncate">{set.title}</span>
                              </div>
                              <span
                                className={`text-[10px] tabular-nums font-mono px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {set.questions.length}
                              </span>
                            </button>
                          );
                        })
                      )}

                      <button
                        onClick={onOpenNewSet}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-[#007afc] dark:text-sky-400 hover:bg-white/60 dark:hover:bg-white/5 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm bộ thẻ vào học phần</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 5. Footer: Dark Mode, Sound Toggle & User Profile */}
        <div className="p-3.5 border-t border-white/20 dark:border-white/10 space-y-2.5 bg-white/30 dark:bg-black/20">
          {/* Controls: Dark mode & Sound */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => {
                sound.playClick();
                onToggleDarkMode();
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition"
              title={isDarkMode ? 'Chuyển sang Giao diện sáng' : 'Chuyển sang Giao diện tối'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-purple-600" />
                  <span>Tối</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                soundEnabled
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
              title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Âm thanh: Bật</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Tắt</span>
                </>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between px-1 pt-1 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {user?.email?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="truncate font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                  {user?.email || 'Khách học tập'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <Cloud className="w-2.5 h-2.5 text-emerald-500" />
                  <span>{isSyncing ? 'Đang đồng bộ...' : 'Đã kết nối'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                signOut();
              }}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-white/60 dark:hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
