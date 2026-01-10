export type UserRole = 'teacher' | 'student';

export type Difficulty = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  very_easy: 0.6,
  easy: 0.8,
  medium: 1.0,
  hard: 1.25,
  very_hard: 1.5,
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  totalXP: number;
  badges: Badge[];
}

export interface Class {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  teacherId: string;
  studentIds: string[];
  quizIds: string[];
  createdAt: Date;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  marks: number;
  timeLimit?: number;
  explanation?: string;
  topic?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  classId: string;
  teacherId: string;
  questions: QuizQuestion[];
  difficulty: Difficulty;
  totalMarks: number;
  timeLimit: number;
  maxAttempts: number;
  deadline?: Date;
  isPublished: boolean;
  createdAt: Date;
  subject: string;
  topic: string;
  creationMethod: 'manual' | 'ai_topic' | 'ai_pdf';
  isPractice?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string>;
  startedAt: Date;
  submittedAt?: Date;
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
  xpEarned: number;
  attemptNumber: number;
  warnings: Warning[];
  isAutoSubmitted: boolean;
  isFlagged: boolean;
  flagReason?: string;
  questionOrder: string[];
  optionOrders: Record<string, string[]>;
}

export interface Warning {
  id: string;
  type: 'tab_switch' | 'window_resize' | 'copy_attempt' | 'context_menu' | 'screenshot_attempt';
  timestamp: Date;
  message: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'prestige';
  earnedAt?: Date;
  aiGenerated?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  totalXP: number;
  accuracy: number;
  averageTime: number;
  earliestCompletion: Date;
  quizzesCompleted: number;
}

export interface XPBreakdown {
  baseXP: number;
  accuracyXP: number;
  speedXP: number;
  difficultyMultiplier: number;
  retryPenalty: number;
  finalXP: number;
  accuracyPercent: number;
  speedPercent: number;
}

export interface AIQuizConfig {
  subject: string;
  topic: string;
  description: string;
  difficulty: Difficulty;
  numberOfQuestions: number;
  optionsPerQuestion: number;
  marksPerQuestion: number;
  timeLimit: number;
}

export interface PDFQuizConfig {
  fileName: string;
  fileContent: string;
  difficulty: Difficulty;
  numberOfQuestions: number;
  optionsPerQuestion: number;
  marksPerQuestion: number;
  timeLimit: number;
}

export interface PracticeSession {
  id: string;
  studentId: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questionsAnswered: number;
  correctAnswers: number;
  totalXP: number;
  startedAt: Date;
  questionHistory: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  quizId?: string;
  attemptId?: string;
}

export interface TeacherAnalytics {
  classId: string;
  quizId: string;
  questionStats: {
    questionId: string;
    failureRate: number;
    averageTime: number;
  }[];
  difficultyVsPerformance: {
    difficulty: Difficulty;
    averageScore: number;
    averageTime: number;
  }[];
  studentPerformance: {
    studentId: string;
    averageScore: number;
    quizzesCompleted: number;
    totalXP: number;
  }[];
}

export interface StudentInsights {
  studentId: string;
  weakTopics: string[];
  strongTopics: string[];
  accuracyTrend: { date: Date; accuracy: number }[];
  suggestedPracticeTopics: string[];
  totalQuizzesTaken: number;
  averageAccuracy: number;
  averageTime: number;
}

export interface AntiCheatState {
  warnings: Warning[];
  tabSwitchCount: number;
  resizeCount: number;
  isLocked: boolean;
  sessionId: string;
  watermark: string;
}

export interface ToastMessage {
  type: 'success' | 'warning' | 'error' | 'info' | 'achievement';
  title: string;
  description?: string;
  duration?: number;
}

export const PRAISE_CATEGORIES = {
  perfect: ['Flawless!', 'Perfect Score!', 'Outstanding!', 'Masterful!'],
  excellent: ['Excellent Work!', 'Brilliant!', 'Superb!', 'Amazing!'],
  good: ['Well Done!', 'Great Job!', 'Nice Work!', 'Keep It Up!'],
  improvement: ['Good Effort!', 'Making Progress!', 'Keep Learning!', 'You Can Do It!'],
};

export const CORE_BADGES: Badge[] = [
  { id: 'first_quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', rarity: 'common' },
  { id: 'perfect_score', name: 'Perfectionist', description: 'Score 100% on any quiz', icon: '⭐', rarity: 'rare' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 50% of time limit', icon: '⚡', rarity: 'rare' },
  { id: 'streak_3', name: 'On Fire', description: 'Get 3 correct answers in a row', icon: '🔥', rarity: 'common' },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get 10 correct answers in a row', icon: '💪', rarity: 'epic' },
  { id: 'xp_1000', name: 'Rising Star', description: 'Earn 1000 total XP', icon: '🌟', rarity: 'common' },
  { id: 'xp_5000', name: 'Knowledge Seeker', description: 'Earn 5000 total XP', icon: '📚', rarity: 'rare' },
  { id: 'xp_10000', name: 'Scholar', description: 'Earn 10000 total XP', icon: '🎓', rarity: 'epic' },
  { id: 'practice_master', name: 'Practice Master', description: 'Complete 50 practice questions', icon: '🏋️', rarity: 'rare' },
  { id: 'class_champion', name: 'Class Champion', description: 'Rank #1 on a class leaderboard', icon: '🏆', rarity: 'legendary' },
];

export const PRESTIGE_BADGES: Badge[] = [
  { id: 'ai_conqueror', name: 'AI Conqueror', description: 'Master AI-generated quizzes', icon: '🤖', rarity: 'prestige', aiGenerated: true },
  { id: 'knowledge_titan', name: 'Knowledge Titan', description: 'Exceptional mastery across all topics', icon: '🏛️', rarity: 'prestige', aiGenerated: true },
];
