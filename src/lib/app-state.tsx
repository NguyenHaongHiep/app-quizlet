import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, StudySet, Question, StudyMode, UserStats } from '../types';
import { INITIAL_COURSES, INITIAL_STUDY_SETS } from './sample-data';

interface AppStateContextType {
  courses: Course[];
  studySets: StudySet[];
  activeCourseId: string | null;
  activeSetId: string | null;
  activeMode: StudyMode | null;
  stats: UserStats;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveCourseId: (id: string | null) => void;
  setActiveSetId: (id: string | null) => void;
  setActiveMode: (mode: StudyMode | null) => void;
  
  // Quản lý Học phần (Course CRUD)
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Quản lý Bộ thẻ (Study Set CRUD)
  addStudySet: (set: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt'>) => StudySet;
  updateStudySet: (id: string, updates: Partial<StudySet>) => void;
  deleteStudySet: (id: string) => void;
  
  // Quản lý Câu hỏi bên trong Bộ thẻ
  addQuestionToSet: (setId: string, question: Omit<Question, 'id'>) => void;
  updateQuestionInSet: (setId: string, questionId: string, updates: Partial<Question>) => void;
  deleteQuestionFromSet: (setId: string, questionId: string) => void;
  addBulkQuestionsToSet: (setId: string, questions: Question[]) => void;
  
  // Trạng thái học tập
  toggleStarQuestion: (setId: string, questionId: string) => void;
  toggleMasterQuestion: (setId: string, questionId: string) => void;
  recordQuizResult: (correctCount: number, totalCount: number) => void;
  
  // Tiện ích
  resetToDefaultData: () => void;
  exportAllDataAsJson: () => void;
}

const STORAGE_KEY_COURSES = 'uniflash_courses_v1';
const STORAGE_KEY_SETS = 'uniflash_sets_v1';
const STORAGE_KEY_STATS = 'uniflash_stats_v1';

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [studySets, setStudySets] = useState<StudySet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETS);
      return saved ? JSON.parse(saved) : INITIAL_STUDY_SETS;
    } catch {
      return INITIAL_STUDY_SETS;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      return saved ? JSON.parse(saved) : {
        streakDays: 3,
        totalCardsStudied: 42,
        quizzesCompleted: 7,
        accuracyRate: 85
      };
    } catch {
      return {
        streakDays: 3,
        totalCardsStudied: 42,
        quizzesCompleted: 7,
        accuracyRate: 85
      };
    }
  });

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<StudyMode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Tự động lưu trữ vào LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    } catch (e) {
      console.warn('Lỗi lưu courses vào LocalStorage:', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETS, JSON.stringify(studySets));
    } catch (e) {
      console.warn('Lỗi lưu studySets vào LocalStorage:', e);
    }
  }, [studySets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Lỗi lưu stats vào LocalStorage:', e);
    }
  }, [stats]);

  // Quản lý Học phần
  const addCourse = (data: Omit<Course, 'id' | 'createdAt'>): Course => {
    const newCourse: Course = {
      ...data,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCourses(prev => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    // Xóa các bộ thẻ thuộc học phần này
    setStudySets(prev => prev.filter(s => s.courseId !== id));
    if (activeCourseId === id) setActiveCourseId(null);
  };

  // Quản lý Bộ thẻ
  const addStudySet = (data: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt'>): StudySet => {
    const now = new Date().toISOString();
    const newSet: StudySet = {
      ...data,
      id: `set-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setStudySets(prev => [newSet, ...prev]);
    return newSet;
  };

  const updateStudySet = (id: string, updates: Partial<StudySet>) => {
    setStudySets(prev => prev.map(s => s.id === id ? {
      ...s,
      ...updates,
      updatedAt: new Date().toISOString()
    } : s));
  };

  const deleteStudySet = (id: string) => {
    setStudySets(prev => prev.filter(s => s.id !== id));
    if (activeSetId === id) {
      setActiveSetId(null);
      setActiveMode(null);
    }
  };

  // Quản lý Câu hỏi
  const addQuestionToSet = (setId: string, questionData: Omit<Question, 'id'>) => {
    const newQ: Question = {
      ...questionData,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setStudySets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        updatedAt: new Date().toISOString(),
        questions: [...s.questions, newQ]
      };
    }));
  };

  const updateQuestionInSet = (setId: string, questionId: string, updates: Partial<Question>) => {
    setStudySets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        updatedAt: new Date().toISOString(),
        questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
      };
    }));
  };

  const deleteQuestionFromSet = (setId: string, questionId: string) => {
    setStudySets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        updatedAt: new Date().toISOString(),
        questions: s.questions.filter(q => q.id !== questionId)
      };
    }));
  };

  const addBulkQuestionsToSet = (setId: string, newQuestions: Question[]) => {
    setStudySets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        updatedAt: new Date().toISOString(),
        questions: [...s.questions, ...newQuestions]
      };
    }));
  };

  const toggleStarQuestion = (setId: string, questionId: string) => {
    setStudySets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        questions: s.questions.map(q => q.id === questionId ? { ...q, starred: !q.starred } : q)
      };
    }));
  };

  const toggleMasterQuestion = (setId: string, questionId: string) => {
    setStudySets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        questions: s.questions.map(q => q.id === questionId ? { ...q, mastered: !q.mastered } : q)
      };
    }));
  };

  const recordQuizResult = (correctCount: number, totalCount: number) => {
    setStats(prev => {
      const newTotal = prev.totalCardsStudied + totalCount;
      const newQuizzes = prev.quizzesCompleted + 1;
      const thisAccuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
      const newAccuracy = Math.round((prev.accuracyRate * prev.quizzesCompleted + thisAccuracy) / newQuizzes);
      return {
        ...prev,
        totalCardsStudied: newTotal,
        quizzesCompleted: newQuizzes,
        accuracyRate: newAccuracy
      };
    });
  };

  const resetToDefaultData = () => {
    setCourses(INITIAL_COURSES);
    setStudySets(INITIAL_STUDY_SETS);
    localStorage.removeItem(STORAGE_KEY_COURSES);
    localStorage.removeItem(STORAGE_KEY_SETS);
  };

  const exportAllDataAsJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      courses,
      studySets
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UniFlash_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppStateContext.Provider
      value={{
        courses,
        studySets,
        activeCourseId,
        activeSetId,
        activeMode,
        stats,
        searchQuery,
        setSearchQuery,
        setActiveCourseId,
        setActiveSetId,
        setActiveMode,
        addCourse,
        updateCourse,
        deleteCourse,
        addStudySet,
        updateStudySet,
        deleteStudySet,
        addQuestionToSet,
        updateQuestionInSet,
        deleteQuestionFromSet,
        addBulkQuestionsToSet,
        toggleStarQuestion,
        toggleMasterQuestion,
        recordQuizResult,
        resetToDefaultData,
        exportAllDataAsJson
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState phải được dùng bên trong AppStateProvider');
  }
  return context;
};
