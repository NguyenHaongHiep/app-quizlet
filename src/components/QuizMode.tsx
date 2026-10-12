import React, { useState, useEffect } from 'react';
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
  MoveUp,
  MoveDown,
  Volume2
} from 'lucide-react';
import { StudySet, Question, MatchingPair } from '../types';
import { speakText } from '../lib/speech';

interface QuizModeProps {
  studySet: StudySet;
  onBack: () => void;
  onRecordResult: (correctCount: number, totalCount: number) => void;
}

interface UserAnswerRecord {
  questionId: string;
  isCorrect: boolean;
  userSelection: string;
  correctAnswer: string;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  studySet,
  onBack,
  onRecordResult
}) => {
  const [questions, setQuestions] = useState<Question[]>(() => [...studySet.questions]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Trạng thái câu hiện tại
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState('');
  
  // Trạng thái nối cặp
  const [matchingPairsLeft, setMatchingPairsLeft] = useState<{ id: string; text: string }[]>([]);
  const [matchingPairsRight, setMatchingPairsRight] = useState<{ id: string; text: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairedMatches, setPairedMatches] = useState<Record<string, string>>({}); // leftId -> rightId

  // Trạng thái sắp xếp
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);

  // Feedback loop state: đã nộp đáp án hay chưa
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<UserAnswerRecord[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = questions[currentIndex];
  const total = questions.length;

  // Khởi tạo trạng thái tương ứng mỗi khi chuyển câu hỏi
  useEffect(() => {
    if (!currentQ) return;
    setIsAnswered(false);
    setSelectedOption(null);
    setFillInput('');
    setIsCurrentCorrect(false);

    if (currentQ.type === 'matching' && currentQ.matchingPairs) {
      setMatchingPairsLeft(currentQ.matchingPairs.map(p => ({ id: p.id, text: p.left })));
      // Xáo trộn cột bên phải
      const shuffledRight = [...currentQ.matchingPairs]
        .sort(() => 0.5 - Math.random())
        .map(p => ({ id: p.id, text: p.right }));
      setMatchingPairsRight(shuffledRight);
      setPairedMatches({});
      setSelectedLeft(null);
    } else if (currentQ.type === 'ordering' && currentQ.orderingItems) {
      // Xáo trộn thứ tự ban đầu để người học sắp xếp
      const shuffled = [...currentQ.orderingItems].sort(() => 0.5 - Math.random());
      setCurrentOrder(shuffled);
    }
  }, [currentIndex, currentQ]);

  // Xử lý nộp trắc nghiệm (Chọn đáp án là nộp ngay lập tức)
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    const correct = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    commitAnswer(correct, opt);
  };

  // Xử lý nộp điền từ
  const handleSubmitFill = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !fillInput.trim()) return;
    const cleanUser = fillInput.trim().toLowerCase();
    const cleanCorrect = currentQ.correctAnswer.trim().toLowerCase();
    const correct = cleanUser === cleanCorrect;
    commitAnswer(correct, fillInput.trim());
  };

  // Xử lý nối cặp
  const handleLeftClick = (id: string) => {
    if (isAnswered) return;
    setSelectedLeft(id);
  };

  const handleRightClick = (id: string) => {
    if (isAnswered || !selectedLeft) return;
    setPairedMatches(prev => ({
      ...prev,
      [selectedLeft]: id
    }));
    setSelectedLeft(null);
  };

  const handleSubmitMatching = () => {
    if (isAnswered || !currentQ.matchingPairs) return;
    let allCorrect = true;
    currentQ.matchingPairs.forEach(p => {
      if (pairedMatches[p.id] !== p.id) {
        allCorrect = false;
      }
    });
    commitAnswer(allCorrect, 'Nối cặp khái niệm');
  };

  // Xử lý sắp xếp thứ tự
  const handleMoveOrderItem = (idx: number, direction: 'up' | 'down') => {
    if (isAnswered) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;
    const updated = [...currentOrder];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCurrentOrder(updated);
  };

  const handleSubmitOrdering = () => {
    if (isAnswered || !currentQ.orderingItems) return;
    const userString = currentOrder.join(' -> ');
    const correctString = currentQ.orderingItems.join(' -> ');
    const correct = userString === correctString;
    commitAnswer(correct, userString);
  };

  const commitAnswer = (correct: boolean, userSel: string) => {
    setIsCurrentCorrect(correct);
    setIsAnswered(true);

    setAnswerHistory(prev => [
      ...prev,
      {
        questionId: currentQ.id,
        isCorrect: correct,
        userSelection: userSel,
        correctAnswer: currentQ.correctAnswer
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Hoàn thành toàn bộ bài kiểm tra
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsCompleted(true);
    const correctTotal = answerHistory.filter(h => h.isCorrect).length + (isCurrentCorrect ? 0 : 0);
    // Tính tổng kết
    onRecordResult(correctTotal, total);

    // Kích hoạt pháo giấy chúc mừng nếu đạt điểm cao (>= 80%)
    const pct = total > 0 ? (correctTotal / total) * 100 : 0;
    if (pct >= 80) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignored
      }
    }
  };

  const handleRetryAll = () => {
    setQuestions([...studySet.questions]);
    setCurrentIndex(0);
    setAnswerHistory([]);
    setIsCompleted(false);
  };

  const handleRetryMistakes = () => {
    const wrongIds = answerHistory.filter(h => !h.isCorrect).map(h => h.questionId);
    const wrongQuestions = studySet.questions.filter(q => wrongIds.includes(q.id));
    if (wrongQuestions.length > 0) {
      setQuestions(wrongQuestions);
      setCurrentIndex(0);
      setAnswerHistory([]);
      setIsCompleted(false);
    }
  };

  if (total === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm text-slate-500">Bộ thẻ này chưa có câu hỏi nào để làm bài kiểm tra.</p>
        <button onClick={onBack} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">
          Quay lại bộ thẻ
        </button>
      </div>
    );
  }

  // MÀN HÌNH TỔNG KẾT BÀI KIỂM TRA (COMPLETION SCREEN)
  if (isCompleted) {
    const correctCount = answerHistory.filter(h => h.isCorrect).length;
    const wrongCount = total - correctCount;
    const scorePct = Math.round((correctCount / total) * 100);

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Hoàn thành bài kiểm tra!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bộ thẻ: <span className="font-semibold text-slate-700">{studySet.title}</span>
            </p>
          </div>

          {/* Điểm số */}
          <div className="py-4">
            <div className="text-5xl font-black text-indigo-600 tracking-tight">
              {scorePct}%
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1.5">
              Trả lời đúng {correctCount} / {total} câu
            </div>
          </div>

          {/* Thẻ thống kê */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Chính xác
              </span>
              <span className="text-xl font-bold text-emerald-700">{correctCount} câu</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                Cần ôn lại
              </span>
              <span className="text-xl font-bold text-rose-700">{wrongCount} câu</span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleRetryAll}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại toàn bộ</span>
            </button>

            {wrongCount > 0 && (
              <button
                onClick={handleRetryMistakes}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors border border-amber-300"
              >
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Làm lại {wrongCount} câu sai</span>
              </button>
            )}

            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <span>Trở về bộ thẻ</span>
            </button>
          </div>
        </div>

        {/* Danh sách rà soát chi tiết từng câu */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Chi tiết kết quả từng câu hỏi
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const record = answerHistory.find(h => h.questionId === q.id);
              const isOk = record?.isCorrect;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isOk
                      ? 'bg-white border-slate-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isOk ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                          Câu {idx + 1}
                        </span>
                        <span className={`text-[11px] font-semibold ${isOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isOk ? 'Đúng' : 'Chưa đúng'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{q.prompt}</p>
                      <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                        <div>
                          <span className="text-slate-400">Đáp án chuẩn: </span>
                          <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                        </div>
                        {!isOk && record && (
                          <div>
                            <span className="text-slate-400">Bạn đã chọn: </span>
                            <span className="font-medium text-rose-600">{record.userSelection}</span>
                          </div>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                          <span className="font-semibold text-slate-700">Giải thích: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH LÀM BÀI TRẮC NGHIỆM TỪNG CÂU (ACTIVE QUIZ SCREEN)
  const letters = ['A', 'B', 'C', 'D'];
  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Quiz Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Dừng bài kiểm tra"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Kiểm tra trắc nghiệm</span>
              <span aria-hidden="true">·</span>
              <span>{studySet.title}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Câu {currentIndex + 1} / {total}
            </h2>
          </div>
        </div>

        {/* Audio question speech */}
        <button
          onClick={() => speakText(currentQ.prompt)}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors"
          title="Phát âm câu hỏi"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1.5">
            {currentQ.type === 'multiple_choice' && 'Trắc nghiệm chọn 1 đáp án'}
            {currentQ.type === 'fill_blank' && 'Điền từ vào chỗ trống'}
            {currentQ.type === 'matching' && 'Nối các khái niệm tương ứng'}
            {currentQ.type === 'ordering' && 'Sắp xếp đúng trình tự'}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.prompt}
          </h3>
        </div>

        {/* 1. DẠNG TRẮC NGHIỆM 4 ĐÁP ÁN */}
        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

              // Kiểu dáng hiển thị sau khi đã trả lời
              let cardStyle = 'border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-2xs';
                  badgeStyle = 'bg-emerald-600 text-white';
                } else if (isSelected && !isCorrectAnswer) {
                  cardStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                  badgeStyle = 'bg-rose-600 text-white';
                } else {
                  cardStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                  badgeStyle = 'bg-slate-200 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all group ${cardStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeStyle}`}
                  >
                    {letters[idx] || (idx + 1)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. DẠNG ĐIỀN TỪ CHỖ TRỐNG */}
        {currentQ.type === 'fill_blank' && (
          <form onSubmit={handleSubmitFill} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nhập câu trả lời của bạn:
              </label>
              <input
                type="text"
                disabled={isAnswered}
                value={fillInput}
                onChange={(e) => setFillInput(e.target.value)}
                placeholder="Gõ từ hoặc cụm từ..."
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {!isAnswered && (
              <button
                type="submit"
                disabled={!fillInput.trim()}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                Kiểm tra kết quả
              </button>
            )}
          </form>
        )}

        {/* 3. DẠNG NỐI KHÁI NIỆM */}
        {currentQ.type === 'matching' && currentQ.matchingPairs && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Chạm chọn một khái niệm ở cột trái, sau đó chạm định nghĩa tương ứng ở cột phải để ghép đôi:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cột trái */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cột Thuật ngữ</div>
                {matchingPairsLeft.map(item => {
                  const isLeftChosen = selectedLeft === item.id;
                  const isPaired = !!pairedMatches[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleLeftClick(item.id)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                        isLeftChosen
                          ? 'border-indigo-600 bg-indigo-50 font-bold ring-2 ring-indigo-200'
                          : isPaired
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-medium'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </div>

              {/* Cột phải */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cột Định nghĩa</div>
                {matchingPairsRight.map(item => {
                  // Xem có bên trái nào đã nối với mục này chưa
                  const pairedLeftId = Object.keys(pairedMatches).find(k => pairedMatches[k] === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isAnswered || !selectedLeft}
                      onClick={() => handleRightClick(item.id)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                        pairedLeftId
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-medium'
                          : selectedLeft
                          ? 'border-indigo-300 bg-indigo-50/30 hover:border-indigo-500 hover:bg-indigo-50 text-slate-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {!isAnswered && (
              <button
                type="button"
                onClick={handleSubmitMatching}
                disabled={Object.keys(pairedMatches).length < currentQ.matchingPairs.length}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                Xác nhận nối các cặp ({Object.keys(pairedMatches).length}/{currentQ.matchingPairs.length})
              </button>
            )}
          </div>
        )}

        {/* 4. DẠNG SẮP XẾP THỨ TỰ */}
        {currentQ.type === 'ordering' && currentQ.orderingItems && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Dùng nút mũi tên Lên / Xuống để sắp xếp các bước theo đúng trình tự:
            </p>

            <div className="space-y-2">
              {currentOrder.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800">{item}</span>
                  </div>

                  {!isAnswered && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrderItem(idx, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-200"
                        title="Di chuyển lên"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentOrder.length - 1}
                        onClick={() => handleMoveOrderItem(idx, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-200"
                        title="Di chuyển xuống"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!isAnswered && (
              <button
                type="button"
                onClick={handleSubmitOrdering}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Xác nhận thứ tự này
              </button>
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK LOOP CARD TỨC THÌ SAU MỖI CÂU HỎI */}
      {isAnswered && (
        <div
          className={`rounded-2xl p-6 sm:p-7 border transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-4 shadow-sm ${
            isCurrentCorrect
              ? 'bg-gradient-to-br from-emerald-50/90 to-white border-emerald-300'
              : 'bg-gradient-to-br from-amber-50/90 to-white border-amber-300'
          }`}
        >
          {/* Header trạng thái */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCurrentCorrect ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {isCurrentCorrect ? 'Chính xác! Làm rất tốt 🎉' : 'Chưa chính xác! Cùng xem giải thích ⚠️'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isCurrentCorrect
                    ? 'Bạn đã nắm vững kiến thức câu hỏi này.'
                    : 'Hãy đọc kỹ phần giải thích bên dưới để ghi nhớ lâu hơn.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              <span>{currentIndex + 1 === total ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Đáp án chuẩn */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Đáp án chính xác
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {currentQ.correctAnswer}
            </div>
          </div>

          {/* Lý do giải thích chi tiết */}
          {currentQ.explanation && (
            <div className="bg-white/90 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Lý do &amp; Giải thích chi tiết</span>
              </div>
              <p className="leading-relaxed pl-5.5 text-slate-700">{currentQ.explanation}</p>
            </div>
          )}

          {/* Ví dụ minh họa & Mẹo ghi nhớ */}
          {(currentQ.example || currentQ.memoryTip) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentQ.example && (
                <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 text-sky-950 space-y-1">
                  <div className="font-bold text-sky-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>Ví dụ minh họa thực tế</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-sky-900/90 pl-5">
                    {currentQ.example}
                  </p>
                </div>
              )}

              {currentQ.memoryTip && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-amber-950 space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mẹo ghi nhớ (Mnemonic)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90 pl-5">
                    {currentQ.memoryTip}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
