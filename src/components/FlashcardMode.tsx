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
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        handlePrev();
      } else if (e.code === 'KeyS' && currentQ) {
        onToggleStar(currentQ.id);
      } else if (e.code === 'KeyM' && currentQ) {
        onToggleMaster(currentQ.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentQ, onToggleStar, onToggleMaster]);

  if (total === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EDE8FF] text-[#5B2DFF] flex items-center justify-center">
          <BookOpen className="w-8 h-8 stroke-[2]" />
        </div>
        <h3 className="font-flow-serif text-2xl font-normal text-[#1F1F28]">Không có thẻ nào phù hợp</h3>
        <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
          {filterStarredOnly
            ? 'Bạn chưa đánh dấu sao cho câu hỏi nào trong bộ thẻ này.'
            : 'Bộ thẻ hiện chưa có câu hỏi nào. Hãy thêm câu hỏi mới hoặc nhập file Excel.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {filterStarredOnly && (
            <button
              onClick={() => setFilterStarredOnly(false)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#5B2DFF] shadow-[0_8px_20px_rgba(91,45,255,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Xem tất cả thẻ
            </button>
          )}
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-[#1F1F28] bg-white border border-black/[0.06] hover:bg-[#F3EFE6] transition-all cursor-pointer"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] bg-white border border-black/[0.06] rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Quay lại bộ thẻ"
          >
            <ArrowLeft className="w-4 h-4 text-[#5B2DFF]" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#8E8E93]">
              <span className="uppercase tracking-wider">Flashcard 3D</span>
              <span aria-hidden="true">&bull;</span>
              <span className="text-[#1F1F28] font-semibold truncate max-w-[180px] sm:max-w-xs">{studySet.title}</span>
            </div>
            <h2 className="font-flow-serif text-lg sm:text-xl font-normal text-[#1F1F28]">
              Thẻ {currentIndex + 1} <span className="text-[#8E8E93] font-sans text-sm">/ {total}</span>
            </h2>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStarredOnly(!filterStarredOnly)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterStarredOnly
                ? 'bg-[#5B2DFF] text-white shadow-[0_4px_14px_rgba(91,45,255,0.35)]'
                : 'text-[#8E8E93] hover:text-[#1F1F28] bg-white border border-black/[0.06] hover:bg-[#F3EFE6]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterStarredOnly ? 'fill-white text-white' : ''}`} />
            <span className="hidden sm:inline">Chỉ câu đánh dấu</span>
          </button>

          <button
            onClick={handleShuffle}
            title="Xáo trộn thứ tự thẻ"
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] bg-white border border-black/[0.06] rounded-full hover:bg-[#F3EFE6] transition-all cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar with Lilac Gradient */}
      <div className="w-full bg-[#EDE8FF] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #C8B4FF 0%, #5B2DFF 100%)',
            boxShadow: '0 0 8px rgba(91, 45, 255, 0.4)'
          }}
        />
      </div>

      {/* Main Flashcard with 3D Flip (Lilac Flow Styling) */}
      <div className="perspective-1000 min-h-[380px] sm:min-h-[440px] w-full">
        <div
          onClick={handleFlip}
          style={{
            boxShadow: '0 16px 40px rgba(91, 45, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
          className={`relative w-full h-full min-h-[380px] sm:min-h-[440px] rounded-3xl cursor-pointer transition-transform duration-500 transform-style-3d select-none border border-black/[0.05] bg-white ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* MẶT TRƯỚC (FRONT) */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between backface-hidden rounded-3xl bg-white">
            <div className="flex items-center justify-between text-xs text-[#8E8E93]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDE8FF] text-[#5B2DFF] border border-[#5B2DFF]/15">
                <Sparkles className="w-3 h-3" /> Thuật ngữ / Câu hỏi
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentQ.prompt);
                  }}
                  className="w-8 h-8 rounded-full bg-[#FCFAF6] hover:bg-[#EDE8FF] text-[#8E8E93] hover:text-[#5B2DFF] flex items-center justify-center transition-colors cursor-pointer"
                  title="Phát âm (Phím A)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(currentQ.id);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    currentQ.starred
                      ? 'bg-amber-50 text-amber-500 shadow-xs'
                      : 'bg-[#FCFAF6] hover:bg-amber-50 text-[#8E8E93] hover:text-amber-500'
                  }`}
                  title="Đánh dấu câu khó (Phím S)"
                >
                  <Star className={`w-4 h-4 ${currentQ.starred ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="my-auto py-6 text-center space-y-4">
              <h3 className="font-flow-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#1F1F28] leading-[1.3] max-w-2xl mx-auto">
                {currentQ.prompt}
              </h3>

              {currentQ.options && currentQ.options.length > 0 && (
                <div className="pt-2 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {currentQ.options.map((opt, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 bg-[#FCFAF6] border border-black/[0.05] rounded-full text-xs text-[#1F1F28] font-medium"
                    >
                      <span className="text-[#5B2DFF] font-semibold mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hint to flip */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#8E8E93] font-medium">
              <RotateCw className="w-3.5 h-3.5 text-[#5B2DFF]" />
              <span>Chạm thẻ hoặc nhấn phím cách để lật đáp án</span>
            </div>
          </div>

          {/* MẶT SAU (BACK) */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-[#FCFAF6] to-white border border-[#C8B4FF]/30">
            <div className="flex items-center justify-between text-xs text-[#8E8E93]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Đáp án chuẩn xác
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentQ.correctAnswer);
                  }}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#EDE8FF] text-[#8E8E93] hover:text-[#5B2DFF] flex items-center justify-center transition-colors cursor-pointer border border-black/[0.05]"
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
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    currentQ.mastered
                      ? 'bg-[#5B2DFF] text-white shadow-[0_4px_14px_rgba(91,45,255,0.35)]'
                      : 'bg-white hover:bg-emerald-50 text-[#8E8E93] hover:text-emerald-700 border border-black/[0.06]'
                  }`}
                  title="Đánh dấu đã thuộc vững (Phím M)"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentQ.mastered ? 'Đã thuộc' : 'Thuộc'}</span>
                </button>
              </div>
            </div>

            {/* Answer & Explanation Details */}
            <div className="my-auto py-4 space-y-4 max-w-2xl mx-auto w-full">
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8E8E93] mb-1">
                  ĐÁP ÁN CHÍNH XÁC
                </p>
                <h3 className="font-flow-serif text-2xl sm:text-3xl font-medium text-[#5B2DFF] leading-snug">
                  {currentQ.correctAnswer}
                </h3>
              </div>

              {/* Giải thích chi tiết */}
              {currentQ.explanation && (
                <div className="bg-white/90 rounded-2xl p-4 border border-[#5B2DFF]/15 shadow-[0_4px_12px_rgba(91,45,255,0.03)] space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B2DFF] uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Giải thích vì sao:</span>
                  </div>
                  <p className="text-xs text-[#1F1F28] leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Mẹo ghi nhớ & Ví dụ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {currentQ.memoryTip && (
                  <div className="bg-[#EDE8FF]/50 rounded-2xl p-3 border border-[#C8B4FF]/40 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#5B2DFF]">
                      <Lightbulb className="w-3 h-3" />
                      <span>Mẹo nhớ nhanh</span>
                    </div>
                    <p className="text-[11px] text-[#1F1F28] leading-relaxed">
                      {currentQ.memoryTip}
                    </p>
                  </div>
                )}

                {currentQ.example && (
                  <div className="bg-white rounded-2xl p-3 border border-black/[0.06] space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#8E8E93]">
                      <BookOpen className="w-3 h-3 text-[#5B2DFF]" />
                      <span>Ví dụ minh họa</span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] italic leading-relaxed">
                      "{currentQ.example}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hint to flip back */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#8E8E93] font-medium">
              <RotateCw className="w-3.5 h-3.5 text-[#5B2DFF]" />
              <span>Chạm để quay lại mặt câu hỏi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Pill Navigation Controls (Lilac Flow Design) */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#1F1F28] bg-white border border-black/[0.06] hover:bg-[#F3EFE6] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#5B2DFF] transition-transform group-hover:-translate-x-0.5" />
          <span>Thẻ trước</span>
        </button>

        {/* Center Flip Button (Violet Glowing Pill) */}
        <button
          onClick={handleFlip}
          style={{
            backgroundColor: '#5B2DFF',
            boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
          }}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <RotateCw className="w-4 h-4 stroke-[2.2]" />
          <span>Lật thẻ</span>
        </button>

        <button
          onClick={handleNext}
          style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#1F1F28] bg-white border border-black/[0.06] hover:bg-[#F3EFE6] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Thẻ tiếp theo</span>
          <ChevronRight className="w-4 h-4 text-[#5B2DFF] transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-[11px] text-[#8E8E93] flex flex-wrap items-center justify-center gap-3 pt-2">
        <span><kbd className="px-2 py-0.5 bg-white border border-black/[0.08] rounded-md font-mono text-[10px]">Phím cách</kbd> Lật thẻ</span>
        <span>&bull;</span>
        <span><kbd className="px-2 py-0.5 bg-white border border-black/[0.08] rounded-md font-mono text-[10px]">&larr;</kbd> <kbd className="px-2 py-0.5 bg-white border border-black/[0.08] rounded-md font-mono text-[10px]">&rarr;</kbd> Điều hướng</span>
        <span>&bull;</span>
        <span><kbd className="px-2 py-0.5 bg-white border border-black/[0.08] rounded-md font-mono text-[10px]">S</kbd> Đánh dấu sao</span>
        <span>&bull;</span>
        <span><kbd className="px-2 py-0.5 bg-white border border-black/[0.08] rounded-md font-mono text-[10px]">A</kbd> Phát âm</span>
      </div>
    </div>
  );
};
