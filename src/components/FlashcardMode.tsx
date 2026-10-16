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
  Lightbulb,
  BookOpen,
  Sparkles,
  HelpCircle,
  Keyboard,
  Filter
} from 'lucide-react';
import { StudySet, Question } from '../types';
import { speakText } from '../lib/speech';
import { sound } from '../lib/sound';

interface FlashcardModeProps {
  studySet: StudySet;
  onBack: () => void;
  onToggleStar: (questionId: string) => void;
  onToggleMaster: (questionId: string) => void;
}

type SpacedFilter = 'all' | 'starred' | 'mastered' | 'mistaken';

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  studySet,
  onBack,
  onToggleStar,
  onToggleMaster
}) => {
  const [cards, setCards] = useState<Question[]>(() => [...studySet.questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoShuffle, setIsAutoShuffle] = useState(false);
  const [filterMode, setFilterMode] = useState<SpacedFilter>('all');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Sync cards when studySet questions change
  useEffect(() => {
    setCards([...studySet.questions]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [studySet.id, studySet.questions]);

  // Robust Fisher-Yates Shuffle Algorithm
  const shuffleCards = useCallback((arr: Question[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  // Filter cards based on Spaced Repetition selector
  const activeCards = React.useMemo(() => {
    let result = cards;
    if (filterMode === 'starred') {
      result = cards.filter(c => c.starred);
    } else if (filterMode === 'mastered') {
      result = cards.filter(c => c.mastered);
    } else if (filterMode === 'mistaken') {
      result = cards.filter(c => c.lastAnsweredCorrect === false);
    }
    return result;
  }, [cards, filterMode]);

  const currentQ = activeCards[currentIndex] || activeCards[0];
  const total = activeCards.length;

  const handleFlip = useCallback(() => {
    sound.playFlip();
    setIsFlipped(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    sound.playClick();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    sound.playClick();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  const handleToggleShuffle = () => {
    sound.playClick();
    if (!isAutoShuffle) {
      setCards(prev => shuffleCards(prev));
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      // Revert to original order
      setCards([...studySet.questions]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
    setIsAutoShuffle(prev => !prev);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyS' && currentQ) {
        e.preventDefault();
        sound.playClick();
        onToggleStar(currentQ.id);
      } else if (e.code === 'KeyM' && currentQ) {
        e.preventDefault();
        sound.playClick();
        onToggleMaster(currentQ.id);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleToggleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentQ, onToggleStar, onToggleMaster, isAutoShuffle]);

  if (total === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-white/70 dark:bg-white/5 border border-white/40 flex items-center justify-center text-sky-600 shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Không có thẻ nào phù hợp</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {filterMode !== 'all'
            ? 'Không tìm thấy thẻ nào theo bộ lọc hiện tại. Hãy chuyển sang xem toàn bộ thẻ.'
            : 'Bộ thẻ hiện chưa có câu hỏi nào. Hãy thêm câu hỏi mới hoặc nhập file Excel.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {filterMode !== 'all' && (
            <button
              onClick={() => {
                sound.playClick();
                setFilterMode('all');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition cursor-pointer shadow-sm"
            >
              Xem tất cả ({studySet.questions.length} thẻ)
            </button>
          )}
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/10 hover:bg-white transition cursor-pointer"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Bar with Back, Progress and Controls */}
      <div className="glass-card-sm rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>
          <div className="h-4 w-px bg-slate-300/60 dark:bg-slate-700 hidden sm:block" />
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
            {studySet.title}
          </div>
        </div>

        {/* Center: Spaced Repetition Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl text-xs">
          <button
            onClick={() => {
              sound.playClick();
              setFilterMode('all');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#0a2540] dark:bg-sky-950 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tất cả ({cards.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilterMode('starred');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterMode === 'starred'
                ? 'bg-[#0a2540] dark:bg-sky-950 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Đánh dấu ({cards.filter(c => c.starred).length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilterMode('mistaken');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterMode === 'mistaken'
                ? 'bg-[#0a2540] dark:bg-sky-950 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Câu sai ({cards.filter(c => c.lastAnsweredCorrect === false).length})
          </button>
        </div>

        {/* Right: Auto-Shuffle Toggle & Shortcut Help */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleShuffle}
            title={isAutoShuffle ? 'Đang xáo trộn thẻ (Bấm để hoàn tác)' : 'Bật tự động xáo trộn thẻ'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              isAutoShuffle
                ? 'bg-[#007afc] text-white shadow-sm'
                : 'bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/90'
            }`}
          >
            <Shuffle className={`w-3.5 h-3.5 ${isAutoShuffle ? 'rotate-180 transition-transform' : ''}`} />
            <span>Xáo trộn</span>
          </button>

          <button
            onClick={() => setShowShortcuts(prev => !prev)}
            title="Xem phím tắt bàn phím"
            className="p-1.5 rounded-xl bg-white/60 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Helper Drawer */}
      {showShortcuts && (
        <div className="glass-card-sm rounded-2xl p-4 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in">
          <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-mono">Space</kbd> Lật thẻ</div>
          <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-mono">&larr; / &rarr;</kbd> Thẻ trước / sau</div>
          <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-mono">S</kbd> Đánh dấu sao</div>
          <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-mono">M</kbd> Đã thành thạo</div>
        </div>
      )}

      {/* 2. Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium px-1">
          <span>Thẻ {currentIndex + 1} / {total}</span>
          <span className="font-mono tabular-nums">{progressPct}%</span>
        </div>
        <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#007afc] to-indigo-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3. Center: Large Study Card (24px radius, pure white #ffffff background, soft depth shadow) */}
      <div className="perspective-1000 min-h-[420px] w-full flex items-center justify-center">
        <div
          onClick={handleFlip}
          className={`study-card-hero relative w-full min-h-[400px] cursor-pointer bg-white dark:bg-[#1a1738] p-8 sm:p-12 flex flex-col justify-between transition-all duration-300 select-none border border-slate-200/80 dark:border-white/10 hover:shadow-2xl ${
            isFlipped ? 'ring-2 ring-[#007afc]/30' : ''
          }`}
        >
          {/* Card Top Strip: Star, Master, Audio & Flip Hint */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onToggleStar(currentQ.id);
                }}
                className={`p-2 rounded-xl transition ${
                  currentQ.starred
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
                title="Đánh dấu sao câu hỏi quan trọng"
              >
                <Star className={`w-5 h-5 ${currentQ.starred ? 'fill-amber-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onToggleMaster(currentQ.id);
                }}
                className={`p-2 rounded-xl transition ${
                  currentQ.mastered
                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
                title="Đánh dấu đã ghi nhớ / thành thạo"
              >
                <CheckCircle2 className={`w-5 h-5 ${currentQ.mastered ? 'fill-emerald-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(isFlipped ? currentQ.correctAnswer : currentQ.prompt);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                title="Nghe phát âm chuẩn (Text-to-Speech)"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'Mặt sau: Đáp án' : 'Mặt trước: Câu hỏi'}</span>
            </div>
          </div>

          {/* Card Middle: Main Prompt / Term or Answer / Definition */}
          <div className="my-auto py-8 text-center space-y-4">
            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  CÂU HỎI / KHÁI NIỆM
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                  {currentQ.prompt}
                </h2>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#007afc]">
                  ĐÁP ÁN CHÍNH XÁC
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 leading-snug">
                  {currentQ.correctAnswer}
                </h2>

                {/* Explanation / Mnemonic Box */}
                {currentQ.explanation && (
                  <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-black/30 text-left border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 mt-4">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Giải thích &amp; Phân tích:</span>
                    </div>
                    <p className="leading-relaxed">{currentQ.explanation}</p>
                    {currentQ.memoryTip && (
                      <p className="text-purple-600 dark:text-purple-400 font-medium pt-1">
                        💡 Mẹo ghi nhớ: {currentQ.memoryTip}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Bottom: Flip hint */}
          <div className="text-center text-[11px] text-slate-400">
            Nhấn vào thẻ hoặc nhấn <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border text-[10px] font-mono">Space</kbd> để lật xem {isFlipped ? 'câu hỏi' : 'đáp án'}
          </div>
        </div>
      </div>

      {/* 4. Action Controls: Prev / Flip / Next */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white text-slate-700 dark:text-slate-200 font-medium text-xs shadow-sm transition hover:scale-102 active:scale-98 cursor-pointer border border-white/50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Thẻ trước</span>
        </button>

        <button
          onClick={handleFlip}
          className="px-6 py-3 rounded-2xl bg-[#007afc] text-white font-semibold text-xs shadow-md hover:bg-sky-600 transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          <span>{isFlipped ? 'Xem đề bài' : 'Lật xem đáp án'}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white text-slate-700 dark:text-slate-200 font-medium text-xs shadow-sm transition hover:scale-102 active:scale-98 cursor-pointer border border-white/50"
        >
          <span>Thẻ kế tiếp</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
