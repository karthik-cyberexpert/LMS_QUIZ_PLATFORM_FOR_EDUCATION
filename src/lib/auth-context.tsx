"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Class, Quiz, QuizAttempt, AuditLog, Badge } from './types';
import {
  MOCK_TEACHERS,
  MOCK_STUDENTS,
  MOCK_CLASSES,
  MOCK_QUIZZES,
  MOCK_ATTEMPTS,
  MOCK_AUDIT_LOGS,
} from './mock-data';

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
  joinClass: (inviteCode: string) => boolean;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quiz: Quiz) => void;
  deleteQuiz: (quizId: string) => void;
  addAttempt: (attempt: QuizAttempt) => void;
  updateUserXP: (xp: number) => void;
  addBadge: (badge: Badge) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getStudentAttempts: (studentId: string, quizId: string) => QuizAttempt[];
  getClassStudents: (classId: string) => User[];
  getTeacherClasses: () => Class[];
  getStudentClasses: () => Class[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(MOCK_ATTEMPTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    
    const teacher = MOCK_TEACHERS.find((t) => t.email === email);
    if (teacher) {
      setUser(teacher);
      return true;
    }

    const student = MOCK_STUDENTS.find((s) => s.email === email);
    if (student) {
      setUser(student);
      return true;
    }

    return false;
  }, []);

  const register = useCallback(
    async (name: string, email: string, _password: string, role: 'teacher' | 'student'): Promise<boolean> => {

      const newUser: User = {
        id: `${role}-${Date.now()}`,
        email,
        name,
        role,
        createdAt: new Date(),
        totalXP: 0,
        badges: [],
      };

      setUser(newUser);
      return true;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addClass = useCallback(
    (newClass: Omit<Class, 'id' | 'createdAt' | 'studentIds' | 'quizIds'>) => {
      const classToAdd: Class = {
        ...newClass,
        id: `class-${Date.now()}`,
        createdAt: new Date(),
        studentIds: [],
        quizIds: [],
      };
      setClasses((prev) => [...prev, classToAdd]);
    },
    []
  );

  const joinClass = useCallback(
    (inviteCode: string): boolean => {
      if (!user || user.role !== 'student') return false;

      const classToJoin = classes.find((c) => c.inviteCode === inviteCode);
      if (!classToJoin) return false;

      if (classToJoin.studentIds.includes(user.id)) return false;

      setClasses((prev) =>
        prev.map((c) =>
          c.id === classToJoin.id ? { ...c, studentIds: [...c.studentIds, user.id] } : c
        )
      );
      return true;
    },
    [user, classes]
  );

  const addQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => [...prev, quiz]);
    setClasses((prev) =>
      prev.map((c) =>
        c.id === quiz.classId ? { ...c, quizIds: [...c.quizIds, quiz.id] } : c
      )
    );
  }, []);

  const updateQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? quiz : q)));
  }, []);

  const deleteQuiz = useCallback((quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        quizIds: c.quizIds.filter((id) => id !== quizId),
      }))
    );
  }, []);

  const addAttempt = useCallback((attempt: QuizAttempt) => {
    setAttempts((prev) => [...prev, attempt]);
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

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date(),
    };
    setAuditLogs((prev) => [...prev, newLog]);
  }, []);

  const getStudentAttempts = useCallback(
    (studentId: string, quizId: string): QuizAttempt[] => {
      return attempts.filter((a) => a.studentId === studentId && a.quizId === quizId);
    },
    [attempts]
  );

  const getClassStudents = useCallback(
    (classId: string): User[] => {
      const classData = classes.find((c) => c.id === classId);
      if (!classData) return [];
      return MOCK_STUDENTS.filter((s) => classData.studentIds.includes(s.id));
    },
    [classes]
  );

  const getTeacherClasses = useCallback((): Class[] => {
    if (!user || user.role !== 'teacher') return [];
    return classes.filter((c) => c.teacherId === user.id);
  }, [user, classes]);

  const getStudentClasses = useCallback((): Class[] => {
    if (!user || user.role !== 'student') return [];
    return classes.filter((c) => c.studentIds.includes(user.id));
  }, [user, classes]);

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
