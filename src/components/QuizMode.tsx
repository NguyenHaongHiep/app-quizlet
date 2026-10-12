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
  Volume2,
  Sparkles,
  Check
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

  // Đồng bộ danh sách câu hỏi khi bộ thẻ thay đổi
  useEffect(() => {
    setQuestions([...studySet.questions]);
    setCurrentIndex(0);
    setIsAnswered(false);
    setAnswerHistory([]);
    setIsCompleted(false);
  }, [studySet.id, studySet.questions]);

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
    const correct = fillInput.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    commitAnswer(correct, fillInput.trim());
  };

  // Xử lý ghép đôi khái niệm
  const handleLeftClick = (leftId: string) => {
    if (isAnswered) return;
    setSelectedLeft(leftId);
  };

  const handleRightClick = (rightId: string) => {
    if (isAnswered || !selectedLeft) return;
    setPairedMatches(prev => ({
      ...prev,
      [selectedLeft]: rightId
    }));
    setSelectedLeft(null);
  };

  const handleSubmitMatching = () => {
    if (isAnswered || !currentQ.matchingPairs) return;
    // Kiểm tra xem tất cả các cặp đã nối đúng chưa (id phải khớp)
    const isAllCorrect = currentQ.matchingPairs.every(pair => pairedMatches[pair.id] === pair.id);
    commitAnswer(isAllCorrect, isAllCorrect ? 'Nối chính xác toàn bộ' : 'Một số cặp chưa đúng');
  };

  // Xử lý sắp xếp thứ tự
  const handleMoveOrderItem = (index: number, direction: 'up' | 'down') => {
    if (isAnswered) return;
    const newOrder = [...currentOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setCurrentOrder(newOrder);
  };

  const handleSubmitOrdering = () => {
    if (isAnswered || !currentQ.orderingItems) return;
    const isAllCorrect = currentOrder.every((item, i) => item === currentQ.orderingItems![i]);
    commitAnswer(isAllCorrect, currentOrder.join(' &rarr; '));
  };

  // Ghi nhận đáp án và hiển thị ngay Feedback tức thì
  const commitAnswer = (correct: boolean, userAns: string) => {
    setIsCurrentCorrect(correct);
    setIsAnswered(true);

    const record: UserAnswerRecord = {
      questionId: currentQ.id,
      isCorrect: correct,
      userSelection: userAns,
      correctAnswer: currentQ.correctAnswer
    };

    setAnswerHistory(prev => [...prev, record]);

    if (correct) {
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#5B2DFF', '#C8B4FF', '#10B981']
        });
      } catch (err) {
        // Safe fallback
      }
    }
  };

  // Chuyển sang câu hỏi kế tiếp hoặc kết thúc bài thi
  const handleNextQuestion = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      const totalCorrect = answerHistory.filter(h => h.isCorrect).length;
      onRecordResult(totalCorrect, total);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.5 },
          colors: ['#5B2DFF', '#C8B4FF', '#10B981', '#F59E0B']
        });
      } catch (err) {
        // Safe fallback
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setIsAnswered(false);
    setAnswerHistory([]);
    setIsCompleted(false);
  };

  if (!currentQ && !isCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EDE8FF] text-[#5B2DFF] flex items-center justify-center">
          <BookOpen className="w-8 h-8 stroke-[2]" />
        </div>
        <h3 className="font-flow-serif text-2xl font-normal text-[#1F1F28]">Bộ thẻ chưa có câu hỏi</h3>
        <p className="text-xs text-[#8E8E93]">Hãy thêm câu hỏi trắc nghiệm hoặc nhập file trước khi kiểm tra.</p>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#5B2DFF] shadow-[0_8px_20px_rgba(91,45,255,0.35)] cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // MÀN HÌNH BÁO CÁO KẾT QUẢ CUỐI BÀI THI (SUMMARY SCREEN)
  if (isCompleted) {
    const correctCount = answerHistory.filter(h => h.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    // SVG Circular progress ring
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (accuracy / 100) * circumference;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
        {/* Banner tổng kết */}
        <div
          style={{
            boxShadow: '0 16px 36px rgba(91, 45, 255, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.05] text-center space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDE8FF] text-[#5B2DFF] border border-[#5B2DFF]/15">
            <Sparkles className="w-3 h-3" /> Tổng kết bài thi trắc nghiệm
          </div>

          <h2 className="font-flow-serif text-3xl sm:text-4xl font-normal text-[#1F1F28] tracking-tight">
            {accuracy >= 80 ? 'Xuất sắc! Bạn nắm bài rất vững!' : accuracy >= 50 ? 'Khá tốt! Hãy ôn lại các câu chưa đúng.' : 'Cần cố gắng ôn kỹ hơn nhé!'}
          </h2>

          {/* Lilac Flow Circular Score Ring */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#EDE8FF"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#5B2DFF"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-flow-serif text-3xl font-medium text-[#1F1F28]">{accuracy}%</span>
                <span className="text-[10px] uppercase tracking-wider text-[#8E8E93] font-semibold">Chính xác</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-black/[0.05]">
                <p className="text-[11px] text-[#8E8E93] font-medium">Số câu trả lời đúng</p>
                <p className="font-flow-serif text-2xl font-normal text-emerald-600 mt-0.5">
                  {correctCount} <span className="text-xs text-[#8E8E93] font-sans">/ {total}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-black/[0.05]">
                <p className="text-[11px] text-[#8E8E93] font-medium">Số câu cần ôn lại</p>
                <p className="font-flow-serif text-2xl font-normal text-rose-500 mt-0.5">
                  {total - correctCount} <span className="text-xs text-[#8E8E93] font-sans">/ {total}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestartQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-[#1F1F28] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5B2DFF]" />
              <span>Làm lại bài này</span>
            </button>

            <button
              onClick={onBack}
              style={{
                backgroundColor: '#5B2DFF',
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
              }}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Trở về bộ thẻ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Danh sách rà soát chi tiết từng câu */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-flow-serif text-xl font-normal text-[#1F1F28]">
              Chi tiết câu trả lời
            </h3>
            <span className="text-xs text-[#8E8E93]">
              {correctCount}/{total} câu đạt chuẩn
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const record = answerHistory.find(h => h.questionId === q.id);
              const isOk = record?.isCorrect;
              return (
                <div
                  key={q.id}
                  style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)' }}
                  className={`p-5 rounded-2xl border transition-all ${
                    isOk
                      ? 'bg-white border-black/[0.05]'
                      : 'bg-rose-50/30 border-rose-200/70'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {isOk ? <Check className="w-4 h-4 stroke-[2.5]" /> : <AlertCircle className="w-4 h-4 stroke-[2.5]" />}
                    </div>

                    <div className="space-y-2 w-full text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          Câu {idx + 1}
                        </span>
                        <span className={`text-[11px] font-semibold ${isOk ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isOk ? 'Chính xác' : 'Chưa đúng'}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-[#1F1F28]">{q.prompt}</p>

                      <div className="text-xs space-y-1 pt-1">
                        <div>
                          <span className="text-[#8E8E93]">Đáp án đúng: </span>
                          <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                        </div>
                        {!isOk && record && (
                          <div>
                            <span className="text-[#8E8E93]">Bạn đã chọn: </span>
                            <span className="font-medium text-rose-600">{record.userSelection}</span>
                          </div>
                        )}
                      </div>

                      {q.explanation && (
                        <div className="text-[11px] text-[#1F1F28] bg-[#FCFAF6] p-3 rounded-xl border border-black/[0.05] mt-2">
                          <span className="font-semibold text-[#5B2DFF]">Giải thích: </span>
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Quiz Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] bg-white border border-black/[0.06] rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Dừng bài kiểm tra"
          >
            <ArrowLeft className="w-4 h-4 text-[#5B2DFF]" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#8E8E93]">
              <span className="uppercase tracking-wider">Trắc nghiệm phản hồi tức thì</span>
              <span aria-hidden="true">&bull;</span>
              <span className="text-[#1F1F28] font-semibold truncate max-w-[180px] sm:max-w-xs">{studySet.title}</span>
            </div>
            <h2 className="font-flow-serif text-lg sm:text-xl font-normal text-[#1F1F28]">
              Câu {currentIndex + 1} <span className="text-[#8E8E93] font-sans text-sm">/ {total}</span>
            </h2>
          </div>
        </div>

        {/* Audio question speech */}
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

      {/* Main Question Card (Lilac Flow Neumorphic Light) */}
      <div
        style={{
          boxShadow: '0 16px 36px rgba(91, 45, 255, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
        className="bg-white rounded-3xl p-6 sm:p-9 border border-black/[0.05] space-y-6"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#EDE8FF] text-[#5B2DFF] border border-[#5B2DFF]/15 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            {currentQ.type === 'multiple_choice' && 'Trắc nghiệm 4 đáp án'}
            {currentQ.type === 'fill_blank' && 'Điền từ vào chỗ trống'}
            {currentQ.type === 'matching' && 'Nối các khái niệm tương ứng'}
            {currentQ.type === 'ordering' && 'Sắp xếp đúng trình tự'}
          </span>

          <h3 className="font-flow-serif text-2xl sm:text-3xl font-normal text-[#1F1F28] leading-[1.3]">
            {currentQ.prompt}
          </h3>
        </div>

        {/* 1. DẠNG TRẮC NGHIỆM 4 ĐÁP ÁN */}
        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

              // Styling sau khi đã chọn
              let buttonBg = 'bg-[#FCFAF6] hover:bg-[#F4EFFE] hover:border-[#5B2DFF]/40 border-black/[0.06] text-[#1F1F28]';
              let badgeBg = 'bg-white text-[#8E8E93] border border-black/[0.06]';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  buttonBg = 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.15)]';
                  badgeBg = 'bg-emerald-600 text-white border-transparent';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonBg = 'bg-rose-50/80 border-rose-300 text-rose-950 font-medium shadow-[0_4px_12px_rgba(244,63,94,0.15)]';
                  badgeBg = 'bg-rose-600 text-white border-transparent';
                } else {
                  buttonBg = 'bg-[#FCFAF6]/60 border-black/[0.04] text-[#8E8E93] opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${buttonBg}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeBg}`}>
                      {letters[idx] || idx + 1}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>

                  {isAnswered && isCorrectAnswer && (
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. DẠNG ĐIỀN TỪ VÀO CHỖ TRỐNG */}
        {currentQ.type === 'fill_blank' && (
          <form onSubmit={handleSubmitFill} className="space-y-4 pt-2">
            <div className="relative">
              <input
                type="text"
                disabled={isAnswered}
                value={fillInput}
                onChange={(e) => setFillInput(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                className="w-full px-5 py-3.5 rounded-full border border-black/[0.08] bg-[#FCFAF6] text-xs sm:text-sm text-[#1F1F28] placeholder-[#8E8E93] focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20 transition-all"
              />
            </div>

            {!isAnswered && (
              <button
                type="submit"
                disabled={!fillInput.trim()}
                style={{
                  backgroundColor: '#5B2DFF',
                  boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
                }}
                className="px-6 py-3 rounded-full text-xs font-semibold text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Kiểm tra kết quả
              </button>
            )}
          </form>
        )}

        {/* 3. DẠNG NỐI KHÁI NIỆM */}
        {currentQ.type === 'matching' && currentQ.matchingPairs && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#8E8E93]">
              Chạm chọn thuật ngữ cột trái, sau đó chạm định nghĩa tương ứng cột phải để ghép cặp:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">Cột Thuật ngữ</div>
                {matchingPairsLeft.map(item => {
                  const isLeftChosen = selectedLeft === item.id;
                  const isPaired = !!pairedMatches[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleLeftClick(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                        isLeftChosen
                          ? 'border-[#5B2DFF] bg-[#EDE8FF] text-[#5B2DFF] font-semibold shadow-[0_4px_12px_rgba(91,45,255,0.2)]'
                          : isPaired
                          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-medium'
                          : 'border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-[#1F1F28]'
                      }`}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">Cột Định nghĩa</div>
                {matchingPairsRight.map(item => {
                  const pairedLeftId = Object.keys(pairedMatches).find(k => pairedMatches[k] === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isAnswered || !selectedLeft}
                      onClick={() => handleRightClick(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                        pairedLeftId
                          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-medium'
                          : selectedLeft
                          ? 'border-[#5B2DFF]/40 bg-[#EDE8FF]/30 hover:bg-[#EDE8FF] text-[#1F1F28]'
                          : 'border-black/[0.06] bg-[#FCFAF6] text-[#8E8E93]'
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
                style={{
                  backgroundColor: '#5B2DFF',
                  boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
                }}
                className="px-6 py-3 rounded-full text-xs font-semibold text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Xác nhận ghép đôi ({Object.keys(pairedMatches).length}/{currentQ.matchingPairs.length})
              </button>
            )}
          </div>
        )}

        {/* 4. DẠNG SẮP XẾP THỨ TỰ */}
        {currentQ.type === 'ordering' && currentQ.orderingItems && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#8E8E93]">
              Dùng mũi tên để di chuyển các bước theo thứ tự hợp lý:
            </p>

            <div className="space-y-2">
              {currentOrder.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-[#FCFAF6] border border-black/[0.06] rounded-2xl text-xs font-medium"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#EDE8FF] text-[#5B2DFF] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[#1F1F28]">{item}</span>
                  </div>

                  {!isAnswered && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrderItem(idx, 'up')}
                        className="p-1.5 text-[#8E8E93] hover:text-[#1F1F28] disabled:opacity-30 rounded-full hover:bg-black/5"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentOrder.length - 1}
                        onClick={() => handleMoveOrderItem(idx, 'down')}
                        className="p-1.5 text-[#8E8E93] hover:text-[#1F1F28] disabled:opacity-30 rounded-full hover:bg-black/5"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
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
                style={{
                  backgroundColor: '#5B2DFF',
                  boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
                }}
                className="px-6 py-3 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Xác nhận thứ tự
              </button>
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK LOOP CARD TỨC THÌ SAU MỖI CÂU HỎI (Lilac Flow High-End Card) */}
      {isAnswered && (
        <div
          style={{
            boxShadow: '0 16px 36px rgba(91, 45, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
          className={`rounded-3xl p-6 sm:p-8 border transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-5 ${
            isCurrentCorrect
              ? 'bg-gradient-to-br from-emerald-50/90 to-white border-emerald-300/80'
              : 'bg-gradient-to-br from-rose-50/90 to-white border-rose-300/80'
          }`}
        >
          {/* Header kết quả */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  isCurrentCorrect
                    ? 'bg-emerald-600 shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
                    : 'bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.35)]'
                }`}
              >
                {isCurrentCorrect ? <Check className="w-5 h-5 stroke-[3]" /> : <AlertCircle className="w-5 h-5 stroke-[3]" />}
              </div>
              <div>
                <h4 className="font-flow-serif text-lg sm:text-xl font-normal text-[#1F1F28]">
                  {isCurrentCorrect ? 'Chính xác! Làm rất tốt!' : 'Chưa chính xác'}
                </h4>
                <p className="text-[11px] text-[#8E8E93]">
                  {isCurrentCorrect ? 'Bạn đã ghi nhớ đúng kiến thức này.' : 'Hãy xem giải thích chi tiết bên dưới để nhớ lâu hơn.'}
                </p>
              </div>
            </div>

            {/* Nút sang câu tiếp theo (Pill Button nổi bật) */}
            <button
              onClick={handleNextQuestion}
              style={{
                backgroundColor: '#5B2DFF',
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
              }}
              className="group px-6 py-3 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>{currentIndex + 1 < total ? 'Câu tiếp theo' : 'Xem kết quả bài thi'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Đáp án chuẩn */}
          <div className="p-4 rounded-2xl bg-white/90 border border-black/[0.05] space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#8E8E93]">Đáp án chuẩn xác</p>
            <p className="font-flow-serif text-base font-medium text-[#5B2DFF]">{currentQ.correctAnswer}</p>
          </div>

          {/* Giải thích chi tiết */}
          {currentQ.explanation && (
            <div className="p-4 rounded-2xl bg-white/90 border border-black/[0.05] space-y-1.5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {currentQ.memoryTip && (
              <div className="p-3.5 rounded-2xl bg-[#EDE8FF]/50 border border-[#C8B4FF]/40 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B2DFF]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Mẹo nhớ nhanh:</span>
                </div>
                <p className="text-[11px] text-[#1F1F28] leading-relaxed">
                  {currentQ.memoryTip}
                </p>
              </div>
            )}

            {currentQ.example && (
              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.05] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8E8E93]">
                  <BookOpen className="w-3.5 h-3.5 text-[#5B2DFF]" />
                  <span>Ví dụ thực tế:</span>
                </div>
                <p className="text-[11px] text-[#8E8E93] italic leading-relaxed">
                  "{currentQ.example}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
