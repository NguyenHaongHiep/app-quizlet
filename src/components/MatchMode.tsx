import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Clock, RotateCcw, Trophy, CheckCircle2, Sparkles, Check } from 'lucide-react';
import { StudySet, Question } from '../types';
import { sound } from '../lib/sound';

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

    // Xáo trộn 12 ô
    setTiles(generatedTiles.sort(() => 0.5 - Math.random()));
    setIsRunning(true);

    // Bắt đầu đếm thời gian
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);
  };

  const handleTileClick = (clickedTile: TileItem) => {
    if (clickedTile.isMatched || clickedTile.isWrong || isGameOver) return;

    sound.playClick();

    // Chưa chọn ô nào trước đó -> chọn ô này
    if (!selectedTileId) {
      setSelectedTileId(clickedTile.id);
      return;
    }

    // Bấm lại đúng ô đang chọn -> hủy chọn
    if (selectedTileId === clickedTile.id) {
      setSelectedTileId(null);
      return;
    }

    // Đã chọn ô thứ 2 -> Kiểm tra khớp cặp
    const firstTile = tiles.find(t => t.id === selectedTileId);
    if (!firstTile) {
      setSelectedTileId(null);
      return;
    }

    // Không cho ghép 2 thẻ cùng loại (ví dụ 2 thuật ngữ với nhau)
    if (firstTile.isTerm === clickedTile.isTerm) {
      setSelectedTileId(clickedTile.id);
      return;
    }

    // Khớp cặp chính xác
    if (firstTile.pairKey === clickedTile.pairKey) {
      sound.playCorrect();
      setTiles(prev => prev.map(t => {
        if (t.id === firstTile.id || t.id === clickedTile.id) {
          return { ...t, isMatched: true };
        }
        return t;
      }));
      setSelectedTileId(null);

      // Kiểm tra hoàn thành tất cả
      setTimeout(() => {
        setTiles(currentTiles => {
          const remaining = currentTiles.filter(t => !t.isMatched);
          if (remaining.length === 0) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsGameOver(true);
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
          }
          return currentTiles;
        });
      }, 200);
    } else {
      // Sai cặp -> Rung lắc và báo đỏ
      sound.playWrong();
      setTiles(prev => prev.map(t => {
        if (t.id === firstTile.id || t.id === clickedTile.id) {
          return { ...t, isWrong: true };
        }
        return t;
      }));
      setSelectedTileId(null);

      setTimeout(() => {
        setTiles(prev => prev.map(t => {
          if (t.id === firstTile.id || t.id === clickedTile.id) {
            return { ...t, isWrong: false };
          }
          return t;
        }));
      }, 600);
    }
  };

  if (studySet.questions.length < 2) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Không đủ dữ liệu ghép thẻ</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bộ thẻ cần tối thiểu 2 câu hỏi/thuật ngữ để tạo trò chơi ghép thẻ.
        </p>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition cursor-pointer shadow-sm"
        >
          Quay lại bộ thẻ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 glass-card-sm p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition"
            title="Thoát trò chơi"
          >
            <ArrowLeft className="w-4 h-4 text-[#007afc]" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="uppercase tracking-wider">Ghép thẻ tốc độ</span>
              <span aria-hidden="true">&bull;</span>
              <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[180px] sm:max-w-xs">{studySet.title}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Nối đúng cặp nhanh nhất
            </h2>
          </div>
        </div>

        {/* Timer pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/10 shadow-xs">
          <Clock className="w-4 h-4 text-[#007afc]" />
          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
            {elapsedTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Màn hình chiến thắng khi hoàn thành */}
      {isGameOver ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95 duration-300 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Trophy className="w-8 h-8 stroke-[2.2] animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Hoàn thành thử thách!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bạn đã ghép chính xác toàn bộ các cặp thuật ngữ và định nghĩa.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Thời gian hoàn thành</p>
            <p className="text-4xl font-bold font-mono text-[#007afc] mt-1">
              {elapsedTime.toFixed(1)} <span className="text-sm font-sans text-slate-400">giây</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                sound.playClick();
                initGame();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-white/10 hover:bg-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#007afc]" />
              <span>Chơi lại</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="px-7 py-3 rounded-2xl text-xs font-semibold text-white bg-[#007afc] hover:bg-sky-600 transition cursor-pointer shadow-sm"
            >
              Trở về bộ thẻ
            </button>
          </div>
        </div>
      ) : (
        /* Grid 12 ô thẻ */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map(tile => {
            const isSelected = selectedTileId === tile.id;

            if (tile.isMatched) {
              return (
                <div
                  key={tile.id}
                  className="min-h-[110px] sm:min-h-[130px] rounded-2xl border border-dashed border-emerald-400/50 bg-emerald-500/10 flex flex-col items-center justify-center p-3 opacity-40 transition-opacity"
                >
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">Đã khớp</span>
                </div>
              );
            }

            let tileClasses = 'glass-card text-slate-900 dark:text-slate-100 hover:border-[#007afc]/50 hover:bg-white dark:hover:bg-white/10';
            if (isSelected) {
              tileClasses = 'border-[#007afc] bg-sky-50 dark:bg-sky-950/40 text-[#007afc] dark:text-sky-300 ring-2 ring-[#007afc]/30 font-bold shadow-md';
            } else if (tile.isWrong) {
              tileClasses = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 animate-shake';
            }

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile)}
                className={`min-h-[110px] sm:min-h-[130px] p-4 rounded-2xl border text-xs sm:text-sm font-medium flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer select-none ${tileClasses}`}
              >
                <span className="leading-snug break-words">{tile.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
