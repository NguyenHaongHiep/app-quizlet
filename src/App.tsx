/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './lib/app-state';
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
import { Course, StudySet, Question, StudyMode } from './types';
import { BookOpen, Layers, Upload, Plus, Home } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 pb-20 sm:pb-8">
      <div>
        {/* Sticky Top Bar Header */}
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

      {/* Footer (Clean & unboxed) */}
      <footer className="mt-16 border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">QuizStudy VN</span>
            <span aria-hidden="true">·</span>
            <span>Web/App học tập qua Quiz và Flashcard đa nền tảng cho sinh viên</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Tiếng Anh Học Thuật</span>
            <span aria-hidden="true">·</span>
            <span>Triết học Mác - Lênin</span>
            <span aria-hidden="true">·</span>
            <span>Đại số Tuyến tính</span>
            <span aria-hidden="true">·</span>
            <span>Kinh tế Vi mô</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Dock for Thumb-reach Navigation (iPhone & iPad) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around text-slate-600">
        <button
          onClick={() => {
            setActiveSetId(null);
            setActiveMode(null);
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            !activeSetId && !activeMode ? 'text-indigo-600 font-bold' : ''
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => {
            setActiveSetId(null);
            setActiveMode(null);
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            !activeSetId && !activeMode ? 'text-indigo-600 font-bold' : ''
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Bộ thẻ</span>
        </button>

        <button
          onClick={handleOpenNewSet}
          className="flex flex-col items-center gap-0.5 text-[11px] text-indigo-600 font-bold"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center -mt-3 shadow-sm shadow-indigo-300">
            <Plus className="w-5 h-5" />
          </div>
          <span className="mt-0.5">Tạo mới</span>
        </button>

        <button
          onClick={() => handleOpenImport()}
          className="flex flex-col items-center gap-0.5 text-[11px]"
        >
          <Upload className="w-5 h-5" />
          <span>Tải file</span>
        </button>
      </nav>

      {/* MODALS */}
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
        onSave={(data) => {
          if (editingSet) {
            updateStudySet(editingSet.id, data);
          } else {
            const newSet = addStudySet(data);
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

export default function App() {
  return (
    <AppStateProvider>
      <MainApp />
    </AppStateProvider>
  );
}
