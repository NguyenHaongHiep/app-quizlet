/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AppStateProvider, useAppState } from './lib/app-state';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SetDetailView } from './components/SetDetailView';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { MatchMode } from './components/MatchMode';
import { WriteMode } from './components/WriteMode';
import { FileImportModal } from './components/FileImportModal';
import { CourseModal } from './components/CourseModal';
import { SetModal } from './components/SetModal';
import { QuestionModal } from './components/QuestionModal';
import { Course, StudySet, Question } from './types';
import { Layers, Upload, Plus, Home } from 'lucide-react';

function MainApp() {
  const {
    courses,
    studySets,
    activeCourseId,
    activeSetId,
    activeMode,
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

  // Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetSetId, setImportTargetSetId] = useState<string | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<StudySet | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Active Set and Course
  const currentSet = studySets.find(s => s.id === activeSetId) || null;
  const currentCourse = currentSet ? courses.find(c => c.id === currentSet.courseId) || undefined : undefined;

  // Handlers for Modals
  const handleOpenImport = (targetSet?: string | null) => {
    setImportTargetSetId(targetSet || null);
    setIsImportModalOpen(true);
  };

  const handleOpenNewCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleOpenNewSet = () => {
    setEditingSet(null);
    setIsSetModalOpen(true);
  };

  const handleOpenEditSet = () => {
    if (currentSet) {
      setEditingSet(currentSet);
      setIsSetModalOpen(true);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
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
    <div className="min-h-screen bg-[#FCFAF6] text-[#1F1F28] flex flex-col justify-between selection:bg-[#5B2DFF] selection:text-white pb-24 sm:pb-10">
      <div>
        {/* Sticky Top Bar Header with Supabase Auth Profile */}
        <Navbar
          onOpenImportModal={() => handleOpenImport()}
          onOpenNewCourseModal={handleOpenNewCourse}
          onOpenNewSetModal={handleOpenNewSet}
        />

        {/* Dynamic View Router */}
        <main>
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

      {/* Footer (Clean Warm Ivory & Lilac Flow) */}
      <footer className="mt-16 border-t border-black/[0.04] py-8 text-center text-xs text-[#8E8E93]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <span className="font-flow-serif text-sm font-medium text-[#1F1F28]">QUIZSTUDY / FLOW</span>
          <span aria-hidden="true">&bull;</span>
          <span>Ứng dụng học tập (made by NHH and Gehihi)</span>
        </div>
      </footer>

      {/* Mobile Bottom Dock for Thumb-reach Navigation (iPhone & iPad) */}
      <nav
        style={{
          boxShadow: '0 -10px 30px rgba(91, 45, 255, 0.04), 0 -1px 3px rgba(0, 0, 0, 0.02)',
        }}
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.06] px-6 py-2 flex items-center justify-around text-[#8E8E93]"
      >
        <button
          onClick={() => {
            setActiveSetId(null);
            setActiveMode(null);
          }}
          className={`flex flex-col items-center gap-1 text-[11px] cursor-pointer ${
            !activeSetId && !activeMode ? 'text-[#5B2DFF] font-semibold' : ''
          }`}
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => {
            setActiveSetId(null);
            setActiveMode(null);
          }}
          className={`flex flex-col items-center gap-1 text-[11px] cursor-pointer ${
            activeSetId ? 'text-[#5B2DFF] font-semibold' : ''
          }`}
        >
          <Layers className="w-5 h-5 stroke-[2]" />
          <span>Bộ thẻ</span>
        </button>

        <button
          onClick={handleOpenNewSet}
          className="flex flex-col items-center gap-1 text-[11px] text-[#5B2DFF] font-semibold cursor-pointer"
        >
          <div
            style={{
              backgroundColor: '#5B2DFF',
              boxShadow: '0 8px 18px rgba(91, 45, 255, 0.35)',
            }}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center -mt-5 hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span>Tạo mới</span>
        </button>

        <button
          onClick={() => handleOpenImport()}
          className="flex flex-col items-center gap-1 text-[11px] hover:text-[#1F1F28] cursor-pointer"
        >
          <Upload className="w-5 h-5 stroke-[2]" />
          <span>Nhập file</span>
        </button>
      </nav>

      {/* MODALS (ALL STYLED IN LILAC FLOW) */}
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
        onSave={async (data) => {
          if (editingSet) {
            await updateStudySet(editingSet.id, data);
          } else {
            const newSet = await addStudySet(data);
            setActiveSetId(newSet.id);
            setActiveMode(null);
          }
        }}
        courses={courses}
        initialSet={editingSet}
        defaultCourseId={activeCourseId}
      />

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF6] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#5B2DFF]/20 border-t-[#5B2DFF] rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-[#8E8E93] font-medium font-mono">
          Đang kiểm tra phiên đăng nhập...
        </span>
      </div>
    );
  }

  // Protected Routes: If not logged in, show clean AuthScreen (Login/Signup)
  if (!user) {
    return <AuthScreen />;
  }

  // If logged in, provide AppState isolated to the current user
  return (
    <AppStateProvider>
      <MainApp />
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
