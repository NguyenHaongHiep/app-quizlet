import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  BookOpen,
  RotateCcw,
  Trophy,
  ArrowRight,
  Volume2,
  Sparkles,
  Check,
  X,
  Shuffle,
  Keyboard
} from 'lucide-react';
import { StudySet, Question, MatchingPair } from '../types';
import { speakText } from '../lib/speech';
import { sound } from '../lib/sound';

interface QuizModeProps {
  studySet: StudySet;
  onBack: () => void;
  onRecordResult: (correctCount: number, totalCount: number) => void;
}

type SpacedFilter = 'all' | 'mistaken' | 'starred' | 'mastered';

interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  userSelection: string;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  studySet,
  onBack,
  onRecordResult
}) => {
  const [filterMode, setFilterMode] = useState<SpacedFilter>('all');
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Fisher-Yates Shuffle
  const shuffleArray = useCallback(<T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  // Filter questions based on Spaced Repetition filter
  const filteredQuestions = useMemo(() => {
    let list = [...studySet.questions];
    if (filterMode === 'starred') {
      list = list.filter(q => q.starred);
    } else if (filterMode === 'mastered') {
      list = list.filter(q => q.mastered);
    } else if (filterMode === 'mistaken') {
      list = list.filter(q => q.lastAnsweredCorrect === false);
    }

    if (isShuffleOn) {
      return shuffleArray(list);
    }
    return list;
  }, [studySet.questions, filterMode, isShuffleOn, shuffleArray]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Shuffled options for multiple choice
  const currentQ = filteredQuestions[currentIndex];
  const total = filteredQuestions.length;

  const currentOptions = useMemo(() => {
    if (!currentQ || !currentQ.options) return [];
    if (isShuffleOn) {
      return shuffleArray(currentQ.options);
    }
    return currentQ.options;
  }, [currentQ, isShuffleOn, shuffleArray]);

  // Reset state when current question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCurrentCorrect(false);
    setShakeCard(false);
  }, [currentIndex, currentQ]);

  // Handler for selecting an option (before checking, or auto-check)
  const handlePickOption = (option: string) => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedOption(option);
  };

  // CHECK Answer Action
  const handleCheckAnswer = useCallback(() => {
    if (isAnswered || !currentQ || selectedOption === null) return;

    const isCorrect = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    setIsCurrentCorrect(isCorrect);
    setIsAnswered(true);

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
    }

    setAnswerHistory(prev => [
      ...prev,
      {
        questionId: currentQ.id,
        isCorrect,
        userSelection: selectedOption
      }
    ]);
  }, [isAnswered, currentQ, selectedOption]);

  // NEXT Question Action
  const handleNextQuestion = useCallback(() => {
    sound.playClick();
    if (currentIndex + 1 < total) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed quiz
      sound.playComplete();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }

      const totalCorrect = answerHistory.filter(a => a.isCorrect).length + (isCurrentCorrect ? 1 : 0);
      onRecordResult(totalCorrect, total);
      setIsCompleted(true);
    }
  }, [currentIndex, total, isCurrentCorrect, answerHistory, onRecordResult]);

  // Keyboard navigation shortcuts: 1, 2, 3, 4 to choose options; Space/Enter to Check or Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!isAnswered && currentOptions.length > 0) {
        if (e.key === '1' && currentOptions[0]) handlePickOption(currentOptions[0]);
        else if (e.key === '2' && currentOptions[1]) handlePickOption(currentOptions[1]);
        else if (e.key === '3' && currentOptions[2]) handlePickOption(currentOptions[2]);
        else if (e.key === '4' && currentOptions[3]) handlePickOption(currentOptions[3]);
      }

      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (!isAnswered) {
          if (selectedOption !== null) handleCheckAnswer();
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentOptions, selectedOption, handleCheckAnswer, handleNextQuestion]);

  if (total === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-white/70 dark:bg-white/5 border border-white/40 flex items-center justify-center text-sky-600 shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Không có câu hỏi kiểm tra</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {filterMode !== 'all'
            ? 'Không có câu hỏi nào khớp với bộ lọc Spaced Repetition này.'
            : 'Bộ thẻ hiện chưa có câu hỏi nào để luyện thi trắc nghiệm.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {filterMode !== 'all' && (
            <button
              onClick={() => {
                sound.playClick();
                setFilterMode('all');
                setCurrentIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition cursor-pointer shadow-sm"
            >
              Xem tất cả ({studySet.questions.length} câu)
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

  // Quiz Completed Score View
  if (isCompleted) {
    const totalCorrect = answerHistory.filter(a => a.isCorrect).length;
    const scorePct = Math.round((totalCorrect / total) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-in zoom-in-95 duration-300">
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Hoàn thành bài kiểm tra!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Bạn đã ôn luyện xong bài kiểm tra cho bộ thẻ <strong>{studySet.title}</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold font-mono text-[#007afc]">
                {scorePct}%
              </span>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Độ chính xác</p>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <span className="text-4xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {totalCorrect}/{total}
              </span>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Câu đúng</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                sound.playClick();
                setCurrentIndex(0);
                setAnswerHistory([]);
                setIsCompleted(false);
              }}
              className="px-6 py-3 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white text-slate-700 dark:text-slate-200 font-medium text-xs shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện lại bộ này</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="px-6 py-3 rounded-2xl bg-[#007afc] text-white font-semibold text-xs shadow-md hover:bg-sky-600 transition cursor-pointer flex items-center gap-2"
            >
              <span>Về danh sách</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Mode Controls & Spaced Filter */}
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
            Tất cả
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
            Ôn câu sai
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
            Đánh dấu sao
          </button>
        </div>

        {/* Right: Shuffle & Shortcut Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsShuffleOn(prev => !prev);
              setCurrentIndex(0);
            }}
            title={isShuffleOn ? 'Đang xáo trộn câu hỏi & đáp án' : 'Bật xáo trộn'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              isShuffleOn
                ? 'bg-[#007afc] text-white shadow-sm'
                : 'bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/90'
            }`}
          >
            <Shuffle className={`w-3.5 h-3.5 ${isShuffleOn ? 'rotate-180 transition-transform' : ''}`} />
            <span>Xáo trộn</span>
          </button>

          <button
            onClick={() => setShowShortcuts(prev => !prev)}
            title="Xem phím tắt"
            className="p-1.5 rounded-xl bg-white/60 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      {showShortcuts && (
        <div className="glass-card-sm rounded-2xl p-4 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in">
          <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-mono">1, 2, 3, 4</kbd> Chọn nhanh đáp án</div>
          <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-mono">Enter / Space</kbd> Kiểm tra / Câu kế tiếp</div>
          <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-mono">R</kbd> Xáo trộn đáp án</div>
        </div>
      )}

      {/* 2. Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium px-1">
          <span>Câu {currentIndex + 1} / {total}</span>
          <span className="font-mono tabular-nums">{progressPct}%</span>
        </div>
        <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#007afc] to-indigo-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3. Quiz Card Stage */}
      <div
        className={`glass-card rounded-3xl p-6 sm:p-10 space-y-8 transition-transform duration-300 ${
          shakeCard ? 'animate-shake' : ''
        }`}
      >
        {/* Question Header & Speech */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#007afc]">
              CÂU HỎI TRẮC NGHIỆM
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
              {currentQ.prompt}
            </h2>
          </div>
          <button
            onClick={() => speakText(currentQ.prompt)}
            className="p-2.5 rounded-xl bg-white/70 dark:bg-white/10 text-slate-500 hover:text-sky-600 transition shrink-0"
            title="Đọc câu hỏi"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* 4. Rounded Option Bars (12px–16px border-radius, instant hover transitions, 1-4 keys) */}
        <div className="space-y-3">
          {currentOptions.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isTargetCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

            let optionStyle = 'bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-white hover:border-[#007afc]/40';

            if (isAnswered) {
              if (isTargetCorrect) {
                optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs';
              } else if (isSelected && !isCurrentCorrect) {
                optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold';
              } else {
                optionStyle = 'opacity-40 bg-white/30 dark:bg-white/[0.02] border-transparent text-slate-400';
              }
            } else if (isSelected) {
              optionStyle = 'bg-[#007afc]/10 border-[#007afc] text-[#007afc] font-semibold ring-2 ring-[#007afc]/20 shadow-xs';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePickOption(opt)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-left text-sm transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer select-none ${optionStyle}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-snug break-words">{opt}</span>
                </div>

                <div className="shrink-0">
                  {isAnswered && isTargetCorrect && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                  {isAnswered && isSelected && !isTargetCorrect && (
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center">
                      <X className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 5. Answer Feedback & Explanation Drawer */}
        {isAnswered && (
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-400">Chính xác! Làm rất tốt.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <span className="text-rose-700 dark:text-rose-400">
                    Chưa chính xác. Đáp án đúng là: <strong>{currentQ.correctAnswer}</strong>
                  </span>
                </>
              )}
            </div>

            {currentQ.explanation && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            )}

            {currentQ.memoryTip && (
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                💡 Mẹo ghi nhớ: {currentQ.memoryTip}
              </div>
            )}
          </div>
        )}

        {/* 6. Prominent Action Controls: "CHECK" and "NEXT" styled with vibrant bright cyan/blue (#007afc) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-white/10">
          {!isAnswered ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className={`px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer ${
                selectedOption !== null
                  ? 'bg-[#007afc] text-white hover:bg-sky-600 hover:scale-102 active:scale-98 shadow-sky-500/30'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>KIỂM TRA (CHECK)</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-[#007afc] text-white hover:bg-sky-600 hover:scale-102 active:scale-98 shadow-md shadow-sky-500/30 flex items-center gap-2 cursor-pointer transition-all duration-200"
            >
              <span>{currentIndex + 1 < total ? 'CÂU KẾ TIẾP (NEXT)' : 'XEM KẾT QUẢ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
