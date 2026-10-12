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
  Search
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
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chính</span>
        </button>

        {/* Set actions: Edit / Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEditSet}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Sửa thông tin bộ thẻ"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn xóa bộ thẻ "${studySet.title}"?`)) {
                onDeleteSet();
              }
            }}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
            title="Xóa bộ thẻ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Set Header Hero */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-indigo-600">{course?.code || 'Học phần'}</span>
          <span aria-hidden="true">·</span>
          <span>{course?.name || 'Môn học chung'}</span>
          <span aria-hidden="true">·</span>
          <span>{studySet.questions.length} câu hỏi</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {studySet.title}
          </h1>
          {studySet.description && (
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              {studySet.description}
            </p>
          )}
        </div>

        {/* Quick Progress Indicator */}
        <div className="flex items-center gap-6 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{masteredCount} câu đã thuộc</span>
          </div>
          <div className="flex items-center gap-2 text-amber-700">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{starredCount} câu cần lưu ý</span>
          </div>
        </div>
      </div>

      {/* 4 Chế độ học tập (Learning Modes Grid) */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Chọn chế độ học tập
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Flashcards */}
          <button
            onClick={() => onLaunchMode('flashcard')}
            className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 text-left transition-all group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                Thẻ ghi nhớ (Flashcards)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lật thẻ 3D, hỗ trợ phím tắt và phát âm từ vựng.
              </p>
            </div>
          </button>

          {/* 2. Quiz */}
          <button
            onClick={() => onLaunchMode('quiz')}
            className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-left transition-all group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                Kiểm tra trắc nghiệm (Quiz)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Phản hồi giải thích chi tiết, ví dụ và mẹo nhớ tức thì.
              </p>
            </div>
          </button>

          {/* 3. Match Game */}
          <button
            onClick={() => onLaunchMode('match')}
            className="p-5 rounded-2xl border border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/20 text-left transition-all group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                Ghép thẻ (Match Game)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Nối thuật ngữ và định nghĩa tính thời gian thi đua.
              </p>
            </div>
          </button>

          {/* 4. Write Mode */}
          <button
            onClick={() => onLaunchMode('write')}
            className="p-5 rounded-2xl border border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50/20 text-left transition-all group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-700 transition-colors">
                Luyện viết (Write)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
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
            <h2 className="text-base font-bold text-slate-900">
              Danh sách câu hỏi ({studySet.questions.length})
            </h2>
            <p className="text-xs text-slate-500">
              Bạn có thể thêm thủ công, chỉnh sửa hoặc import từ Excel/CSV
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập file vào bộ này</span>
            </button>

            <button
              onClick={onOpenAddQuestion}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm câu hỏi</span>
            </button>
          </div>
        </div>

        {/* Search bar inside questions */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi, đáp án hoặc giải thích trong bộ này..."
            className="w-full pl-9.5 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-3">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700 text-sm">
                {search ? 'Không tìm thấy câu hỏi phù hợp với từ khóa.' : 'Bộ thẻ này hiện chưa có câu hỏi nào.'}
              </div>
              <p className="max-w-md mx-auto text-slate-400">
                Hãy thêm câu hỏi thủ công hoặc tải lên file Excel/CSV/JSON có sẵn để bắt đầu học ngay.
              </p>
              {!search && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onOpenAddQuestion}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu hỏi đầu tiên</span>
                  </button>
                  <button
                    onClick={onOpenImportModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
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
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden shadow-2xs"
                >
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 w-full">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      <div className="space-y-1.5 w-full">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-indigo-600 text-[11px]">
                            {q.type === 'multiple_choice' && 'Trắc nghiệm 4 đáp án'}
                            {q.type === 'fill_blank' && 'Điền từ'}
                            {q.type === 'matching' && 'Nối khái niệm'}
                            {q.type === 'ordering' && 'Sắp xếp thứ tự'}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                          {q.prompt}
                        </h4>

                        <div className="text-xs pt-1">
                          <span className="text-slate-400">Đáp án đúng: </span>
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {q.correctAnswer}
                          </span>
                        </div>

                        {/* Collapsible in-depth feedback */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 animate-in fade-in duration-200">
                            {q.explanation && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Lý do giải thích</span>
                                </div>
                                <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                              </div>
                            )}

                            {(q.example || q.memoryTip) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                {q.example && (
                                  <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100 text-sky-950">
                                    <div className="font-bold text-sky-900 flex items-center gap-1 mb-0.5">
                                      <BookOpen className="w-3 h-3 text-sky-600" />
                                      <span>Ví dụ minh họa</span>
                                    </div>
                                    <p>{q.example}</p>
                                  </div>
                                )}
                                {q.memoryTip && (
                                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-amber-950">
                                    <div className="font-bold text-amber-900 flex items-center gap-1 mb-0.5">
                                      <Lightbulb className="w-3 h-3 text-amber-600" />
                                      <span>Mẹo ghi nhớ</span>
                                    </div>
                                    <p>{q.memoryTip}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions on this question */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => speakText(q.prompt)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStar(q.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          q.starred
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                        }`}
                        title="Đánh dấu sao câu khó"
                      >
                        <Star className={`w-4 h-4 ${q.starred ? 'fill-amber-500' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEditQuestion(q)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
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
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
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
