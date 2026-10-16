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
  ArrowRight
} from 'lucide-react';
import { StudySet, Course, Question, StudyMode } from '../types';
import { speakText } from '../lib/speech';
import { sound } from '../lib/sound';

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

  const handleLaunch = (mode: StudyMode) => {
    sound.playClick();
    onLaunchMode(mode);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-200">
      {/* Back button & Action buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/10 rounded-xl hover:bg-white transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#007afc]" />
          <span>Quay lại trang chính</span>
        </button>

        {/* Set actions: Edit / Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenEditSet();
            }}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/10 transition cursor-pointer"
            title="Sửa thông tin bộ thẻ"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              if (window.confirm(`Bạn có chắc muốn xóa bộ thẻ "${studySet.title}"?`)) {
                onDeleteSet();
              }
            }}
            className="p-2 text-rose-500 hover:text-rose-700 rounded-xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/10 transition cursor-pointer"
            title="Xóa bộ thẻ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Set Header Hero Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span
            className="font-bold px-2.5 py-0.5 rounded-full text-[10px] text-white"
            style={{ backgroundColor: course?.color || '#007afc' }}
          >
            {course?.code || 'Học phần'}
          </span>
          <span aria-hidden="true">&bull;</span>
          <span>{course?.name || 'Môn học chung'}</span>
          <span aria-hidden="true">&bull;</span>
          <span>{studySet.questions.length} câu hỏi</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {studySet.title}
          </h1>
          {studySet.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
              {studySet.description}
            </p>
          )}
        </div>

        {/* Quick Progress Indicator */}
        <div className="flex items-center gap-6 pt-3 border-t border-slate-200/50 dark:border-white/5 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">{masteredCount} câu đã thuộc</span>
          </div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="font-semibold">{starredCount} câu cần lưu ý</span>
          </div>
        </div>
      </div>

      {/* 4 Chế độ học tập (Neo-Modern Learning Modes Grid) */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          CHẾ ĐỘ RÈN LUYỆN KIẾN THỨC
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Flashcards */}
          <button
            onClick={() => handleLaunch('flashcard')}
            className="p-6 rounded-3xl glass-card hover:border-[#007afc]/40 text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#007afc] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md shadow-sky-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#007afc] transition-colors">
                Thẻ ghi nhớ (Flashcards)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lật thẻ, xáo trộn tự động và phát âm từ vựng.
              </p>
            </div>
          </button>

          {/* 2. Quiz */}
          <button
            onClick={() => handleLaunch('quiz')}
            className="p-6 rounded-3xl glass-card hover:border-[#007afc]/40 text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0a2540] dark:bg-sky-950 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#007afc] transition-colors">
                Kiểm tra trắc nghiệm (Quiz)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Phím tắt 1-4, giải thích chi tiết và âm thanh micro.
              </p>
            </div>
          </button>

          {/* 3. Match Game */}
          <button
            onClick={() => handleLaunch('match')}
            className="p-6 rounded-3xl glass-card hover:border-amber-400/40 text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md shadow-amber-500/30">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 transition-colors">
                Ghép thẻ (Match Game)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Nối thuật ngữ và định nghĩa tính thời gian thi đua.
              </p>
            </div>
          </button>

          {/* 4. Write Mode */}
          <button
            onClick={() => handleLaunch('write')}
            className="p-6 rounded-3xl glass-card hover:border-purple-400/40 text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/30">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-purple-600 transition-colors">
                Luyện viết (Write)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gõ đáp án rèn luyện hồi tưởng kiến thức chủ động.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Danh sách câu hỏi trong bộ thẻ & Quản lý */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DANH SÁCH THẺ ({filteredQuestions.length})
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chi tiết từng câu hỏi &amp; thuật ngữ</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenAddQuestion();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm câu hỏi</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenImportModal();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-white/10 hover:bg-white border border-white/60 dark:border-white/10 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#007afc]" />
              <span>Nhập file</span>
            </button>
          </div>
        </div>

        {/* Filter input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung câu hỏi hoặc đáp án..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007afc]/40"
          />
        </div>

        {/* Questions list */}
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="glass-card rounded-2xl p-4 sm:p-5 transition hover:border-[#007afc]/30 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-mono font-bold flex items-center justify-center shrink-0 text-slate-500">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                        {q.prompt}
                      </p>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {q.correctAnswer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onToggleStar(q.id);
                      }}
                      className={`p-1.5 rounded-lg transition ${
                        q.starred ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:text-amber-500'
                      }`}
                      title="Đánh dấu sao"
                    >
                      <Star className={`w-4 h-4 ${q.starred ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onToggleMaster(q.id);
                      }}
                      className={`p-1.5 rounded-lg transition ${
                        q.mastered ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-400 hover:text-emerald-500'
                      }`}
                      title="Đã thành thạo"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${q.mastered ? 'fill-emerald-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => speakText(q.prompt)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 transition"
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenEditQuestion(q);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                      title="Sửa câu hỏi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (window.confirm('Xóa câu hỏi này?')) {
                          onDeleteQuestion(q.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Explanation preview if available */}
                {q.explanation && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/40 dark:border-white/5">
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
