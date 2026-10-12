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
  GraduationCap
} from 'lucide-react';
import { useAppState } from '../lib/app-state';
import { Course, StudySet } from '../types';

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
    setSearchQuery
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner & Student Stats */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Góc học tập sinh viên đại học</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sẵn sàng bứt phá điểm số hôm nay!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ôn thi học kỳ hiệu quả với bộ thẻ thông minh, cơ chế phản hồi giải thích chi tiết tức thì và nhập đề từ file Excel/CSV.
            </p>
          </div>

          {/* Quick Action CTA inside Hero */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Nhập file Excel / CSV</span>
            </button>

            <button
              onClick={onOpenNewSetModalAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo bộ thẻ</span>
            </button>
          </div>
        </div>

        {/* 4 Quantitative Rigor Stats Strip (Without decorative dot pulse) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-medium">
              <Layers className="w-4 h-4" />
              <span>Tổng số bộ thẻ</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {studySets.length} <span className="text-xs font-normal text-slate-400">bộ ({totalQuestions} câu)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
              <Flame className="w-4 h-4" />
              <span>Chuỗi chuyên cần</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {stats.streakDays} <span className="text-xs font-normal text-slate-400">ngày liên tiếp</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium">
              <Trophy className="w-4 h-4" />
              <span>Bài thi hoàn thành</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {stats.quizzesCompleted} <span className="text-xs font-normal text-slate-400">lượt</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Độ chính xác</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {stats.accuracyRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm môn học, bộ thẻ hoặc khái niệm..."
            className="w-full pl-9.5 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Course Filter Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCourseFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCourseFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả môn ({studySets.length})
          </button>
          {courses.map(c => {
            const count = studySets.filter(s => s.courseId === c.id).length;
            const isSelected = selectedCourseFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCourseFilter(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.code} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. SECTION: CÁC HỌC PHẦN (COURSES SECTION) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Học phần &amp; Môn học Đại học
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý các môn học theo mã học phần và học kỳ
            </p>
          </div>

          <button
            onClick={onOpenNewCourse}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học phần mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map(c => {
            const courseSets = studySets.filter(s => s.courseId === c.id);
            const questionCount = courseSets.reduce((acc, s) => acc + s.questions.length, 0);

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      style={{ backgroundColor: `${c.color}15`, color: c.color, borderColor: `${c.color}40` }}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono border"
                    >
                      {c.code}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditCourse(c)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title="Sửa học phần"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa học phần ${c.name} và các bộ thẻ thuộc học phần này?`)) {
                            deleteCourse(c.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Xóa học phần"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{courseSets.length} bộ thẻ · {questionCount} câu</span>
                  <button
                    onClick={() => setSelectedCourseFilter(c.id)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                  >
                    <span>Xem</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SECTION: CÁC BỘ THẺ ÔN TẬP (STUDY SETS GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Danh sách Bộ thẻ ({filteredSets.length})
            </h2>
            <p className="text-xs text-slate-500">
              Nhấp vào bộ thẻ để học ngay bằng Flashcard, Quiz hoặc Trò chơi ghép thẻ
            </p>
          </div>

          <button
            onClick={onOpenNewSet}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ thẻ mới</span>
          </button>
        </div>

        {filteredSets.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy bộ thẻ nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hãy thử tìm kiếm với từ khóa khác hoặc tải lên file câu hỏi Excel/CSV để tạo bộ thẻ mới.
            </p>
            <button
              onClick={onOpenImportModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập file Excel ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSets.map(set => {
              const course = courses.find(c => c.id === set.courseId);

              return (
                <div
                  key={set.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs hover:shadow-xs p-5 flex flex-col justify-between group"
                >
                  <div
                    onClick={() => setActiveSetId(set.id)}
                    className="cursor-pointer space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-600">{course?.code || 'Chung'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{set.questions.length} câu hỏi</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-snug">
                      {set.title}
                    </h3>

                    {set.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {set.description}
                      </p>
                    )}
                  </div>

                  {/* Fast Action Buttons: Flashcard & Quiz */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setActiveSetId(set.id);
                        setActiveMode('flashcard');
                      }}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors text-center"
                    >
                      Thẻ ghi nhớ
                    </button>

                    <button
                      onClick={() => {
                        setActiveSetId(set.id);
                        setActiveMode('quiz');
                      }}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors text-center"
                    >
                      Làm bài Quiz
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

  function onOpenNewSetModalAction() {
    onOpenNewSet();
  }
};
