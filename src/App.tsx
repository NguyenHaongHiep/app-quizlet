/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AppStateProvider, useAppState } from './lib/app-state';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { SetDetailView } from './components/SetDetailView';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { MatchMode } from './components/MatchMode';
import { WriteMode } from './components/WriteMode';
import { FileImportModal } from './components/FileImportModal';
import { CourseModal } from './components/CourseModal';
import { SetModal } from './components/SetModal';
import { QuestionModal } from './components/QuestionModal';
import { DatabaseSetupModal } from './components/DatabaseSetupModal';
import { Course, StudySet, Question } from './types';
import {
  Menu,
  AlertCircle,
  Database,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { sound } from './lib/sound';

function MainApp() {
  const {
    courses,
    studySets,
    activeCourseId,
    activeSetId,
    activeMode,
    isSyncing,
    syncError,
    refreshFromSupabase,
    setActiveCourseId,
    setActiveSetId,
    setActiveMode,
    addCourse,
    updateCourse,
    addStudySet,
    updateStudySet,
    deleteStudySet,
    addQuestionToSet,
    updateQuestionInSet,
    deleteQuestionFromSet,
    toggleStarQuestion,
    toggleMasterQuestion,
    recordQuizResult
  } = useAppState();

  // Navigation View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'modules' | 'analytics'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('flow_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('flow_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetSetId, setImportTargetSetId] = useState<string | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<StudySet | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDbSetupModalOpen, setIsDbSetupModalOpen] = useState(false);

  // Active Set and Course
  const currentSet = studySets.find(s => s.id === activeSetId) || null;
  const currentCourse = currentSet ? courses.find(c => c.id === currentSet.courseId) || undefined : undefined;

  // Handlers for Modals
  const handleOpenImport = (targetSet?: string | null) => {
    sound.playClick();
    setImportTargetSetId(targetSet || null);
    setIsImportModalOpen(true);
  };

  const handleOpenNewCourse = () => {
    sound.playClick();
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    sound.playClick();
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleOpenNewSet = () => {
    sound.playClick();
    setEditingSet(null);
    setIsSetModalOpen(true);
  };

  const handleOpenEditSet = () => {
    if (currentSet) {
      sound.playClick();
      setEditingSet(currentSet);
      setIsSetModalOpen(true);
    }
  };

  const handleOpenAddQuestion = () => {
    sound.playClick();
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    sound.playClick();
    setEditingQuestion(q);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (qData: Omit<Question, 'id'>) => {
    if (!activeSetId) return;
    if (editingQuestion) {
      updateQuestionInSet(activeSetId, editingQuestion.id, qData);
    } else {
      addQuestionToSet(activeSetId, qData);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100 transition-colors selection:bg-[#007afc] selection:text-white">
      {/* 1. FIXED GLASSMORPHISM SIDEBAR (280px) */}
      <Sidebar
        currentView={currentView}
        onNavigateView={(view) => {
          setCurrentView(view);
          if (view === 'dashboard' || view === 'analytics') {
            setActiveSetId(null);
            setActiveMode(null);
          }
        }}
        onOpenNewCourse={handleOpenNewCourse}
        onOpenNewSet={handleOpenNewSet}
        onOpenImport={() => handleOpenImport()}
        onOpenDbSetup={() => setIsDbSetupModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* 2. MAIN CONTENT AREA (Occupies remaining width with 280px left margin on desktop) */}
      <div className="flex-1 min-w-0 lg:ml-[280px] flex flex-col min-h-screen">
        {/* Mobile Header Bar */}
        <header className="lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between glass-card-sm border-b border-white/40 dark:border-white/10">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#007afc] to-purple-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              QUIZSTUDY
            </span>
          </div>

          <div className="w-8" />
        </header>

        {/* Sync Status Banner (if offline or database schema notice) */}
        {syncError && (() => {
          const isSchemaError = Boolean(
            syncError.toLowerCase().includes('courses') ||
            syncError.toLowerCase().includes('schema cache') ||
            syncError.toLowerCase().includes('could not find the table')
          );

          return (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 transition-all">
              <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    <strong>Dữ liệu ngoại tuyến:</strong>{' '}
                    {isSchemaError ? (
                      <span>
                        Dự án Supabase chưa được tạo bảng dữ liệu (<code className="font-mono bg-amber-200/60 dark:bg-amber-950/60 px-1 py-0.5 rounded text-[11px]">public.courses</code>).
                      </span>
                    ) : (
                      syncError
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isSchemaError && (
                    <button
                      onClick={() => setIsDbSetupModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-medium cursor-pointer shadow-xs text-xs"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Khắc phục: Tạo bảng SQL (1-Click)</span>
                    </button>
                  )}
                  <button
                    onClick={() => refreshFromSupabase(true)}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-lg hover:bg-amber-50 transition font-medium cursor-pointer text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Đang thử...' : 'Thử lại'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Dynamic Route View */}
        <main className="flex-1 pb-16">
          {activeMode === 'flashcard' && currentSet ? (
            <FlashcardMode
              key={`fc-${currentSet.id}`}
              studySet={currentSet}
              onBack={() => setActiveMode(null)}
              onToggleStar={(qId) => toggleStarQuestion(currentSet.id, qId)}
              onToggleMaster={(qId) => toggleMasterQuestion(currentSet.id, qId)}
            />
          ) : activeMode === 'quiz' && currentSet ? (
            <QuizMode
              key={`qz-${currentSet.id}`}
              studySet={currentSet}
              onBack={() => setActiveMode(null)}
              onRecordResult={recordQuizResult}
            />
          ) : activeMode === 'match' && currentSet ? (
            <MatchMode
              key={`mc-${currentSet.id}`}
              studySet={currentSet}
              onBack={() => setActiveMode(null)}
            />
          ) : activeMode === 'write' && currentSet ? (
            <WriteMode
              key={`wr-${currentSet.id}`}
              studySet={currentSet}
              onBack={() => setActiveMode(null)}
            />
          ) : currentSet ? (
            <SetDetailView
              key={`view-${currentSet.id}`}
              studySet={currentSet}
              course={currentCourse}
              onBack={() => {
                setActiveSetId(null);
                setActiveMode(null);
              }}
              onLaunchMode={(mode) => setActiveMode(mode)}
              onOpenAddQuestion={handleOpenAddQuestion}
              onOpenEditQuestion={handleOpenEditQuestion}
              onDeleteQuestion={(qId) => deleteQuestionFromSet(currentSet.id, qId)}
              onToggleStar={(qId) => toggleStarQuestion(currentSet.id, qId)}
              onToggleMaster={(qId) => toggleMasterQuestion(currentSet.id, qId)}
              onOpenImportModal={() => handleOpenImport(currentSet.id)}
              onOpenEditSet={handleOpenEditSet}
              onDeleteSet={() => deleteStudySet(currentSet.id)}
            />
          ) : currentView === 'analytics' ? (
            <AnalyticsView
              onStudySet={(setId, mode) => {
                setActiveSetId(setId);
                setActiveMode(mode);
              }}
            />
          ) : (
            <DashboardView
              onOpenNewCourse={handleOpenNewCourse}
              onOpenNewSet={handleOpenNewSet}
              onOpenImportModal={() => handleOpenImport()}
              onEditCourse={handleOpenEditCourse}
            />
          )}
        </main>
      </div>

      {/* ALL MODALS */}
      <FileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetSetId={importTargetSetId}
      />

      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={(data) => {
          if (editingCourse) {
            updateCourse(editingCourse.id, data);
          } else {
            addCourse(data);
          }
        }}
        initialCourse={editingCourse}
      />

      <SetModal
        isOpen={isSetModalOpen}
        onClose={() => setIsSetModalOpen(false)}
        courses={courses}
        onSave={async (data) => {
          if (editingSet) {
            updateStudySet(editingSet.id, data);
          } else {
            let targetCourseId = data.courseId;
            if (!targetCourseId || targetCourseId === 'AUTO_DEFAULT' || courses.length === 0) {
              const defaultCourse = await addCourse({
                code: 'GEN101',
                name: 'Học phần Chung',
                description: 'Học phần tự động tạo cho các bộ thẻ học tập',
                color: '#007afc',
                semester: 'Học kỳ 1'
              });
              targetCourseId = defaultCourse.id;
            }
            addStudySet({
              ...data,
              courseId: targetCourseId
            });
          }
        }}
        initialSet={editingSet}
      />

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />

      <DatabaseSetupModal
        isOpen={isDbSetupModalOpen}
        onClose={() => setIsDbSetupModalOpen(false)}
        onRetrySync={async () => {
          await refreshFromSupabase(true);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <AuthGate />
      </AppStateProvider>
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, isConfigured } = useAuth();

  // If Supabase is configured and user is not logged in, show Auth Screen
  if (isConfigured && !user) {
    return <AuthScreen />;
  }

  return <MainApp />;
}

export default App;
