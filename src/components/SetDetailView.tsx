import React, { useState } from 'react';
import {
  ArrowLeft,
  Layers,
  Sparkles,
  HelpCircle,
  Puzzle,
  PenTool,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  Volume2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  Search,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { StudySet, Course, Question, StudyMode } from '../types';
import { speakText } from '../lib/speech';

interface SetDetailViewProps {
  studySet: StudySet;
  course?: Course;
  onBack: () => void;
  onLaunchMode: (mode: StudyMode) => void;
  onOpenAddQuestion: () => void;
  onOpenEditQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onToggleStar: (qId: string) => void;
  onToggleMaster: (qId: string) => void;
  onOpenImportModal: () => void;
  onOpenEditSet: () => void;
  onDeleteSet: () => void;
}

export const SetDetailView: React.FC<SetDetailViewProps> = ({
  studySet,
  course,
  onBack,
  onLaunchMode,
  onOpenAddQuestion,
  onOpenEditQuestion,
  onDeleteQuestion,
  onToggleStar,
  onToggleMaster,
  onOpenImportModal,
  onOpenEditSet,
  onDeleteSet
}) => {
  const [search, setSearch] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const filteredQuestions = studySet.questions.filter(q => {
    const qText = `${q.prompt} ${q.correctAnswer} ${q.explanation || ''}`.toLowerCase();
    return qText.includes(search.toLowerCase());
  });

  const masteredCount = studySet.questions.filter(q => q.mastered).length;
  const starredCount = studySet.questions.filter(q => q.starred).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Back button & Action pills */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          style={{
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#1F1F28] bg-white border border-black/[0.06] rounded-full hover:bg-[#F3EFE6] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#5B2DFF]" />
          <span>Quay lại trang chính</span>
        </button>

        {/* Set actions: Edit / Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEditSet}
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] hover:bg-black/5 rounded-full transition-colors border border-black/[0.05] bg-white cursor-pointer"
            title="Sửa thông tin bộ thẻ"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn xóa bộ thẻ "${studySet.title}"?`)) {
                onDeleteSet();
              }
            }}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors border border-black/[0.05] bg-white cursor-pointer"
            title="Xóa bộ thẻ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Set Header Hero Card */}
      <div
        style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
        }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] space-y-4"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8E93]">
          <span className="font-semibold px-2.5 py-0.5 rounded-full text-[10px] bg-[#C8B4FF]/25 text-[#5B2DFF] border border-[#5B2DFF]/20">
            {course?.code || 'Học phần'}
          </span>
          <span aria-hidden="true">&bull;</span>
          <span>{course?.name || 'Môn học chung'}</span>
          <span aria-hidden="true">&bull;</span>
          <span>{studySet.questions.length} câu hỏi</span>
        </div>

        <div>
          <h1 className="font-flow-serif text-2xl sm:text-3xl font-normal text-[#1F1F28] tracking-tight leading-snug">
            {studySet.title}
          </h1>
          {studySet.description && (
            <p className="text-xs sm:text-sm text-[#8E8E93] font-light mt-1.5 max-w-3xl leading-relaxed">
              {studySet.description}
            </p>
          )}
        </div>

        {/* Quick Progress Indicator */}
        <div className="flex items-center gap-6 pt-3 border-t border-black/[0.04] text-xs">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{masteredCount} câu đã thuộc</span>
          </div>
          <div className="flex items-center gap-2 text-amber-700">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">{starredCount} câu cần lưu ý</span>
          </div>
        </div>
      </div>

      {/* 4 Chế độ học tập (Lilac Flow Learning Modes Grid) */}
      <div className="space-y-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E8E93]">
          CHẾ ĐỘ RÈN LUYỆN KIẾN THỨC
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Flashcards */}
          <button
            onClick={() => onLaunchMode('flashcard')}
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
            }}
            className="p-6 rounded-3xl border border-black/[0.04] hover:border-[#5B2DFF]/30 bg-white hover:bg-[#FCFAF6] text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div
              style={{
                boxShadow: '0 6px 16px rgba(91, 45, 255, 0.25)',
              }}
              className="w-10 h-10 rounded-2xl bg-[#5B2DFF] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform"
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1F1F28] text-sm group-hover:text-[#5B2DFF] transition-colors">
                Thẻ ghi nhớ (Flashcards)
              </h3>
              <p className="text-xs text-[#8E8E93] font-light mt-1">
                Lật thẻ 3D, hỗ trợ phím tắt và phát âm từ vựng.
              </p>
            </div>
          </button>

          {/* 2. Quiz */}
          <button
            onClick={() => onLaunchMode('quiz')}
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
            }}
            className="p-6 rounded-3xl border border-black/[0.04] hover:border-[#5B2DFF]/30 bg-white hover:bg-[#FCFAF6] text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div
              style={{
                boxShadow: '0 6px 16px rgba(91, 45, 255, 0.25)',
              }}
              className="w-10 h-10 rounded-2xl bg-[#5B2DFF] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform"
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1F1F28] text-sm group-hover:text-[#5B2DFF] transition-colors">
                Kiểm tra trắc nghiệm (Quiz)
              </h3>
              <p className="text-xs text-[#8E8E93] font-light mt-1">
                Phản hồi giải thích chi tiết, ví dụ và mẹo nhớ tức thì.
              </p>
            </div>
          </button>

          {/* 3. Match Game */}
          <button
            onClick={() => onLaunchMode('match')}
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
            }}
            className="p-6 rounded-3xl border border-black/[0.04] hover:border-amber-400/40 bg-white hover:bg-[#FCFAF6] text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div
              style={{
                boxShadow: '0 6px 16px rgba(245, 158, 11, 0.25)',
              }}
              className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform"
            >
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1F1F28] text-sm group-hover:text-amber-600 transition-colors">
                Ghép thẻ (Match Game)
              </h3>
              <p className="text-xs text-[#8E8E93] font-light mt-1">
                Nối thuật ngữ và định nghĩa tính thời gian thi đua.
              </p>
            </div>
          </button>

          {/* 4. Write Mode */}
          <button
            onClick={() => onLaunchMode('write')}
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
            }}
            className="p-6 rounded-3xl border border-black/[0.04] hover:border-sky-400/40 bg-white hover:bg-[#FCFAF6] text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div
              style={{
                boxShadow: '0 6px 16px rgba(14, 165, 233, 0.25)',
              }}
              className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform"
            >
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1F1F28] text-sm group-hover:text-sky-600 transition-colors">
                Luyện viết (Write)
              </h3>
              <p className="text-xs text-[#8E8E93] font-light mt-1">
                Gõ đáp án rèn luyện khả năng hồi tưởng kiến thức chủ động.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Danh sách câu hỏi trong bộ thẻ & Quản lý */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E8E93]">
              CÂU HỎI TRONG BỘ THẺ ({studySet.questions.length})
            </span>
            <h2 className="text-lg font-bold text-[#1F1F28]">Danh sách câu hỏi &amp; Giải thích chi tiết</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenImportModal}
              style={{
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#5B2DFF] bg-[#FCFAF6] hover:bg-[#F3EFE6] rounded-full border border-black/[0.06] transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập file vào bộ này</span>
            </button>

            <button
              onClick={onOpenAddQuestion}
              style={{
                backgroundColor: '#5B2DFF',
                boxShadow: '0 6px 16px rgba(91, 45, 255, 0.35)',
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-full transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm câu hỏi</span>
            </button>
          </div>
        </div>

        {/* Pill Search bar inside questions */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-[#8E8E93]">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi, đáp án hoặc giải thích..."
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.025)',
            }}
            className="w-full pl-11 pr-4 py-3 bg-[#FCFAF6] border border-black/[0.05] rounded-full text-xs text-[#1F1F28] placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#5B2DFF]/40 focus:border-[#5B2DFF]"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div
              style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
              }}
              className="p-12 text-center bg-white rounded-3xl border border-black/[0.04] text-[#8E8E93] text-xs space-y-3"
            >
              <Layers className="w-8 h-8 text-[#C8B4FF] mx-auto" />
              <div className="font-semibold text-[#1F1F28] text-sm">
                {search ? 'Không tìm thấy câu hỏi phù hợp với từ khóa.' : 'Bộ thẻ này hiện chưa có câu hỏi nào.'}
              </div>
              <p className="max-w-md mx-auto text-[#8E8E93] font-light leading-relaxed">
                Hãy thêm câu hỏi thủ công hoặc tải lên file Excel/CSV/JSON có sẵn để bắt đầu học ngay.
              </p>
              {!search && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onOpenAddQuestion}
                    style={{
                      backgroundColor: '#5B2DFF',
                      boxShadow: '0 6px 16px rgba(91, 45, 255, 0.35)',
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-full transition-transform hover:scale-102 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu hỏi đầu tiên</span>
                  </button>
                  <button
                    onClick={onOpenImportModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#1F1F28] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] rounded-full transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5B2DFF]" />
                    <span>Tải file Excel / CSV vào bộ này</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  style={{
                    boxShadow: '0 6px 20px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.02)',
                  }}
                  className="bg-white rounded-3xl border border-black/[0.04] hover:border-[#5B2DFF]/20 transition-all overflow-hidden"
                >
                  <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 w-full">
                      <span className="w-7 h-7 rounded-full bg-[#FCFAF6] border border-black/[0.05] text-[#8E8E93] text-xs font-mono font-medium flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      <div className="space-y-2 w-full">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-[#5B2DFF] text-[11px] px-2.5 py-0.5 rounded-full bg-[#C8B4FF]/25 border border-[#5B2DFF]/15">
                            {q.type === 'multiple_choice' && 'Trắc nghiệm 4 đáp án'}
                            {q.type === 'fill_blank' && 'Điền từ'}
                            {q.type === 'matching' && 'Nối khái niệm'}
                            {q.type === 'ordering' && 'Sắp xếp thứ tự'}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-[#1F1F28] leading-snug">
                          {q.prompt}
                        </h4>

                        <div className="text-xs pt-0.5">
                          <span className="text-[#8E8E93]">Đáp án đúng: </span>
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {q.correctAnswer}
                          </span>
                        </div>

                        {/* Collapsible in-depth feedback card */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-black/[0.04] space-y-2.5 text-xs text-[#1F1F28] animate-in fade-in duration-200">
                            {q.explanation && (
                              <div className="bg-[#FCFAF6] p-4 rounded-2xl border border-black/[0.04] space-y-1">
                                <div className="font-semibold text-[#1F1F28] flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-[#5B2DFF]" />
                                  <span>Lý do giải thích</span>
                                </div>
                                <p className="leading-relaxed text-[#8E8E93] font-light">{q.explanation}</p>
                              </div>
                            )}

                            {(q.example || q.memoryTip) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {q.example && (
                                  <div className="bg-sky-50/60 p-3 rounded-2xl border border-sky-100 text-sky-950">
                                    <div className="font-semibold text-sky-900 flex items-center gap-1 mb-0.5">
                                      <BookOpen className="w-3 h-3 text-sky-600" />
                                      <span>Ví dụ minh họa</span>
                                    </div>
                                    <p className="text-[11px] text-sky-800 font-light">{q.example}</p>
                                  </div>
                                )}
                                {q.memoryTip && (
                                  <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 text-amber-950">
                                    <div className="font-semibold text-amber-900 flex items-center gap-1 mb-0.5">
                                      <Lightbulb className="w-3 h-3 text-amber-600" />
                                      <span>Mẹo ghi nhớ</span>
                                    </div>
                                    <p className="text-[11px] text-amber-800 font-light">{q.memoryTip}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => speakText(q.prompt)}
                        className="p-1.5 text-[#8E8E93] hover:text-[#5B2DFF] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStar(q.id)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          q.starred
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-[#8E8E93] hover:text-amber-500 hover:bg-black/5'
                        }`}
                        title="Đánh dấu sao câu khó"
                      >
                        <Star className={`w-4 h-4 ${q.starred ? 'fill-amber-500' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEditQuestion(q)}
                        className="p-1.5 text-[#8E8E93] hover:text-[#1F1F28] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Xóa câu hỏi này?')) {
                            onDeleteQuestion(q.id);
                          }
                        }}
                        className="p-1.5 text-[#8E8E93] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="p-1.5 text-[#8E8E93] hover:text-[#1F1F28] hover:bg-black/5 rounded-full transition-colors ml-1 cursor-pointer"
                        title={isExpanded ? 'Thu gọn' : 'Xem giải thích chi tiết'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
