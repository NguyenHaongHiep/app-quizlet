import React from 'react';
import {
  Flame,
  Trophy,
  CheckCircle2,
  BookOpen,
  Target,
  BarChart2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAppState } from '../lib/app-state';
import { sound } from '../lib/sound';

interface AnalyticsViewProps {
  onStudySet: (setId: string, mode: 'flashcard' | 'quiz') => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onStudySet }) => {
  const { courses, studySets, stats } = useAppState();

  // Aggregate Spaced Repetition Metrics across all sets
  let totalCards = 0;
  let masteredCards = 0;
  let starredCards = 0;
  let mistakenCards = 0;

  studySets.forEach(set => {
    totalCards += set.questions.length;
    set.questions.forEach(q => {
      if (q.mastered) masteredCards++;
      if (q.starred) starredCards++;
      if (q.lastAnsweredCorrect === false) mistakenCards++;
    });
  });

  const learningCards = totalCards - masteredCards;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const accuracy = Math.round(stats.accuracyRate) || 100;

  // Daily target (e.g., 20 cards per day target)
  const dailyTarget = 20;
  const cardsToday = Math.min(stats.totalCardsStudied, dailyTarget);
  const dailyPercent = Math.min(100, Math.round((cardsToday / dailyTarget) * 100));

  // Circular SVG progress calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Báo cáo học tập &amp; Spaced Repetition
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tiến độ &amp; Thống kê thành thạo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Theo dõi chi tiết hiệu suất ghi nhớ dài hạn, chuỗi streak hàng ngày và mức độ làm chủ các bộ thẻ học phần.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <Flame className="w-7 h-7 text-amber-500 animate-pulse fill-amber-500" />
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Chuỗi học tập</p>
              <p className="text-2xl font-bold font-mono tabular-nums leading-tight">{stats.streakDays} ngày</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Cards Studied */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Lượt ôn thẻ</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.totalCardsStudied}
            </span>
            <span className="text-xs text-slate-400">thẻ</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Tổng {totalCards} khái niệm trong kho
          </div>
        </div>

        {/* Metric 2: Daily Goal Progress */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Mục tiêu hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {cardsToday}/{dailyTarget}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {dailyPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Quizzes Completed */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Bài kiểm tra đã làm</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.quizzesCompleted}
            </span>
            <span className="text-xs text-slate-400">bài</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Đã đánh giá kiến thức
          </div>
        </div>

        {/* Metric 4: Spaced Repetition Mastery */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Độ thành thạo</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {masteryPercentage}%
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {masteredCards} thẻ thuộc
            </span>
          </div>
          <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Deep-Dive Section: Spaced Repetition Breakdown & Accuracy Circular Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Accuracy & Precision Gauge */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">
            Tỉ lệ trả lời chính xác (Accuracy Rate)
          </h3>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-200/50 dark:stroke-slate-700/50"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#007afc] transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                {accuracy}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                CHÍNH XÁC
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-xs">
            Dựa trên các lượt trả lời trắc nghiệm, nối từ và điền khuyết gần nhất của bạn.
          </p>
        </div>

        {/* Right: Spaced Repetition Retention Tiers */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Phân bổ bộ nhớ Spaced Repetition
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hệ thống tự động xếp hạng thẻ giúp bạn tập trung vào những câu hỏi chưa ghi nhớ vững chắc.
            </p>
          </div>

          <div className="space-y-4">
            {/* Mastered */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Đã thành thạo (Mastered)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Đã thuộc nhuần nhuyễn, chu kỳ ôn dài hạn
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {masteredCards}
                </span>
                <span className="text-xs text-slate-400 ml-1">thẻ</span>
              </div>
            </div>

            {/* Learning / Starred */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Đang học / Đánh dấu sao (Learning)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Cần lặp lại ngắt quãng để khắc sâu vào trí nhớ
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  {starredCards}
                </span>
                <span className="text-xs text-slate-400 ml-1">thẻ</span>
              </div>
            </div>

            {/* Mistaken Cards */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Câu sai gần đây (Needs Review)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Cần ưu tiên ôn lại trong chế độ Flashcard hoặc Quiz
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                  {mistakenCards}
                </span>
                <span className="text-xs text-slate-400 ml-1">thẻ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Course Breakdown */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Tiến độ theo Học phần
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => {
            const courseSets = studySets.filter(s => s.courseId === course.id);
            const courseQuestions = courseSets.reduce((sum, s) => sum + s.questions.length, 0);
            const courseMastered = courseSets.reduce(
              (sum, s) => sum + s.questions.filter(q => q.mastered).length,
              0
            );
            const coursePct = courseQuestions > 0 ? Math.round((courseMastered / courseQuestions) * 100) : 0;

            return (
              <div
                key={course.id}
                className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {course.code} &bull; {course.name}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {coursePct}%
                  </span>
                </div>

                <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${coursePct}%`,
                      backgroundColor: course.color || '#007afc'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>{courseSets.length} bộ thẻ</span>
                  <span>{courseMastered}/{courseQuestions} thẻ đã thuộc</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
