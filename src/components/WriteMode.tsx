import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Keyboard
} from 'lucide-react';
import { StudySet, Question } from '../types';
import { speakText } from '../lib/speech';
import { sound } from '../lib/sound';

interface WriteModeProps {
  studySet: StudySet;
  onBack: () => void;
}

export const WriteMode: React.FC<WriteModeProps> = ({ studySet, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>(() => [...studySet.questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuestions([...studySet.questions]);
    setCurrentIndex(0);
    setInputVal('');
    setIsAnswered(false);
    setCorrectCount(0);
    setIsGameOver(false);
  }, [studySet]);

  useEffect(() => {
    if (!isAnswered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswered]);

  const currentQ = questions[currentIndex];
  const total = questions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !inputVal.trim() || !currentQ) return;

    const normalizedInput = inputVal.trim().toLowerCase();
    const normalizedCorrect = currentQ.correctAnswer.trim().toLowerCase();

    const matched = normalizedInput === normalizedCorrect;
    setIsCorrect(matched);
    setIsAnswered(true);

    if (matched) {
      sound.playCorrect();
      setCorrectCount(prev => prev + 1);
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex + 1 < total) {
      setCurrentIndex(prev => prev + 1);
      setInputVal('');
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
      sound.playComplete();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    }
  };

  if (total === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bộ thẻ chưa có câu hỏi</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Hãy bổ sung câu hỏi vào bộ thẻ trước khi luyện viết.</p>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 cursor-pointer shadow-sm"
        >
          Quay lại bộ thẻ
        </button>
      </div>
    );
  }

  if (isGameOver) {
    const accuracy = Math.round((correctCount / total) * 100);

    return (
      <div className="max-w-md mx-auto my-12 p-8 sm:p-10 rounded-3xl glass-card text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 stroke-[2.2] animate-bounce" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ghi nhớ xuất sắc!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bạn đã hoàn thành phiên luyện viết cho bộ thẻ <strong>{studySet.title}</strong>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/5 flex items-center justify-around">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Độ chính xác</p>
            <p className="text-3xl font-bold font-mono text-[#007afc] mt-1">{accuracy}%</p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Đúng</p>
            <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{correctCount}/{total}</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentIndex(0);
              setInputVal('');
              setIsAnswered(false);
              setCorrectCount(0);
              setIsGameOver(false);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-white/10 hover:bg-white transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#007afc]" />
            <span>Luyện lại</span>
          </button>
          <button
            onClick={onBack}
            className="px-7 py-3 rounded-2xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition cursor-pointer shadow-sm"
          >
            Về bộ thẻ
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 glass-card-sm p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition"
            title="Thoát"
          >
            <ArrowLeft className="w-4 h-4 text-[#007afc]" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="uppercase tracking-wider">Luyện viết gợi nhớ</span>
              <span aria-hidden="true">&bull;</span>
              <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[180px] sm:max-w-xs">{studySet.title}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Câu {currentIndex + 1} <span className="text-slate-400 font-sans text-sm">/ {total}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => speakText(currentQ.prompt)}
          className="p-2.5 rounded-xl text-slate-500 hover:text-sky-600 transition"
          title="Phát âm câu hỏi"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out bg-[#007afc]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#007afc] block">
            CÂU HỎI / ĐỊNH NGHĨA
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isAnswered}
              placeholder="Gõ đáp án chính xác tại đây..."
              className="w-full px-5 py-3.5 pr-28 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#007afc] focus:ring-2 focus:ring-[#007afc]/30 transition-all"
            />
            {!isAnswered ? (
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl text-xs font-bold text-white bg-[#007afc] hover:bg-sky-600 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Kiểm tra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </form>

        {/* Answer Feedback */}
        {isAnswered && (
          <div
            className={`p-5 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                  {isCorrect ? 'Chính xác hoàn toàn!' : 'Chưa đúng, hãy ghi nhớ đáp án bên dưới'}
                </span>
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>{currentIndex + 1 < total ? 'Câu kế tiếp' : 'Xem kết quả'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs space-y-1 pt-1">
              <p className="text-slate-600 dark:text-slate-300">
                Đáp án chuẩn: <span className="font-bold text-emerald-700 dark:text-emerald-400">{currentQ.correctAnswer}</span>
              </p>
              {!isCorrect && (
                <p className="text-slate-600 dark:text-slate-300">
                  Bạn đã nhập: <span className="font-semibold text-rose-600 dark:text-rose-400">{inputVal}</span>
                </p>
              )}
            </div>

            {currentQ.explanation && (
              <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-white/[0.04] p-3 rounded-xl border border-white/50 dark:border-white/5">
                <span className="font-bold text-[#007afc]">Giải thích: </span>
                {currentQ.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
