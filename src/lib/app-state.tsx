import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Course, StudySet, Question, StudyMode, UserStats } from '../types';
import { INITIAL_COURSES, INITIAL_STUDY_SETS, DEMO_COURSES, DEMO_STUDY_SETS } from './sample-data';
import { getSupabase } from './supabase';
import { useAuth } from './auth-context';

interface AppStateContextType {
  courses: Course[];
  studySets: StudySet[];
  activeCourseId: string | null;
  activeSetId: string | null;
  activeMode: StudyMode | null;
  stats: UserStats;
  searchQuery: string;
  isSyncing: boolean;
  syncError: string | null;
  setSearchQuery: (q: string) => void;
  setActiveCourseId: (id: string | null) => void;
  setActiveSetId: (id: string | null) => void;
  setActiveMode: (mode: StudyMode | null) => void;
  
  // Quản lý Học phần (Course CRUD)
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Promise<Course>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  // Quản lý Bộ thẻ (Study Set CRUD)
  addStudySet: (set: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'questions'> & { questions?: Question[] }) => Promise<StudySet>;
  updateStudySet: (id: string, updates: Partial<StudySet>) => Promise<void>;
  deleteStudySet: (id: string) => Promise<void>;
  
  // Quản lý Câu hỏi bên trong Bộ thẻ
  addQuestionToSet: (setId: string, question: Omit<Question, 'id'>) => Promise<void>;
  updateQuestionInSet: (setId: string, questionId: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestionFromSet: (setId: string, questionId: string) => Promise<void>;
  addBulkQuestionsToSet: (setId: string, questions: Question[]) => Promise<void>;
  
  // Trạng thái học tập
  toggleStarQuestion: (setId: string, questionId: string) => Promise<void>;
  toggleMasterQuestion: (setId: string, questionId: string) => Promise<void>;
  recordQuizResult: (correctCount: number, totalCount: number) => Promise<void>;
  
  // Tiện ích & Làm sạch dữ liệu
  hasSampleData: boolean;
  clearSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  exportAllDataAsJson: () => void;
  refreshFromSupabase: (showLoadingSpinner?: boolean) => Promise<boolean>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || null;

  // Cache keys namespaced by user ID for complete isolation in LocalStorage as well
  const STORAGE_KEY_COURSES = userId ? `uniflash_courses_${userId}` : 'uniflash_courses_guest';
  const STORAGE_KEY_SETS = userId ? `uniflash_sets_${userId}` : 'uniflash_sets_guest';
  const STORAGE_KEY_STATS = userId ? `uniflash_stats_${userId}` : 'uniflash_stats_guest';

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURSES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [studySets, setStudySets] = useState<StudySet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      return saved ? JSON.parse(saved) : {
        streakDays: 0,
        totalCardsStudied: 0,
        quizzesCompleted: 0,
        accuracyRate: 100
      };
    } catch {
      return {
        streakDays: 0,
        totalCardsStudied: 0,
        quizzesCompleted: 0,
        accuracyRate: 100
      };
    }
  });

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<StudyMode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Sync / fetch data from Supabase tied strictly to user_id
  const refreshFromSupabase = useCallback(async (showLoadingSpinner = true): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase || !userId || userId === 'guest-user') return false;

    if (showLoadingSpinner) {
      setIsSyncing(true);
    }
    setSyncError(null);

    try {
      // 1. Fetch courses filtered by user_id
      const { data: dbCourses, error: cErr } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cErr) throw cErr;

      // 2. Fetch study sets filtered by user_id
      const { data: dbSets, error: sErr } = await supabase
        .from('study_sets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sErr) throw sErr;

      // 3. Fetch user stats filtered by user_id
      const { data: dbStats, error: stErr } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // If user is brand new in Supabase (0 courses and 0 study sets in cloud), start clean
      if ((!dbCourses || dbCourses.length === 0) && (!dbSets || dbSets.length === 0)) {
        setCourses([]);
        setStudySets([]);
        setStats(dbStats ? {
          streakDays: dbStats.streak_days || 0,
          totalCardsStudied: dbStats.total_cards_studied || 0,
          quizzesCompleted: dbStats.quizzes_completed || 0,
          accuracyRate: dbStats.accuracy_rate || 100
        } : {
          streakDays: 0,
          totalCardsStudied: 0,
          quizzesCompleted: 0,
          accuracyRate: 100
        });
      } else {
        if (dbCourses) {
          const mappedCourses: Course[] = dbCourses.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            description: c.description || '',
            icon: c.icon,
            color: c.color || '#5B2DFF',
            semester: c.semester,
            createdAt: c.created_at
          }));
          setCourses(mappedCourses);
        }

        if (dbSets) {
          const mappedSets: StudySet[] = dbSets.map(s => ({
            id: s.id,
            courseId: s.course_id,
            title: s.title,
            description: s.description || '',
            color: s.color,
            icon: s.icon,
            questions: Array.isArray(s.questions) ? s.questions : [],
            createdAt: s.created_at,
            updatedAt: s.updated_at
          }));
          setStudySets(mappedSets);
        }

        if (dbStats && !stErr) {
          setStats({
            streakDays: dbStats.streak_days || 1,
            totalCardsStudied: dbStats.total_cards_studied || 0,
            quizzesCompleted: dbStats.quizzes_completed || 0,
            accuracyRate: dbStats.accuracy_rate || 100
          });
        }
        setSyncError(null);
        return true;
      }
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.warn('Lỗi đồng bộ hóa với Supabase:', err.message || err);
      // Fallback to locally cached data
      setSyncError(err.message || 'Không thể đồng bộ với Supabase. Đang chạy ở chế độ cục bộ.');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  // Trigger Supabase fetch whenever user changes, and set up Realtime subscription for cross-device sync
  useEffect(() => {
    if (!userId) {
      setCourses([]);
      setStudySets([]);
      setActiveCourseId(null);
      setActiveSetId(null);
      setActiveMode(null);
      return;
    }

    // Load user's local cache first to ensure immediate response
    try {
      const cachedCourses = localStorage.getItem(`uniflash_courses_${userId}`);
      const cachedSets = localStorage.getItem(`uniflash_sets_${userId}`);
      const cachedStats = localStorage.getItem(`uniflash_stats_${userId}`);
      setCourses(cachedCourses ? JSON.parse(cachedCourses) : []);
      setStudySets(cachedSets ? JSON.parse(cachedSets) : []);
      setStats(cachedStats ? JSON.parse(cachedStats) : {
        streakDays: 0,
        totalCardsStudied: 0,
        quizzesCompleted: 0,
        accuracyRate: 100
      });
    } catch (e) {
      setCourses([]);
      setStudySets([]);
    }

    if (userId === 'guest-user') return;

    // Always fetch remote data immediately from Supabase to sync with other devices
    refreshFromSupabase(true);

    // Set up Realtime listener on Supabase tables for automatic cross-device live sync
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`sync-user-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses', filter: `user_id=eq.${userId}` },
        () => {
          refreshFromSupabase(false);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sets', filter: `user_id=eq.${userId}` },
        () => {
          refreshFromSupabase(false);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${userId}` },
        () => {
          refreshFromSupabase(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshFromSupabase]);

  // Persist to user-specific LocalStorage for instant UI feedback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    } catch (e) {}
  }, [courses, STORAGE_KEY_COURSES]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETS, JSON.stringify(studySets));
    } catch (e) {}
  }, [studySets, STORAGE_KEY_SETS]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {}
  }, [stats, STORAGE_KEY_STATS]);

  // 1. Quản lý Học phần (Course CRUD) with user_id
  const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
    const newId = `course-${Date.now()}`;
    const now = new Date().toISOString();
    const newCourse: Course = {
      ...data,
      id: newId,
      createdAt: now
    };

    setCourses(prev => [newCourse, ...prev]);

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        const { error } = await supabase.from('courses').upsert({
          id: newId,
          user_id: userId,
          code: data.code,
          name: data.name,
          description: data.description || '',
          icon: data.icon || '',
          color: data.color || '#5B2DFF',
          semester: data.semester || ''
        });
        if (error) throw error;
      } catch (err: any) {
        console.error('Lỗi khi thêm course vào Supabase:', err);
        setSyncError(err.message || 'Không thể đồng bộ học phần mới lên Supabase.');
      }
    }

    return newCourse;
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        const payload: any = {};
        if (updates.code !== undefined) payload.code = updates.code;
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.icon !== undefined) payload.icon = updates.icon;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.semester !== undefined) payload.semester = updates.semester;

        const { error } = await supabase
          .from('courses')
          .update(payload)
          .eq('id', id)
          .eq('user_id', userId);
        if (error) throw error;
      } catch (err: any) {
        console.error('Lỗi khi cập nhật course trên Supabase:', err);
        setSyncError(err.message || 'Không thể cập nhật học phần trên Supabase.');
      }
    }
  };

  const deleteCourse = async (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setStudySets(prev => prev.filter(s => s.courseId !== id));
    if (activeCourseId === id) setActiveCourseId(null);

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) throw error;
      } catch (err: any) {
        console.error('Lỗi khi xóa course trên Supabase:', err);
        setSyncError(err.message || 'Không thể xóa học phần trên Supabase.');
      }
    }
  };

  // 2. Quản lý Bộ thẻ (Study Set CRUD) with user_id
  const addStudySet = async (
    data: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'questions'> & { questions?: Question[] }
  ): Promise<StudySet> => {
    const now = new Date().toISOString();
    const newId = `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSet: StudySet = {
      ...data,
      questions: data.questions || [],
      id: newId,
      createdAt: now,
      updatedAt: now
    };

    setStudySets(prev => [newSet, ...prev]);

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        const { error } = await supabase.from('study_sets').upsert({
          id: newId,
          user_id: userId,
          course_id: data.courseId,
          title: data.title,
          description: data.description || '',
          color: data.color || '#5B2DFF',
          icon: data.icon || '',
          questions: data.questions || []
        });
        if (error) throw error;
      } catch (err: any) {
        console.error('Lỗi khi thêm study set vào Supabase:', err);
        setSyncError(err.message || 'Không thể đồng bộ bộ thẻ mới lên Supabase.');
      }
    }

    return newSet;
  };

  const updateStudySet = async (id: string, updates: Partial<StudySet>) => {
    const now = new Date().toISOString();
    setStudySets(prev => prev.map(s => s.id === id ? {
      ...s,
      ...updates,
      updatedAt: now
    } : s));

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        const payload: any = { updated_at: now };
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.icon !== undefined) payload.icon = updates.icon;
        if (updates.courseId !== undefined) payload.course_id = updates.courseId;
        if (updates.questions !== undefined) payload.questions = updates.questions;

        const { error } = await supabase
          .from('study_sets')
          .update(payload)
          .eq('id', id)
          .eq('user_id', userId);
        if (error) throw error;
      } catch (err: any) {
        console.error('Lỗi khi cập nhật study set trên Supabase:', err);
        setSyncError(err.message || 'Không thể cập nhật bộ thẻ trên Supabase.');
      }
    }
  };

  const deleteStudySet = async (id: string) => {
    setStudySets(prev => prev.filter(s => s.id !== id));
    if (activeSetId === id) {
      setActiveSetId(null);
      setActiveMode(null);
    }

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('study_sets')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) throw error;
      } catch (err: any) {
        console.error('Lỗi khi xóa study set trên Supabase:', err);
        setSyncError(err.message || 'Không thể xóa bộ thẻ trên Supabase.');
      }
    }
  };

  // 3. Quản lý Câu hỏi trong Bộ thẻ
  const persistQuestionsToSet = async (setId: string, nextQuestions: Question[]) => {
    const now = new Date().toISOString();
    setStudySets(prev => prev.map(s => s.id === setId ? {
      ...s,
      questions: nextQuestions,
      updatedAt: now
    } : s));

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('study_sets')
          .update({
            questions: nextQuestions,
            updated_at: now
          })
          .eq('id', setId)
          .eq('user_id', userId);
        if (error) throw error;
      } catch (err: any) {
        console.error('Lỗi cập nhật câu hỏi trên Supabase:', err);
        setSyncError(err.message || 'Không thể đồng bộ câu hỏi lên Supabase.');
      }
    }
  };

  const addQuestionToSet = async (setId: string, questionData: Omit<Question, 'id'>) => {
    const targetSet = studySets.find(s => s.id === setId);
    if (!targetSet) return;
    const newQ: Question = {
      ...questionData,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    await persistQuestionsToSet(setId, [...targetSet.questions, newQ]);
  };

  const updateQuestionInSet = async (setId: string, questionId: string, updates: Partial<Question>) => {
    const targetSet = studySets.find(s => s.id === setId);
    if (!targetSet) return;
    const nextQuestions = targetSet.questions.map(q => q.id === questionId ? { ...q, ...updates } : q);
    await persistQuestionsToSet(setId, nextQuestions);
  };

  const deleteQuestionFromSet = async (setId: string, questionId: string) => {
    const targetSet = studySets.find(s => s.id === setId);
    if (!targetSet) return;
    const nextQuestions = targetSet.questions.filter(q => q.id !== questionId);
    await persistQuestionsToSet(setId, nextQuestions);
  };

  const addBulkQuestionsToSet = async (setId: string, newQuestions: Question[]) => {
    let nextQuestions: Question[] = [];
    const now = new Date().toISOString();

    setStudySets(prev => {
      const targetSet = prev.find(s => s.id === setId);
      if (!targetSet) return prev;
      nextQuestions = [...targetSet.questions, ...newQuestions];
      return prev.map(s => s.id === setId ? {
        ...s,
        questions: nextQuestions,
        updatedAt: now
      } : s);
    });

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        if (nextQuestions.length > 0) {
          const { error } = await supabase
            .from('study_sets')
            .update({
              questions: nextQuestions,
              updated_at: now
            })
            .eq('id', setId)
            .eq('user_id', userId);
          if (error) throw error;
        }
      } catch (err: any) {
        console.error('Lỗi khi bulk update câu hỏi trên Supabase:', err);
        setSyncError(err.message || 'Không thể đồng bộ câu hỏi lên Supabase.');
      }
    }
  };

  const toggleStarQuestion = async (setId: string, questionId: string) => {
    const targetSet = studySets.find(s => s.id === setId);
    if (!targetSet) return;
    const nextQuestions = targetSet.questions.map(q => q.id === questionId ? { ...q, starred: !q.starred } : q);
    await persistQuestionsToSet(setId, nextQuestions);
  };

  const toggleMasterQuestion = async (setId: string, questionId: string) => {
    const targetSet = studySets.find(s => s.id === setId);
    if (!targetSet) return;
    const nextQuestions = targetSet.questions.map(q => q.id === questionId ? { ...q, mastered: !q.mastered } : q);
    await persistQuestionsToSet(setId, nextQuestions);
  };

  // 4. Quản lý Thống kê (User Stats)
  const recordQuizResult = async (correctCount: number, totalCount: number) => {
    const newTotal = stats.totalCardsStudied + totalCount;
    const newQuizzes = stats.quizzesCompleted + 1;
    const thisAccuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
    const newAccuracy = Math.round((stats.accuracyRate * stats.quizzesCompleted + thisAccuracy) / newQuizzes);

    const nextStats: UserStats = {
      streakDays: stats.streakDays,
      totalCardsStudied: newTotal,
      quizzesCompleted: newQuizzes,
      accuracyRate: newAccuracy
    };

    setStats(nextStats);

    const supabase = getSupabase();
    if (supabase && userId) {
      try {
        await supabase.from('user_stats').upsert({
          user_id: userId,
          streak_days: nextStats.streakDays,
          total_cards_studied: nextStats.totalCardsStudied,
          quizzes_completed: nextStats.quizzesCompleted,
          accuracy_rate: nextStats.accuracyRate,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Lỗi khi lưu thống kê trên Supabase:', err);
      }
    }
  };

  const hasSampleData = useMemo(() => {
    const SAMPLE_COURSE_IDS = ['course-eng', 'course-phi', 'course-mat', 'course-eco'];
    return courses.some(c =>
      SAMPLE_COURSE_IDS.includes(c.id) ||
      c.name.includes('Tiếng Anh Học Thuật') ||
      c.name.includes('Triết học Mác - Lênin') ||
      c.name.includes('Đại số Tuyến tính') ||
      c.name.includes('Kinh tế học Vi mô') ||
      c.code === 'ENG201' ||
      c.code === 'PHI101'
    );
  }, [courses]);

  const clearSampleData = async () => {
    const SAMPLE_COURSE_IDS = ['course-eng', 'course-phi', 'course-mat', 'course-eco'];
    const SAMPLE_SET_IDS = ['set-eng-01'];

    const remainingCourses = courses.filter(c =>
      !SAMPLE_COURSE_IDS.includes(c.id) &&
      !c.name.includes('Tiếng Anh Học Thuật') &&
      !c.name.includes('Triết học Mác - Lênin') &&
      !c.name.includes('Đại số Tuyến tính') &&
      !c.name.includes('Kinh tế học Vi mô') &&
      c.code !== 'ENG201' &&
      c.code !== 'PHI101'
    );

    const removedCourseIds = courses
      .filter(c => !remainingCourses.some(rc => rc.id === c.id))
      .map(c => c.id);

    const remainingSets = studySets.filter(s =>
      !SAMPLE_SET_IDS.includes(s.id) &&
      !removedCourseIds.includes(s.courseId) &&
      !s.title.includes('Từ vựng Học thuật Trọng điểm')
    );

    setCourses(remainingCourses);
    setStudySets(remainingSets);

    if (activeSetId && !remainingSets.some(s => s.id === activeSetId)) {
      setActiveSetId(null);
      setActiveMode(null);
    }
    if (activeCourseId && !remainingCourses.some(c => c.id === activeCourseId)) {
      setActiveCourseId(null);
    }

    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(remainingCourses));
      localStorage.setItem(STORAGE_KEY_SETS, JSON.stringify(remainingSets));
    } catch (e) {}

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        for (const sId of SAMPLE_SET_IDS) {
          await supabase.from('study_sets').delete().eq('id', sId).eq('user_id', userId);
        }
        for (const cId of [...SAMPLE_COURSE_IDS, ...removedCourseIds]) {
          await supabase.from('courses').delete().eq('id', cId).eq('user_id', userId);
        }
      } catch (err) {
        console.warn('Lỗi khi xóa dữ liệu mẫu trên Supabase:', err);
      }
    }
  };

  const clearAllData = async () => {
    setCourses([]);
    setStudySets([]);
    setActiveCourseId(null);
    setActiveSetId(null);
    setActiveMode(null);
    const zeroStats: UserStats = {
      streakDays: 0,
      totalCardsStudied: 0,
      quizzesCompleted: 0,
      accuracyRate: 100
    };
    setStats(zeroStats);

    try {
      localStorage.removeItem(STORAGE_KEY_COURSES);
      localStorage.removeItem(STORAGE_KEY_SETS);
      localStorage.removeItem(STORAGE_KEY_STATS);
    } catch (e) {}

    const supabase = getSupabase();
    if (supabase && userId && userId !== 'guest-user') {
      try {
        await supabase.from('study_sets').delete().eq('user_id', userId);
        await supabase.from('courses').delete().eq('user_id', userId);
        await supabase.from('user_stats').delete().eq('user_id', userId);
      } catch (err) {
        console.warn('Lỗi khi xóa sạch dữ liệu trên Supabase:', err);
      }
    }
  };

  const loadDemoData = async () => {
    setCourses(DEMO_COURSES);
    setStudySets(DEMO_STUDY_SETS);
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(DEMO_COURSES));
      localStorage.setItem(STORAGE_KEY_SETS, JSON.stringify(DEMO_STUDY_SETS));
    } catch (e) {}
  };

  const resetToDefaultData = async () => {
    await clearAllData();
  };

  const exportAllDataAsJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      userId: userId || 'anonymous',
      courses,
      studySets
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuizStudy_Backup_${new Date().toISOString().slice(0, 10)}.json`;
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
        isSyncing,
        syncError,
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
        hasSampleData,
        clearSampleData,
        clearAllData,
        loadDemoData,
        resetToDefaultData,
        exportAllDataAsJson,
        refreshFromSupabase
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
