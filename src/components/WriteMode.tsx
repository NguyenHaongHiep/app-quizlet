import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Volume2
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
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-slate-500">Bộ thẻ chưa có câu hỏi nào.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">
          Quay lại
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Hoàn thành luyện viết!</h3>
        <p className="text-xs text-slate-500">
          Bạn đã nhớ chính xác {correctTally} / {total} câu
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <button
            onClick={handleRestart}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
          >
            Luyện lại
          </button>
          <button
            onClick={onBack}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl"
          >
            Về bộ thẻ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Luyện viết &amp; Gợi nhớ chủ động</span>
              <span aria-hidden="true">·</span>
              <span>{studySet.title}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Câu {currentIndex + 1} / {total}
            </h2>
          </div>
        </div>

        <button
          onClick={() => speakText(currentQ.prompt)}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors"
          title="Phát âm"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
            Gợi ý / Đề bài
          </span>
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {currentQ.prompt}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Gõ câu trả lời chính xác:
            </label>
            <input
              type="text"
              disabled={isAnswered}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập câu trả lời..."
              autoFocus
              className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {!isAnswered ? (
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
            >
              Kiểm tra câu trả lời
            </button>
          ) : (
            <div
              className={`p-5 rounded-xl border space-y-3 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-amber-50 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-950">Chính xác hoàn hảo!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-950">Chưa chính xác</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Đáp án chuẩn xác
                </span>
                <span className="text-base font-bold text-slate-900">
                  {currentQ.correctAnswer}
                </span>
              </div>

              {currentQ.explanation && (
                <div className="text-xs text-slate-600 pt-1">
                  <span className="font-semibold text-slate-800">Giải thích: </span>
                  {currentQ.explanation}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
