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
  SlidersHorizontal,
  ArrowRight
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

  // SVG Circular Progress Ring Calculation
  const progressPercent = stats.accuracyRate || 85;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      {/* 1. LILAC FLOW HERO BANNER */}
      <div
        style={{
          boxShadow: '0 16px 36px rgba(91, 45, 255, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.04] relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Editorial Title & Subtitle */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8E8E93]">
                HỌC TẬP THÔNG MINH &bull; SINH VIÊN ĐẠI HỌC
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#C8B4FF]/25 text-[#5B2DFF] border border-[#5B2DFF]/20">
                <Sparkles className="w-3 h-3" /> Lilac Flow
              </span>
            </div>

            <h1 className="font-flow-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#1F1F28] leading-[1.15]">
              Bứt phá điểm số <span className="text-[#5B2DFF] font-medium">chuyên sâu</span> cùng Flashcard &amp; Quiz
            </h1>

            <p className="text-xs sm:text-sm text-[#8E8E93] font-light leading-relaxed">
              Trải nghiệm phản hồi tức thì với giải thích chi tiết, ví dụ thực tế và mẹo ghi nhớ. Hỗ trợ import trực tiếp từ file Excel/CSV nhanh chóng.
            </p>

            {/* Quick Action Pill Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOpenNewSet}
                style={{
                  backgroundColor: '#5B2DFF',
                  boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
                }}
                className="group px-6 py-3 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                <span>Tạo bộ thẻ mới</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenImportModal}
                style={{
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                }}
                className="px-6 py-3 rounded-full text-xs font-medium text-[#1F1F28] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] transition-all duration-200 active:scale-98 inline-flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#5B2DFF]" />
                <span>Nhập file Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Right: Circular Progress Ring Card */}
          <div className="flex items-center justify-center lg:justify-end shrink-0">
            <div
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
              }}
              className="bg-[#FCFAF6] border border-black/[0.04] rounded-3xl p-6 flex flex-col items-center text-center min-w-[210px]"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                  <defs>
                    <linearGradient id="heroLilacGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5B2DFF" />
                      <stop offset="100%" stopColor="#C8B4FF" />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="#EAE6DC"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Dynamic Gradient Stroke */}
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="url(#heroLilacGrad)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-flow-serif text-2xl font-normal text-[#1F1F28]">
                    {progressPercent}%
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                    Độ chính xác
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs font-medium text-[#1F1F28]">
                {stats.quizzesCompleted} bài kiểm tra đạt chuẩn
              </div>
            </div>
          </div>
        </div>

        {/* 4 Soft KPI Metric Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-black/[0.04]">
          <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-black/[0.03]">
            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <Layers className="w-3.5 h-3.5 text-[#5B2DFF]" />
              <span>Tổng số bộ thẻ</span>
            </div>
            <div className="text-xl font-bold font-flow-serif text-[#1F1F28] mt-1">
              {studySets.length} <span className="text-xs font-normal text-[#8E8E93]">bộ</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-black/[0.03]">
            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Chuỗi chuyên cần</span>
            </div>
            <div className="text-xl font-bold font-flow-serif text-[#1F1F28] mt-1">
              {stats.streakDays} <span className="text-xs font-normal text-[#8E8E93]">ngày</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-black/[0.03]">
            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <Trophy className="w-3.5 h-3.5 text-[#5B2DFF]" />
              <span>Lượt bài thi</span>
            </div>
            <div className="text-xl font-bold font-flow-serif text-[#1F1F28] mt-1">
              {stats.quizzesCompleted} <span className="text-xs font-normal text-[#8E8E93]">lượt</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-black/[0.03]">
            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tổng câu đã học</span>
            </div>
            <div className="text-xl font-bold font-flow-serif text-[#1F1F28] mt-1">
              {stats.totalCardsStudied} <span className="text-xs font-normal text-[#8E8E93]">câu</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH PILL & COURSE SEGMENTED CONTROLS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Lilac Flow Pill Search Field with Floating Filter Action */}
        <div className="relative w-full lg:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-[#8E8E93]">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm môn học, thuật ngữ hoặc bộ thẻ..."
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.025)',
            }}
            className="w-full pl-11 pr-14 py-3 bg-[#FCFAF6] border border-black/[0.05] rounded-full text-xs text-[#1F1F28] placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#5B2DFF]/40 focus:border-[#5B2DFF] transition-all"
          />
          <button
            type="button"
            style={{
              backgroundColor: '#5B2DFF',
              boxShadow: '0 4px 12px rgba(91, 45, 255, 0.3)',
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7.5 h-7.5 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Lọc kết quả"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>

        {/* Lilac Flow Segmented Pill Controls for Courses */}
        <div
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.025)',
          }}
          className="bg-[#FCFAF6] border border-black/[0.04] rounded-full p-1 flex items-center gap-1 overflow-x-auto scrollbar-none"
        >
          <button
            onClick={() => setSelectedCourseFilter('all')}
            style={
              selectedCourseFilter === 'all'
                ? {
                    backgroundColor: '#5B2DFF',
                    boxShadow: '0 6px 16px rgba(91, 45, 255, 0.35)',
                    color: '#FFFFFF',
                  }
                : {}
            }
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
              selectedCourseFilter === 'all'
                ? 'font-semibold'
                : 'text-[#8E8E93] hover:text-[#1F1F28]'
            }`}
          >
            Tất cả ({studySets.length})
          </button>

          {courses.map(c => {
            const count = studySets.filter(s => s.courseId === c.id).length;
            const isSelected = selectedCourseFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCourseFilter(c.id)}
                style={
                  isSelected
                    ? {
                        backgroundColor: '#5B2DFF',
                        boxShadow: '0 6px 16px rgba(91, 45, 255, 0.35)',
                        color: '#FFFFFF',
                      }
                    : {}
                }
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  isSelected
                    ? 'font-semibold'
                    : 'text-[#8E8E93] hover:text-[#1F1F28]'
                }`}
              >
                {c.code} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. HỌC PHẦN ĐẠI HỌC (COURSES GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E8E93]">
              HỌC PHẦN ĐÃ ĐĂNG KÝ
            </span>
            <h2 className="text-lg font-bold text-[#1F1F28]">Môn học &amp; Chuyên ngành</h2>
          </div>

          <button
            onClick={onOpenNewCourse}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B2DFF] hover:text-[#451ECC] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm môn học</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map(c => {
            const courseSets = studySets.filter(s => s.courseId === c.id);
            const questionCount = courseSets.reduce((acc, s) => acc + s.questions.length, 0);

            return (
              <div
                key={c.id}
                style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
                }}
                className="bg-white rounded-3xl p-5 border border-black/[0.04] hover:border-[#5B2DFF]/20 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-[#C8B4FF]/25 text-[#5B2DFF] border border-[#5B2DFF]/20">
                      {c.code}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditCourse(c)}
                        className="p-1 text-[#8E8E93] hover:text-[#1F1F28] rounded-full transition-colors cursor-pointer"
                        title="Sửa môn học"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa học phần ${c.name} và các bộ thẻ thuộc học phần này?`)) {
                            deleteCourse(c.id);
                          }
                        }}
                        className="p-1 text-[#8E8E93] hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                        title="Xóa môn học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-[#1F1F28] text-sm leading-snug line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-[#8E8E93] line-clamp-2 font-light leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#8E8E93]">
                  <span>{courseSets.length} bộ &bull; {questionCount} câu</span>
                  <button
                    onClick={() => setSelectedCourseFilter(c.id)}
                    className="font-semibold text-[#5B2DFF] hover:text-[#451ECC] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Khám phá</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DANH SÁCH BỘ THẺ ÔN TẬP (STUDY SETS GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E8E93]">
              BỘ THẺ HỌC TẬP ({filteredSets.length})
            </span>
            <h2 className="text-lg font-bold text-[#1F1F28]">Kho dữ liệu Flashcard &amp; Trắc nghiệm</h2>
          </div>

          <button
            onClick={onOpenNewSet}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B2DFF] hover:text-[#451ECC] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo bộ thẻ</span>
          </button>
        </div>

        {filteredSets.length === 0 ? (
          <div
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
            }}
            className="bg-white rounded-3xl p-12 border border-black/[0.04] text-center space-y-3"
          >
            <Layers className="w-10 h-10 text-[#C8B4FF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#1F1F28]">Không tìm thấy bộ thẻ nào</h3>
            <p className="text-xs text-[#8E8E93] max-w-sm mx-auto font-light leading-relaxed">
              Hãy thử tìm kiếm với từ khóa khác hoặc tải lên file câu hỏi Excel/CSV để tạo bộ thẻ học tập mới.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {selectedCourseFilter !== 'all' && (
                <button
                  onClick={() => setSelectedCourseFilter('all')}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#1F1F28] bg-[#FCFAF6] border border-black/[0.06] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                >
                  Bỏ lọc theo môn (Xem tất cả)
                </button>
              )}
              <button
                onClick={onOpenImportModal}
                style={{
                  backgroundColor: '#5B2DFF',
                  boxShadow: '0 6px 16px rgba(91, 45, 255, 0.35)',
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold text-white transition-all hover:scale-102 cursor-pointer"
              >
                Nhập file Excel ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map(set => {
              const course = courses.find(c => c.id === set.courseId);

              return (
                <div
                  key={set.id}
                  style={{
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
                  }}
                  className="bg-white rounded-3xl border border-black/[0.04] hover:border-[#5B2DFF]/25 transition-all duration-200 p-6 flex flex-col justify-between group"
                >
                  <div
                    onClick={() => setActiveSetId(set.id)}
                    className="cursor-pointer space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                      <span className="font-semibold text-[#5B2DFF]">{course?.code || 'Chung'}</span>
                      <span aria-hidden="true">&bull;</span>
                      <span>{set.questions.length} câu hỏi</span>
                    </div>

                    <h3 className="font-semibold text-[#1F1F28] text-base group-hover:text-[#5B2DFF] transition-colors leading-snug">
                      {set.title}
                    </h3>

                    {set.description && (
                      <p className="text-xs text-[#8E8E93] line-clamp-2 font-light leading-relaxed">
                        {set.description}
                      </p>
                    )}
                  </div>

                  {/* Lilac Flow Action Buttons: Flashcard & Quiz */}
                  <div className="pt-5 mt-5 border-t border-black/[0.04] flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setActiveSetId(set.id);
                        setActiveMode('flashcard');
                      }}
                      className="flex-1 py-2.5 px-3 text-xs font-medium text-[#1F1F28] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] rounded-full transition-all text-center cursor-pointer active:scale-98"
                    >
                      Thẻ ghi nhớ
                    </button>

                    <button
                      onClick={() => {
                        setActiveSetId(set.id);
                        setActiveMode('quiz');
                      }}
                      style={{
                        backgroundColor: '#5B2DFF',
                        boxShadow: '0 6px 16px rgba(91, 45, 255, 0.35)',
                      }}
                      className="flex-1 py-2.5 px-3 text-xs font-semibold text-white rounded-full transition-all text-center cursor-pointer hover:scale-[1.02] active:scale-98"
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
};
