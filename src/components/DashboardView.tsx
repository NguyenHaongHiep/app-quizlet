import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
  Trophy,
  Plus,
  Upload,
  Search,
  ChevronRight,
  Edit2,
  Trash2,
  GraduationCap,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { useAppState } from '../lib/app-state';
import { Course, StudySet } from '../types';
import { sound } from '../lib/sound';

interface DashboardViewProps {
  onOpenNewCourse: () => void;
  onOpenNewSet: () => void;
  onOpenImportModal: () => void;
  onEditCourse: (course: Course) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewCourse,
  onOpenNewSet,
  onOpenImportModal,
  onEditCourse
}) => {
  const {
    courses,
    studySets,
    stats,
    setActiveSetId,
    setActiveMode,
    deleteCourse,
    searchQuery,
    setSearchQuery,
    hasSampleData,
    clearSampleData,
    clearAllData,
    loadDemoData
  } = useAppState();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Lọc bộ thẻ theo từ khóa tìm kiếm và học phần
  const filteredSets = studySets.filter(set => {
    const course = courses.find(c => c.id === set.courseId);
    const matchesCourse = selectedCourseFilter === 'all' || set.courseId === selectedCourseFilter;
    const matchesSearch = !searchQuery.trim() || 
      set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course && course.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course && course.code.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCourse && matchesSearch;
  });

  const totalQuestions = studySets.reduce((acc, s) => acc + s.questions.length, 0);

  // SVG Circular Progress Ring Calculation
  const progressPercent = Math.round(stats.accuracyRate) || 100;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleLaunchMode = (setId: string, mode: 'flashcard' | 'quiz') => {
    sound.playClick();
    setActiveSetId(setId);
    setActiveMode(mode);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Sample Data Detection & One-Click Cleanup Banner */}
      {hasSampleData && (
        <div className="glass-card rounded-3xl p-5 border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Phát hiện dữ liệu mẫu ban đầu (Tiếng Anh, Triết học, Toán, Kinh tế)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Bạn có thể xóa sạch toàn bộ dữ liệu mẫu ban đầu chỉ với 1 cú click để bắt đầu một tài khoản hoàn toàn trống và sạch sẽ.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={async () => {
                sound.playClick();
                await clearSampleData();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              Xóa sạch dữ liệu mẫu ban đầu
            </button>
          </div>
        </div>
      )}

      {/* 1. GLASSMORPHISM HERO BANNER */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Title & Editorial Subtitle */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#007afc] dark:text-sky-400">
                ÔN TẬP THÔNG MINH &bull; SPACED REPETITION
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#007afc]/10 text-[#007afc] dark:text-sky-300 border border-[#007afc]/20">
                <Sparkles className="w-3 h-3" /> Neo-Modern
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Làm chủ kiến thức với <span className="text-[#007afc]">Flashcard &amp; Quiz</span> thế hệ mới
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Trải nghiệm thẻ lật mượt mà, xáo trộn câu hỏi tức thì, bộ lọc Spaced Repetition thông minh và đồng bộ đa thiết bị tức thì.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenNewSet();
                }}
                className="group px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#007afc] hover:bg-sky-600 transition-all duration-200 hover:scale-102 active:scale-98 shadow-md shadow-sky-500/25 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Tạo bộ thẻ mới</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenImportModal();
                }}
                className="px-6 py-3 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-white/10 hover:bg-white border border-white/60 dark:border-white/10 transition-all duration-200 active:scale-98 inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#007afc]" />
                <span>Nhập file Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Right: Circular Progress Ring Card */}
          <div className="flex items-center justify-center lg:justify-end shrink-0">
            <div className="glass-card-sm rounded-3xl p-6 flex flex-col items-center text-center min-w-[210px]">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-slate-200/50 dark:stroke-slate-700/50"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#007afc"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                    {progressPercent}%
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    Độ chính xác
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {stats.quizzesCompleted} bài kiểm tra hoàn thành
              </div>
            </div>
          </div>
        </div>

        {/* 4 Soft KPI Metric Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/50 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-[#007afc]" />
              <span>Tổng số bộ thẻ</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
              {studySets.length} <span className="text-xs font-normal text-slate-400">bộ</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/50 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Chuỗi chuyên cần</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
              {stats.streakDays} <span className="text-xs font-normal text-slate-400">ngày</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/50 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Trophy className="w-3.5 h-3.5 text-purple-500" />
              <span>Bài thi đã làm</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
              {stats.quizzesCompleted} <span className="text-xs font-normal text-slate-400">lượt</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/50 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tổng thẻ đã học</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
              {stats.totalCardsStudied} <span className="text-xs font-normal text-slate-400">thẻ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & COURSE FILTER TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Module Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedCourseFilter('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition cursor-pointer font-medium ${
              selectedCourseFilter === 'all'
                ? 'bg-[#0a2540] dark:bg-sky-950 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-white/5 hover:bg-white/80'
            }`}
          >
            Tất cả học phần ({studySets.length})
          </button>

          {courses.map(c => {
            const count = studySets.filter(s => s.courseId === c.id).length;
            const isSelected = selectedCourseFilter === c.id;

            return (
              <button
                key={c.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCourseFilter(c.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition cursor-pointer font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0a2540] dark:bg-sky-950 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-white/5 hover:bg-white/80'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.code} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. STUDY MODULES (COURSES) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DANH MỤC HỌC PHẦN
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Môn học &amp; Chuyên ngành</h2>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenNewCourse();
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#007afc] dark:text-sky-400 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm môn học</span>
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Chưa có môn học nào</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Tạo môn học đầu tiên để phân loại các bộ thẻ ôn tập hoặc nạp file lên, hệ thống sẽ tự động khởi tạo cho bạn.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenNewCourse();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition cursor-pointer shadow-xs"
              >
                + Thêm môn học đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map(c => {
              const courseSets = studySets.filter(s => s.courseId === c.id);
              const questionCount = courseSets.reduce((acc, s) => acc + s.questions.length, 0);

              return (
                <div
                  key={c.id}
                  className="glass-card rounded-3xl p-5 hover:border-[#007afc]/40 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono text-white"
                        style={{ backgroundColor: c.color || '#007afc' }}
                      >
                        {c.code}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            sound.playClick();
                            onEditCourse(c);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition"
                          title="Sửa môn học"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            sound.playClick();
                            if (window.confirm(`Xóa học phần ${c.name} và các bộ thẻ thuộc học phần này?`)) {
                              deleteCourse(c.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition"
                          title="Xóa môn học"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{courseSets.length} bộ &bull; {questionCount} câu</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setSelectedCourseFilter(c.id);
                      }}
                      className="font-semibold text-[#007afc] dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Xem bộ thẻ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. FLASHCARD & QUIZ SETS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              KHO BỘ THẺ ({filteredSets.length})
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bộ thẻ ôn luyện Flashcard</h2>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenNewSet();
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#007afc] dark:text-sky-400 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo bộ thẻ</span>
          </button>
        </div>

        {filteredSets.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Không tìm thấy bộ thẻ nào</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Hãy thử tìm kiếm với từ khóa khác hoặc tải lên file câu hỏi Excel/CSV để tạo bộ thẻ học tập mới.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {selectedCourseFilter !== 'all' && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedCourseFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/10 hover:bg-white transition cursor-pointer"
                >
                  Xem tất cả môn
                </button>
              )}
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenImportModal();
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition cursor-pointer shadow-sm"
              >
                Nhập file Excel ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSets.map(set => {
              const course = courses.find(c => c.id === set.courseId);
              const masteredCount = set.questions.filter(q => q.mastered).length;
              const masteryPct = set.questions.length > 0 ? Math.round((masteredCount / set.questions.length) * 100) : 0;

              return (
                <div
                  key={set.id}
                  className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:border-[#007afc]/40 transition-all duration-200 group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {course ? (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: course.color || '#007afc' }}
                        >
                          {course.code}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Chung</span>
                      )}

                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {set.questions.length} thẻ
                      </span>
                    </div>

                    <h3
                      onClick={() => {
                        sound.playClick();
                        setActiveSetId(set.id);
                        setActiveMode(null);
                      }}
                      className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-1 hover:text-[#007afc] transition cursor-pointer"
                    >
                      {set.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {set.description || 'Chưa có mô tả cho bộ thẻ này.'}
                    </p>

                    {/* Mini Mastery Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Đã thuộc: {masteredCount}/{set.questions.length}</span>
                        <span className="font-mono">{masteryPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${masteryPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mode Action Buttons */}
                  <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-2">
                    <button
                      onClick={() => handleLaunchMode(set.id, 'flashcard')}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#007afc] hover:bg-sky-600 transition text-center cursor-pointer shadow-xs"
                    >
                      Flashcard
                    </button>
                    <button
                      onClick={() => handleLaunchMode(set.id, 'quiz')}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-white/10 hover:bg-white border border-white/60 dark:border-white/10 transition text-center cursor-pointer"
                    >
                      Kiểm tra
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
