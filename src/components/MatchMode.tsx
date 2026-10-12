import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Clock, RotateCcw, Trophy, CheckCircle2, Sparkles, Check } from 'lucide-react';
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

      // Kiểm tra xem đã ghép hết chưa
      setTimeout(() => {
        setTiles(latest => {
          const allMatched = latest.every(t => t.isMatched);
          if (allMatched) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsGameOver(true);
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#5B2DFF', '#C8B4FF', '#10B981']
              });
            } catch (err) {
              // safe fallback
            }
          }
          return latest;
        });
      }, 300);
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
      }, 700);
    }
  };

  if (studySet.questions.length < 2) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="font-flow-serif text-2xl font-normal text-[#1F1F28]">Cần tối thiểu 2 câu hỏi</h3>
        <p className="text-xs text-[#8E8E93]">Chế độ Ghép thẻ tính giờ yêu cầu tối thiểu 2 thuật ngữ trong bộ thẻ.</p>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#5B2DFF] shadow-[0_8px_20px_rgba(91,45,255,0.35)] cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] bg-white border border-black/[0.06] rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Thoát trò chơi"
          >
            <ArrowLeft className="w-4 h-4 text-[#5B2DFF]" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#8E8E93]">
              <span className="uppercase tracking-wider">Ghép thẻ tốc độ</span>
              <span aria-hidden="true">&bull;</span>
              <span className="text-[#1F1F28] font-semibold truncate max-w-[180px] sm:max-w-xs">{studySet.title}</span>
            </div>
            <h2 className="font-flow-serif text-lg sm:text-xl font-normal text-[#1F1F28]">
              Nối đúng cặp nhanh nhất
            </h2>
          </div>
        </div>

        {/* Timer pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] shadow-2xs">
          <Clock className="w-4 h-4 text-[#5B2DFF]" />
          <span className="font-mono text-sm font-semibold text-[#1F1F28]">
            {elapsedTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Màn hình chiến thắng khi hoàn thành */}
      {isGameOver ? (
        <div
          style={{
            boxShadow: '0 16px 36px rgba(91, 45, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-black/[0.05] text-center space-y-6 animate-in zoom-in-95 duration-300 max-w-lg mx-auto"
        >
          <div
            style={{ boxShadow: '0 8px 24px rgba(91, 45, 255, 0.35)' }}
            className="w-16 h-16 mx-auto rounded-full bg-[#5B2DFF] text-white flex items-center justify-center"
          >
            <Trophy className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDE8FF] text-[#5B2DFF] border border-[#5B2DFF]/15">
              <Sparkles className="w-3 h-3" /> Thành tích xuất sắc
            </div>
            <h3 className="font-flow-serif text-3xl font-normal text-[#1F1F28]">Hoàn thành thử thách!</h3>
            <p className="text-xs text-[#8E8E93]">
              Bạn đã ghép chính xác toàn bộ các cặp thuật ngữ và định nghĩa.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FCFAF6] border border-black/[0.05]">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8E93]">Thời gian hoàn thành</p>
            <p className="font-flow-serif text-4xl font-medium text-[#5B2DFF] mt-1">
              {elapsedTime.toFixed(1)} <span className="text-sm font-sans text-[#8E8E93]">giây</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-[#1F1F28] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5B2DFF]" />
              <span>Chơi lại</span>
            </button>
            <button
              onClick={onBack}
              style={{
                backgroundColor: '#5B2DFF',
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
              }}
              className="px-7 py-3 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Trở về bộ thẻ
            </button>
          </div>
        </div>
      ) : (
        /* Grid 12 ô thẻ (Lilac Flow Style) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map(tile => {
            const isSelected = selectedTileId === tile.id;

            if (tile.isMatched) {
              return (
                <div
                  key={tile.id}
                  className="min-h-[110px] sm:min-h-[130px] rounded-2xl border border-dashed border-emerald-300/40 bg-emerald-50/20 flex flex-col items-center justify-center p-3 opacity-40 transition-opacity"
                >
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] text-emerald-700 font-medium mt-1">Đã khớp</span>
                </div>
              );
            }

            let tileClasses = 'bg-white border-black/[0.06] text-[#1F1F28] hover:border-[#5B2DFF]/40 hover:bg-[#F4EFFE]';
            if (isSelected) {
              tileClasses = 'border-[#5B2DFF] bg-[#EDE8FF] text-[#5B2DFF] ring-2 ring-[#5B2DFF]/30 font-semibold shadow-[0_8px_20px_rgba(91,45,255,0.25)]';
            } else if (tile.isWrong) {
              tileClasses = 'border-rose-400 bg-rose-50 text-rose-900 animate-shake';
            }

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile.id)}
                style={{
                  boxShadow: isSelected ? undefined : '0 10px 24px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.02)',
                }}
                className={`min-h-[110px] sm:min-h-[130px] p-4 rounded-2xl border text-xs sm:text-sm font-medium flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer select-none ${tileClasses}`}
              >
                <span className="line-clamp-4 leading-snug">{tile.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
