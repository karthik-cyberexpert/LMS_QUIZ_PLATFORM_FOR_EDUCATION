"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, Class, Quiz, QuizAttempt, AuditLog, Badge } from './types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'teacher' | 'student') => Promise<boolean>;
  logout: () => void;
  classes: Class[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  auditLogs: AuditLog[];
  addClass: (newClass: Omit<Class, 'id' | 'createdAt' | 'studentIds' | 'quizIds'>) => void;
  joinClass: (inviteCode: string) => Promise<boolean>;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quiz: Quiz) => void;
  deleteQuiz: (quizId: string) => void;
  addAttempt: (attempt: QuizAttempt) => void;
  updateUserXP: (xp: number) => void;
  addBadge: (badge: Badge) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getStudentAttempts: (studentId: string, quizId: string) => QuizAttempt[];
  getClassStudents: (classId: string) => Promise<User[]>;
  getTeacherClasses: () => Class[];
  getStudentClasses: () => Class[];
  fetchQuizAttempts: (quizId: string) => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Handle Session Persistence & Inactivity
  useEffect(() => {
    const savedUser = localStorage.getItem('quizmaster_session');
    const lastActivity = localStorage.getItem('quizmaster_last_activity');

    if (savedUser && lastActivity) {
      const timeInactivity = Date.now() - parseInt(lastActivity);
      if (timeInactivity < TIMEOUT_DURATION) {
        setUser(JSON.parse(savedUser));
        localStorage.setItem('quizmaster_last_activity', Date.now().toString());
      } else {
        localStorage.removeItem('quizmaster_session');
        localStorage.removeItem('quizmaster_last_activity');
      }
    }
    setLoading(false);
  }, []);

  // Sync session to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('quizmaster_session', JSON.stringify(user));
      localStorage.setItem('quizmaster_last_activity', Date.now().toString());
    } else {
      localStorage.removeItem('quizmaster_session');
      localStorage.removeItem('quizmaster_last_activity');
    }
  }, [user]);

  // Inactivity Monitor
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      localStorage.setItem('quizmaster_last_activity', Date.now().toString());
    };

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('quizmaster_last_activity');
      if (lastActivity) {
        const timeInactivity = Date.now() - parseInt(lastActivity);
        if (timeInactivity >= TIMEOUT_DURATION) {
          logout();
          toast.error('Session expired due to inactivity');
        }
      }
    };

    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    const interval = setInterval(checkInactivity, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(interval);
    };
  }, [user]);

  // Hydrate data on login
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch Classes
          const classUrl = user.role === 'teacher' 
            ? `/api/classes?teacherId=${user.id}` 
            : `/api/classes?studentId=${user.id}`;
          const classesRes = await fetch(classUrl);
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);

          // Fetch Quizzes
          const quizUrl = user.role === 'teacher'
            ? `/api/quizzes?teacherId=${user.id}`
            : `/api/quizzes?studentId=${user.id}`; 
          
          if (quizUrl) {
            const quizzesRes = await fetch(quizUrl);
            const quizzesData = await quizzesRes.json();
            setQuizzes(quizzesData.quizzes || []);
          }

          // Fetch Attempts
          if (user.role === 'student') {
            const attemptsRes = await fetch(`/api/attempts?studentId=${user.id}`);
            const attemptsData = await attemptsRes.json();
            setAttempts(attemptsData.attempts || []);
          }
        } catch (error) {
          console.error('Data hydration error:', error);
        }
      };
      fetchData();
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: 'teacher' | 'student'): Promise<boolean> => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        setUser(data.user);
        return true;
      } catch (error) {
        console.error('Registration error:', error);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setClasses([]);
    setQuizzes([]);
    setAttempts([]);
    localStorage.removeItem('quizmaster_session');
    localStorage.removeItem('quizmaster_last_activity');
  }, []);

  const addClass = useCallback(
    async (newClass: Omit<Class, 'id' | 'createdAt' | 'studentIds' | 'quizIds'>) => {
      try {
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newClass, teacherId: user?.id }),
        });
        if (response.ok) {
          const data = await response.json();
          setClasses((prev) => [...prev, data.class]);
          toast.success('Class created successfully');
        }
      } catch (error) {
        console.error('Add class error:', error);
      }
    },
    [user]
  );

  const joinClass = useCallback(
    async (inviteCode: string): Promise<boolean> => {
      if (!user || user.role !== 'student') return false;
      try {
        const response = await fetch('/api/classes/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode, studentId: user.id }),
        });
        if (response.ok) {
          // Re-fetch student classes and quizzes
          const [classesRes, quizzesRes] = await Promise.all([
            fetch(`/api/classes?studentId=${user.id}`),
            fetch(`/api/quizzes?studentId=${user.id}`)
          ]);
          const [classesData, quizzesData] = await Promise.all([
            classesRes.json(),
            quizzesRes.json()
          ]);
          setClasses(classesData.classes);
          setQuizzes(quizzesData.quizzes || []);
          toast.success('Joined class successfully');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Join class error:', error);
        return false;
      }
    },
    [user]
  );

  const addQuiz = useCallback(async (quiz: Quiz) => {
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      });
      if (response.ok) {
        setQuizzes((prev) => [...prev, quiz]);
        toast.success('Quiz created successfully');
      }
    } catch (error) {
      console.error('Add quiz error:', error);
    }
  }, []);

  const updateQuiz = useCallback(async (quiz: Quiz) => {
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      });
      if (response.ok) {
        setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? quiz : q)));
        toast.success('Quiz updated successfully');
      }
    } catch (error) {
      console.error('Update quiz error:', error);
    }
  }, []);

  const deleteQuiz = useCallback(async (quizId: string) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
        toast.success('Quiz deleted successfully');
      }
    } catch (error) {
      console.error('Delete quiz error:', error);
    }
  }, []);

  const addAttempt = useCallback(async (attempt: QuizAttempt) => {
    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
      if (response.ok) {
        setAttempts((prev) => [...prev, attempt]);
        // Update local user XP as well
        setUser(prev => prev ? { ...prev, totalXP: prev.totalXP + attempt.xpEarned } : null);
      }
    } catch (error) {
      console.error('Add attempt error:', error);
    }
  }, []);

  const updateUserXP = useCallback((xp: number) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, totalXP: prev.totalXP + xp } : null));
  }, [user]);

  const addBadge = useCallback((badge: Badge) => {
    if (!user) return;
    setUser((prev) =>
      prev ? { ...prev, badges: [...prev.badges, { ...badge, earnedAt: new Date() }] } : null
    );
  }, [user]);

  const addAuditLog = useCallback(async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...log, userId: user?.id }),
      });
      if (response.ok) {
        // Optionally fetch and update log state if needed
      }
    } catch (error) {
      console.error('Add audit log error:', error);
    }
  }, [user]);

  const getStudentAttempts = useCallback(
    (studentId: string, quizId: string): QuizAttempt[] => {
      return attempts.filter((a) => a.studentId === studentId && a.quizId === quizId);
    },
    [attempts]
  );

  const getClassStudents = useCallback(
    async (classId: string): Promise<User[]> => {
      try {
        const response = await fetch(`/api/classes/${classId}/students`);
        if (response.ok) {
          const data = await response.json();
          return data.students;
        }
        return [];
      } catch (error) {
        console.error('Get class students error:', error);
        return [];
      }
    },
    []
  );

  const getTeacherClasses = useCallback((): Class[] => {
    return classes.filter((c) => c.teacherId === user?.id);
  }, [user, classes]);

  const getStudentClasses = useCallback((): Class[] => {
    // Note: for students, the classes state already contains only their enrolled classes 
    // because we filter by studentId in the hydration useEffect.
    return classes;
  }, [classes]);

  const fetchQuizAttempts = useCallback(async (quizId: string) => {
    try {
      const res = await fetch(`/api/attempts?quizId=${quizId}`);
      if (res.ok) {
        const data = await res.json();
        return data.attempts || [];
      }
      return [];
    } catch (error) {
      console.error('Fetch quiz attempts error:', error);
      return [];
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        classes,
        quizzes,
        attempts,
        auditLogs,
        addClass,
        joinClass,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        addAttempt,
        updateUserXP,
        addBadge,
        addAuditLog,
        getStudentAttempts,
        getClassStudents,
        getTeacherClasses,
        getStudentClasses,
        fetchQuizAttempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
