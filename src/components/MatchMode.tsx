import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Clock, RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';
import { StudySet, Question } from '../types';

interface MatchModeProps {
  studySet: StudySet;
  onBack: () => void;
}

interface TileItem {
  id: string; // unique tile id
  pairKey: string; // shared key for matching pair
  text: string;
  isTerm: boolean;
  isMatched: boolean;
  isWrong: boolean;
}

export const MatchMode: React.FC<MatchModeProps> = ({ studySet, onBack }) => {
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<any>(null);

  // Khởi tạo bàn ghép
  useEffect(() => {
    initGame();
    return () => clearInterval(timerRef.current);
  }, [studySet]);

  const initGame = () => {
    clearInterval(timerRef.current);
    setElapsedTime(0);
    setIsGameOver(false);
    setSelectedTileId(null);

    // Lấy tối đa 6 câu hỏi từ bộ thẻ để tạo 12 ô thẻ
    const sampleQuestions = [...studySet.questions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    const generatedTiles: TileItem[] = [];

    sampleQuestions.forEach((q, idx) => {
      const pairKey = `pair-${idx}`;
      // Thẻ Thuật ngữ / Câu hỏi tóm tắt
      generatedTiles.push({
        id: `tile-term-${idx}`,
        pairKey,
        text: q.prompt.length > 70 ? q.prompt.substring(0, 67) + '...' : q.prompt,
        isTerm: true,
        isMatched: false,
        isWrong: false
      });
      // Thẻ Đáp án / Định nghĩa
      generatedTiles.push({
        id: `tile-ans-${idx}`,
        pairKey,
        text: q.correctAnswer.length > 70 ? q.correctAnswer.substring(0, 67) + '...' : q.correctAnswer,
        isTerm: false,
        isMatched: false,
        isWrong: false
      });
    });

    // Xáo trộn 12 ô thẻ
    setTiles(generatedTiles.sort(() => 0.5 - Math.random()));
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
    }, 100);
  };

  const handleTileClick = (tileId: string) => {
    if (isGameOver) return;
    const clicked = tiles.find(t => t.id === tileId);
    if (!clicked || clicked.isMatched) return;

    // Chưa chọn ô nào trước đó
    if (!selectedTileId) {
      setSelectedTileId(tileId);
      return;
    }

    // Nhấp vào chính nó
    if (selectedTileId === tileId) {
      setSelectedTileId(null);
      return;
    }

    // Đã chọn ô thứ 2, kiểm tra ghép đôi
    const first = tiles.find(t => t.id === selectedTileId);
    if (!first) return;

    if (first.pairKey === clicked.pairKey && first.isTerm !== clicked.isTerm) {
      // GHÉP ĐÚNG CẶP!
      setTiles(prev =>
        prev.map(t =>
          t.id === first.id || t.id === clicked.id
            ? { ...t, isMatched: true, isWrong: false }
            : t
        )
      );
      setSelectedTileId(null);

      // Kiểm tra hoàn thành tất cả
      setTimeout(() => {
        setTiles(current => {
          const remaining = current.filter(t => !t.isMatched);
          if (remaining.length === 0) {
            handleGameWin();
          }
          return current;
        });
      }, 50);
    } else {
      // GHÉP SAI
      setTiles(prev =>
        prev.map(t =>
          t.id === first.id || t.id === clicked.id
            ? { ...t, isWrong: true }
            : t
        )
      );
      setTimeout(() => {
        setTiles(prev =>
          prev.map(t =>
            t.id === first.id || t.id === clicked.id
              ? { ...t, isWrong: false }
              : t
          )
        );
        setSelectedTileId(null);
      }, 600);
    }
  };

  const handleGameWin = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsGameOver(true);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  if (studySet.questions.length < 2) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm text-slate-500">
          Chế độ Ghép thẻ yêu cầu ít nhất 2 câu hỏi trong bộ thẻ.
        </p>
        <button onClick={onBack} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar */}
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
              <span>Trò chơi ghép thẻ</span>
              <span aria-hidden="true">·</span>
              <span>{studySet.title}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Ghép nối khái niệm và định nghĩa
            </h2>
          </div>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-800">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{elapsedTime.toFixed(1)}s</span>
          </div>

          <button
            onClick={initGame}
            title="Bắt đầu lại"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game board */}
      {isGameOver ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Xuất sắc! Đã ghép hết các thẻ!
          </h3>

          <div className="text-3xl font-black text-indigo-600 font-mono">
            {elapsedTime.toFixed(1)} giây
          </div>

          <p className="text-xs text-slate-500">
            Tốc độ ghi nhớ phản xạ của bạn rất ấn tượng!
          </p>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={initGame}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại ván mới</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              Về bộ thẻ
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tiles.map(tile => {
            if (tile.isMatched) {
              return (
                <div
                  key={tile.id}
                  className="min-h-[110px] rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 flex items-center justify-center text-center opacity-40 select-none"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              );
            }

            const isSelected = selectedTileId === tile.id;

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile.id)}
                className={`min-h-[110px] p-3.5 rounded-2xl border text-center flex flex-col justify-center items-center transition-all cursor-pointer select-none shadow-2xs ${
                  tile.isWrong
                    ? 'border-rose-400 bg-rose-50 text-rose-900 scale-95 ring-2 ring-rose-200'
                    : isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-300 scale-102'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {tile.isTerm ? 'Thuật ngữ' : 'Định nghĩa'}
                </span>
                <span className="text-xs font-medium leading-snug line-clamp-4">
                  {tile.text}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
