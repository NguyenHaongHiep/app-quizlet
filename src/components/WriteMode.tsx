import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Volume2,
  Sparkles,
  Check
} from 'lucide-react';
import { StudySet, Question } from '../types';
import { speakText } from '../lib/speech';

interface WriteModeProps {
  studySet: StudySet;
  onBack: () => void;
}

export const WriteMode: React.FC<WriteModeProps> = ({ studySet, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctTally, setCorrectTally] = useState(0);

  const questions = studySet.questions;
  const currentQ = questions[currentIndex];
  const total = questions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !inputVal.trim()) return;

    const userClean = inputVal.trim().toLowerCase();
    const correctClean = currentQ.correctAnswer.trim().toLowerCase();
    const ok = userClean === correctClean;

    setIsCorrect(ok);
    setIsAnswered(true);
    if (ok) setCorrectTally(prev => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex(prev => prev + 1);
      setInputVal('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setInputVal('');
    setIsAnswered(false);
    setIsCorrect(false);
    setIsFinished(false);
    setCorrectTally(0);
  };

  if (total === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="font-flow-serif text-2xl font-normal text-[#1F1F28]">Bộ thẻ chưa có câu hỏi</h3>
        <p className="text-xs text-[#8E8E93]">Hãy bổ sung câu hỏi vào bộ thẻ trước khi luyện viết.</p>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#5B2DFF] shadow-[0_8px_20px_rgba(91,45,255,0.35)] cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((correctTally / total) * 100);
    return (
      <div
        style={{
          boxShadow: '0 16px 36px rgba(91, 45, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
        className="max-w-md mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.05] text-center space-y-6"
      >
        <div
          style={{ boxShadow: '0 8px 24px rgba(91, 45, 255, 0.35)' }}
          className="w-16 h-16 mx-auto rounded-full bg-[#5B2DFF] text-white flex items-center justify-center"
        >
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDE8FF] text-[#5B2DFF] border border-[#5B2DFF]/15">
            <Sparkles className="w-3 h-3" /> Hoàn thành luyện nhớ
          </div>
          <h3 className="font-flow-serif text-3xl font-normal text-[#1F1F28]">Ghi nhớ xuất sắc!</h3>
          <p className="text-xs text-[#8E8E93]">
            Bạn đã gõ chính xác {correctTally} / {total} câu ({accuracy}%).
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-[#1F1F28] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5B2DFF]" />
            <span>Luyện lại</span>
          </button>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#5B2DFF',
              boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
            }}
            className="px-7 py-3 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] bg-white border border-black/[0.06] rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Thoát"
          >
            <ArrowLeft className="w-4 h-4 text-[#5B2DFF]" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#8E8E93]">
              <span className="uppercase tracking-wider">Luyện viết gợi nhớ</span>
              <span aria-hidden="true">&bull;</span>
              <span className="text-[#1F1F28] font-semibold truncate max-w-[180px] sm:max-w-xs">{studySet.title}</span>
            </div>
            <h2 className="font-flow-serif text-lg sm:text-xl font-normal text-[#1F1F28]">
              Câu {currentIndex + 1} <span className="text-[#8E8E93] font-sans text-sm">/ {total}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => speakText(currentQ.prompt)}
          className="p-2 text-[#8E8E93] hover:text-[#5B2DFF] bg-white border border-black/[0.06] rounded-full transition-all hover:scale-105 cursor-pointer"
          title="Phát âm câu hỏi"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar with Lilac Gradient */}
      <div className="w-full bg-[#EDE8FF] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #C8B4FF 0%, #5B2DFF 100%)',
            boxShadow: '0 0 8px rgba(91, 45, 255, 0.4)'
          }}
        />
      </div>

      {/* Question Card */}
      <div
        style={{
          boxShadow: '0 16px 36px rgba(91, 45, 255, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
        className="bg-white rounded-3xl p-6 sm:p-9 border border-black/[0.05] space-y-6"
      >
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B2DFF] block">
            Câu hỏi / Thuật ngữ
          </span>
          <h3 className="font-flow-serif text-2xl sm:text-3xl font-normal text-[#1F1F28] leading-[1.3]">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Input Form with Pill Design */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              disabled={isAnswered}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Gõ đáp án chính xác..."
              className="w-full px-5 py-3.5 pr-28 rounded-full border border-black/[0.08] bg-[#FCFAF6] text-xs sm:text-sm text-[#1F1F28] placeholder-[#8E8E93] focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20 transition-all"
            />

            {!isAnswered && (
              <button
                type="submit"
                disabled={!inputVal.trim()}
                style={{
                  backgroundColor: '#5B2DFF',
                  boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)',
                }}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full text-xs font-semibold text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Nộp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Feedback Section */}
        {isAnswered && (
          <div
            className={`p-5 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
              isCorrect
                ? 'bg-emerald-50/80 border-emerald-300'
                : 'bg-rose-50/80 border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {isCorrect ? 'Chính xác tuyệt đối!' : 'Chưa đúng rồi'}
                </span>
              </div>

              <button
                onClick={handleNext}
                style={{
                  backgroundColor: '#5B2DFF',
                  boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)',
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>{currentIndex + 1 < total ? 'Câu kế tiếp' : 'Xem kết quả'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-[#8E8E93]">
                Đáp án chuẩn: <span className="font-semibold text-emerald-800">{currentQ.correctAnswer}</span>
              </p>
              {!isCorrect && (
                <p className="text-[#8E8E93]">
                  Bạn đã nhập: <span className="font-semibold text-rose-700">{inputVal}</span>
                </p>
              )}
            </div>

            {currentQ.explanation && (
              <p className="text-[11px] text-[#1F1F28] bg-white/80 p-3 rounded-xl border border-black/[0.05]">
                <span className="font-semibold text-[#5B2DFF]">Giải thích: </span>
                {currentQ.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
