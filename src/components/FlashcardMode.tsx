import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCw,
  Volume2,
  Star,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { StudySet, Question } from '../types';
import { speakText } from '../lib/speech';

interface FlashcardModeProps {
  studySet: StudySet;
  onBack: () => void;
  onToggleStar: (questionId: string) => void;
  onToggleMaster: (questionId: string) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  studySet,
  onBack,
  onToggleStar,
  onToggleMaster
}) => {
  const [questions, setQuestions] = useState<Question[]>(() => [...studySet.questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterStarredOnly, setFilterStarredOnly] = useState(false);

  // Đồng bộ danh sách câu hỏi khi bộ thẻ hoặc danh sách câu hỏi thay đổi
  useEffect(() => {
    setQuestions([...studySet.questions]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [studySet.id, studySet.questions]);

  // Lọc theo câu hỏi đánh dấu sao nếu người dùng bật
  const activeQuestions = filterStarredOnly
    ? questions.filter(q => q.starred)
    : questions;

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];
  const total = activeQuestions.length;

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setCurrentIndex(0);
  };

  // Hỗ trợ phím tắt bàn phím tiện lợi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 's' || e.key === 'S') {
        if (currentQ) onToggleStar(currentQ.id);
      } else if (e.key === 'a' || e.key === 'A') {
        if (currentQ) {
          const textToSpeak = isFlipped ? currentQ.correctAnswer : currentQ.prompt;
          speakText(textToSpeak);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentQ, isFlipped, onToggleStar]);

  if (total === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm text-slate-500">
          {filterStarredOnly
            ? 'Chưa có câu hỏi nào được đánh dấu sao trong bộ thẻ này.'
            : 'Bộ thẻ này hiện chưa có câu hỏi nào.'}
        </p>
        <div className="flex justify-center gap-3">
          {filterStarredOnly && (
            <button
              onClick={() => setFilterStarredOnly(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            >
              Xem tất cả câu hỏi
            </button>
          )}
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Quay lại bộ thẻ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Thẻ ghi nhớ</span>
              <span aria-hidden="true">·</span>
              <span>{studySet.title}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Thẻ {currentIndex + 1} / {total}
            </h2>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStarredOnly(!filterStarredOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStarredOnly
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterStarredOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Chỉ câu đánh dấu sao</span>
          </button>

          <button
            onClick={handleShuffle}
            title="Xáo trộn câu hỏi"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Flashcard with 3D Flip */}
      <div className="perspective-1000 min-h-[380px] sm:min-h-[440px] w-full">
        <div
          onClick={handleFlip}
          className={`relative w-full h-full min-h-[380px] sm:min-h-[440px] rounded-2xl cursor-pointer transition-transform duration-500 transform-style-3d select-none shadow-md border border-slate-200 bg-white ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* MẶT TRƯỚC (FRONT) */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between backface-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-indigo-600">
                Mặt câu hỏi / Thuật ngữ
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentQ.prompt);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Phát âm câu hỏi (Phím A)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(currentQ.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentQ.starred
                      ? 'text-amber-500 bg-amber-50'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'
                  }`}
                  title="Đánh dấu câu khó (Phím S)"
                >
                  <Star className={`w-4 h-4 ${currentQ.starred ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="my-auto py-6 text-center">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug tracking-tight max-w-2xl mx-auto">
                {currentQ.prompt}
              </h3>

              {currentQ.options && currentQ.options.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {currentQ.options.map((opt, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium"
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hint to flip */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm hoặc bấm Phím cách để lật đáp án</span>
            </div>
          </div>

          {/* MẶT SAU (BACK) */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-b from-indigo-50/40 via-white to-white">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Đáp án &amp; Giải thích chi tiết
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentQ.correctAnswer);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Phát âm đáp án"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMaster(currentQ.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentQ.mastered
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                  title="Đánh dấu đã thuộc"
                >
                  <CheckCircle2 className={`w-4 h-4 ${currentQ.mastered ? 'fill-emerald-100' : ''}`} />
                </button>
              </div>
            </div>

            {/* Answer and In-depth explanation card */}
            <div className="my-auto py-3 space-y-4 max-h-[290px] overflow-y-auto pr-1">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Đáp án chính xác
                </span>
                <div className="text-xl sm:text-2xl font-bold text-indigo-900 mt-1">
                  {currentQ.correctAnswer}
                </div>
              </div>

              {currentQ.explanation && (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-left text-xs text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    Lý do giải thích
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {(currentQ.example || currentQ.memoryTip) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs">
                  {currentQ.example && (
                    <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 text-sky-950">
                      <div className="font-semibold text-sky-900 flex items-center gap-1 mb-0.5">
                        <BookOpen className="w-3 h-3 text-sky-600" />
                        Ví dụ minh họa
                      </div>
                      <p className="text-[11px] leading-relaxed">{currentQ.example}</p>
                    </div>
                  )}

                  {currentQ.memoryTip && (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-amber-950">
                      <div className="font-semibold text-amber-900 flex items-center gap-1 mb-0.5">
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                        Mẹo ghi nhớ (Mnemonic)
                      </div>
                      <p className="text-[11px] leading-relaxed">{currentQ.memoryTip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Flip back hint */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm để lật lại câu hỏi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Câu trước</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onToggleMaster(currentQ.id);
              handleNext();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentQ.mastered
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {currentQ.mastered ? 'Đã thành thạo' : 'Đánh dấu đã thuộc'}
            </span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-xs font-semibold text-white transition-colors shadow-xs shadow-indigo-200"
        >
          <span className="hidden sm:inline">Câu tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcut Hints for Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-6 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Space</kbd> Lật thẻ</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">← / →</kbd> Chuyển câu</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">S</kbd> Đánh dấu sao</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">A</kbd> Nghe phát âm</span>
      </div>
    </div>
  );
};
