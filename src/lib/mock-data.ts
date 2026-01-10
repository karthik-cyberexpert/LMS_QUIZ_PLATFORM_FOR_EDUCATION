import {
  User,
  Class,
  Quiz,
  QuizAttempt,
  QuizQuestion,
  Badge,
  AuditLog,
  CORE_BADGES,
  Difficulty,
  DIFFICULTY_MULTIPLIERS,
  XPBreakdown,
  LeaderboardEntry,
  TeacherAnalytics,
  StudentInsights,
  AIQuizConfig,
  PDFQuizConfig,
} from './types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const MOCK_TEACHERS: User[] = [
  {
    id: 'teacher-1',
    email: 'professor.smith@school.edu',
    name: 'Prof. Sarah Smith',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date('2024-01-15'),
    totalXP: 0,
    badges: [],
  },
  {
    id: 'teacher-2',
    email: 'dr.johnson@school.edu',
    name: 'Dr. Michael Johnson',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: new Date('2024-02-01'),
    totalXP: 0,
    badges: [],
  },
];

export const MOCK_STUDENTS: User[] = [
  {
    id: 'student-1',
    email: 'alice@student.edu',
    name: 'Alice Chen',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    createdAt: new Date('2024-03-01'),
    totalXP: 2450,
    badges: [CORE_BADGES[0], CORE_BADGES[5]],
  },
  {
    id: 'student-2',
    email: 'bob@student.edu',
    name: 'Bob Williams',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date('2024-03-05'),
    totalXP: 3200,
    badges: [CORE_BADGES[0], CORE_BADGES[1], CORE_BADGES[5]],
  },
  {
    id: 'student-3',
    email: 'carol@student.edu',
    name: 'Carol Davis',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date('2024-03-10'),
    totalXP: 1800,
    badges: [CORE_BADGES[0]],
  },
  {
    id: 'student-4',
    email: 'david@student.edu',
    name: 'David Kim',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: new Date('2024-03-12'),
    totalXP: 4100,
    badges: [CORE_BADGES[0], CORE_BADGES[1], CORE_BADGES[2], CORE_BADGES[5], CORE_BADGES[6]],
  },
  {
    id: 'student-5',
    email: 'emma@student.edu',
    name: 'Emma Wilson',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    createdAt: new Date('2024-03-15'),
    totalXP: 2900,
    badges: [CORE_BADGES[0], CORE_BADGES[3], CORE_BADGES[5]],
  },
];

export const MOCK_CLASSES: Class[] = [
  {
    id: 'class-1',
    name: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of programming and computational thinking',
    inviteCode: 'CS101X',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
    quizIds: ['quiz-1', 'quiz-2'],
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'class-2',
    name: 'Advanced Mathematics',
    description: 'Calculus, linear algebra, and differential equations',
    inviteCode: 'MATH201',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2', 'student-4'],
    quizIds: ['quiz-3'],
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'class-3',
    name: 'World History',
    description: 'Explore major historical events and civilizations',
    inviteCode: 'HIST100',
    teacherId: 'teacher-2',
    studentIds: ['student-3', 'student-5'],
    quizIds: ['quiz-4'],
    createdAt: new Date('2024-04-01'),
  },
];

const createQuizQuestion = (
  text: string,
  options: { text: string; isCorrect: boolean }[],
  marks: number = 10,
  topic?: string
): QuizQuestion => ({
  id: generateId(),
  text,
  options: options.map((opt) => ({ id: generateId(), ...opt })),
  marks,
  topic,
});

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Programming Basics',
    description: 'Test your knowledge of basic programming concepts',
    classId: 'class-1',
    teacherId: 'teacher-1',
    subject: 'Computer Science',
    topic: 'Programming Fundamentals',
    difficulty: 'easy',
    totalMarks: 50,
    timeLimit: 600,
    maxAttempts: 3,
    isPublished: true,
    createdAt: new Date('2024-03-10'),
    creationMethod: 'manual',
    questions: [
      createQuizQuestion(
        'What is a variable in programming?',
        [
          { text: 'A container for storing data values', isCorrect: true },
          { text: 'A type of loop', isCorrect: false },
          { text: 'A function that returns nothing', isCorrect: false },
          { text: 'A programming language', isCorrect: false },
        ],
        10,
        'Variables'
      ),
      createQuizQuestion(
        'Which of the following is a valid way to declare a variable in JavaScript?',
        [
          { text: 'let x = 5;', isCorrect: true },
          { text: 'variable x = 5;', isCorrect: false },
          { text: 'int x = 5;', isCorrect: false },
          { text: 'declare x = 5;', isCorrect: false },
        ],
        10,
        'Variables'
      ),
      createQuizQuestion(
        'What does the "if" statement do?',
        [
          { text: 'Executes code based on a condition', isCorrect: true },
          { text: 'Creates a loop', isCorrect: false },
          { text: 'Defines a function', isCorrect: false },
          { text: 'Imports a module', isCorrect: false },
        ],
        10,
        'Control Flow'
      ),
      createQuizQuestion(
        'What is a function?',
        [
          { text: 'A reusable block of code that performs a specific task', isCorrect: true },
          { text: 'A variable that stores numbers', isCorrect: false },
          { text: 'A type of data structure', isCorrect: false },
          { text: 'A loop construct', isCorrect: false },
        ],
        10,
        'Functions'
      ),
      createQuizQuestion(
        'Which symbol is used for single-line comments in JavaScript?',
        [
          { text: '//', isCorrect: true },
          { text: '/*', isCorrect: false },
          { text: '#', isCorrect: false },
          { text: '--', isCorrect: false },
        ],
        10,
        'Syntax'
      ),
    ],
  },
  {
    id: 'quiz-2',
    title: 'Data Structures',
    description: 'Explore arrays, objects, and other data structures',
    classId: 'class-1',
    teacherId: 'teacher-1',
    subject: 'Computer Science',
    topic: 'Data Structures',
    difficulty: 'medium',
    totalMarks: 60,
    timeLimit: 900,
    maxAttempts: 3,
    deadline: new Date('2024-12-31'),
    isPublished: true,
    createdAt: new Date('2024-03-20'),
    creationMethod: 'ai_topic',
    questions: [
      createQuizQuestion(
        'What is the time complexity of accessing an element in an array by index?',
        [
          { text: 'O(1)', isCorrect: true },
          { text: 'O(n)', isCorrect: false },
          { text: 'O(log n)', isCorrect: false },
          { text: 'O(n²)', isCorrect: false },
        ],
        10,
        'Arrays'
      ),
      createQuizQuestion(
        'Which data structure uses LIFO (Last In, First Out) principle?',
        [
          { text: 'Stack', isCorrect: true },
          { text: 'Queue', isCorrect: false },
          { text: 'Array', isCorrect: false },
          { text: 'Linked List', isCorrect: false },
        ],
        10,
        'Stacks'
      ),
      createQuizQuestion(
        'What is a hash table primarily used for?',
        [
          { text: 'Fast key-value lookups', isCorrect: true },
          { text: 'Sorting data', isCorrect: false },
          { text: 'Graph traversal', isCorrect: false },
          { text: 'Tree balancing', isCorrect: false },
        ],
        10,
        'Hash Tables'
      ),
      createQuizQuestion(
        'In a linked list, what does each node contain?',
        [
          { text: 'Data and a reference to the next node', isCorrect: true },
          { text: 'Only data', isCorrect: false },
          { text: 'Index and value', isCorrect: false },
          { text: 'Key and hash', isCorrect: false },
        ],
        15,
        'Linked Lists'
      ),
      createQuizQuestion(
        'Which traversal visits the root node first in a binary tree?',
        [
          { text: 'Pre-order', isCorrect: true },
          { text: 'In-order', isCorrect: false },
          { text: 'Post-order', isCorrect: false },
          { text: 'Level-order', isCorrect: false },
        ],
        15,
        'Trees'
      ),
    ],
  },
  {
    id: 'quiz-3',
    title: 'Calculus Fundamentals',
    description: 'Test your understanding of derivatives and integrals',
    classId: 'class-2',
    teacherId: 'teacher-1',
    subject: 'Mathematics',
    topic: 'Calculus',
    difficulty: 'hard',
    totalMarks: 50,
    timeLimit: 1200,
    maxAttempts: 3,
    isPublished: true,
    createdAt: new Date('2024-04-01'),
    creationMethod: 'manual',
    questions: [
      createQuizQuestion(
        'What is the derivative of x²?',
        [
          { text: '2x', isCorrect: true },
          { text: 'x', isCorrect: false },
          { text: '2', isCorrect: false },
          { text: 'x²', isCorrect: false },
        ],
        10,
        'Derivatives'
      ),
      createQuizQuestion(
        'What is the integral of cos(x)?',
        [
          { text: 'sin(x) + C', isCorrect: true },
          { text: '-sin(x) + C', isCorrect: false },
          { text: 'cos(x) + C', isCorrect: false },
          { text: '-cos(x) + C', isCorrect: false },
        ],
        10,
        'Integrals'
      ),
      createQuizQuestion(
        "What is the derivative of e^x?",
        [
          { text: 'e^x', isCorrect: true },
          { text: 'xe^(x-1)', isCorrect: false },
          { text: 'ln(x)', isCorrect: false },
          { text: '1/x', isCorrect: false },
        ],
        10,
        'Derivatives'
      ),
      createQuizQuestion(
        'What is the limit of sin(x)/x as x approaches 0?',
        [
          { text: '1', isCorrect: true },
          { text: '0', isCorrect: false },
          { text: 'Undefined', isCorrect: false },
          { text: 'Infinity', isCorrect: false },
        ],
        10,
        'Limits'
      ),
      createQuizQuestion(
        'What rule is used to find the derivative of f(g(x))?',
        [
          { text: 'Chain rule', isCorrect: true },
          { text: 'Product rule', isCorrect: false },
          { text: 'Quotient rule', isCorrect: false },
          { text: 'Power rule', isCorrect: false },
        ],
        10,
        'Derivatives'
      ),
    ],
  },
  {
    id: 'quiz-4',
    title: 'Ancient Civilizations',
    description: 'Explore the great civilizations of the ancient world',
    classId: 'class-3',
    teacherId: 'teacher-2',
    subject: 'History',
    topic: 'Ancient History',
    difficulty: 'medium',
    totalMarks: 40,
    timeLimit: 600,
    maxAttempts: 3,
    isPublished: true,
    createdAt: new Date('2024-04-10'),
    creationMethod: 'ai_pdf',
    questions: [
      createQuizQuestion(
        'Which river was essential to ancient Egyptian civilization?',
        [
          { text: 'Nile', isCorrect: true },
          { text: 'Tigris', isCorrect: false },
          { text: 'Euphrates', isCorrect: false },
          { text: 'Indus', isCorrect: false },
        ],
        10,
        'Egypt'
      ),
      createQuizQuestion(
        'Who was the first emperor of Rome?',
        [
          { text: 'Augustus', isCorrect: true },
          { text: 'Julius Caesar', isCorrect: false },
          { text: 'Nero', isCorrect: false },
          { text: 'Trajan', isCorrect: false },
        ],
        10,
        'Rome'
      ),
      createQuizQuestion(
        'The ancient city of Babylon was located in modern-day:',
        [
          { text: 'Iraq', isCorrect: true },
          { text: 'Iran', isCorrect: false },
          { text: 'Egypt', isCorrect: false },
          { text: 'Turkey', isCorrect: false },
        ],
        10,
        'Mesopotamia'
      ),
      createQuizQuestion(
        'What writing system did the ancient Sumerians develop?',
        [
          { text: 'Cuneiform', isCorrect: true },
          { text: 'Hieroglyphics', isCorrect: false },
          { text: 'Linear A', isCorrect: false },
          { text: 'Sanskrit', isCorrect: false },
        ],
        10,
        'Mesopotamia'
      ),
    ],
  },
];

export const MOCK_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'attempt-1',
    quizId: 'quiz-1',
    studentId: 'student-1',
    answers: {},
    startedAt: new Date('2024-03-15T10:00:00'),
    submittedAt: new Date('2024-03-15T10:08:30'),
    score: 40,
    maxScore: 50,
    accuracy: 80,
    timeTaken: 510,
    xpEarned: 320,
    attemptNumber: 1,
    warnings: [],
    isAutoSubmitted: false,
    isFlagged: false,
    questionOrder: [],
    optionOrders: {},
  },
  {
    id: 'attempt-2',
    quizId: 'quiz-1',
    studentId: 'student-2',
    answers: {},
    startedAt: new Date('2024-03-16T14:00:00'),
    submittedAt: new Date('2024-03-16T14:05:45'),
    score: 50,
    maxScore: 50,
    accuracy: 100,
    timeTaken: 345,
    xpEarned: 500,
    attemptNumber: 1,
    warnings: [],
    isAutoSubmitted: false,
    isFlagged: false,
    questionOrder: [],
    optionOrders: {},
  },
  {
    id: 'attempt-3',
    quizId: 'quiz-2',
    studentId: 'student-4',
    answers: {},
    startedAt: new Date('2024-03-25T09:00:00'),
    submittedAt: new Date('2024-03-25T09:12:00'),
    score: 55,
    maxScore: 60,
    accuracy: 92,
    timeTaken: 720,
    xpEarned: 460,
    attemptNumber: 1,
    warnings: [],
    isAutoSubmitted: false,
    isFlagged: false,
    questionOrder: [],
    optionOrders: {},
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'student-1',
    action: 'QUIZ_STARTED',
    details: 'Started quiz: Programming Basics',
    timestamp: new Date('2024-03-15T10:00:00'),
    quizId: 'quiz-1',
    attemptId: 'attempt-1',
  },
  {
    id: 'log-2',
    userId: 'student-1',
    action: 'QUIZ_SUBMITTED',
    details: 'Submitted quiz: Programming Basics with score 40/50',
    timestamp: new Date('2024-03-15T10:08:30'),
    quizId: 'quiz-1',
    attemptId: 'attempt-1',
  },
];

export function calculateXP(
  score: number,
  maxScore: number,
  timeTaken: number,
  timeLimit: number,
  difficulty: Difficulty,
  attemptNumber: number
): XPBreakdown {
  const baseXP = 100;
  const accuracyPercent = (score / maxScore) * 100;
  const speedPercent = Math.max(0, ((timeLimit - timeTaken) / timeLimit) * 100);

  const accuracyXP = (accuracyPercent / 100) * baseXP * 0.7;
  const speedXP = (speedPercent / 100) * baseXP * 0.3;

  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const retryPenalty = attemptNumber > 1 ? Math.pow(0.75, attemptNumber - 1) : 1;

  const finalXP = Math.round((accuracyXP + speedXP) * difficultyMultiplier * retryPenalty);

  return {
    baseXP,
    accuracyXP: Math.round(accuracyXP),
    speedXP: Math.round(speedXP),
    difficultyMultiplier,
    retryPenalty,
    finalXP,
    accuracyPercent,
    speedPercent,
  };
}

export function calculateLeaderboard(
  classId: string,
  students: User[],
  attempts: QuizAttempt[],
  quizzes: Quiz[]
): LeaderboardEntry[] {
  const classQuizIds = quizzes
    .filter((q) => q.classId === classId && !q.isPractice && q.isPublished)
    .map((q) => q.id);

  const studentStats: Record<
    string,
    {
      totalXP: number;
      totalAccuracy: number;
      totalTime: number;
      quizCount: number;
      earliestCompletion: Date;
    }
  > = {};

  attempts
    .filter((a) => classQuizIds.includes(a.quizId) && a.submittedAt)
    .forEach((attempt) => {
      const student = students.find((s) => s.id === attempt.studentId);
      if (!student) return;

      if (!studentStats[attempt.studentId]) {
        studentStats[attempt.studentId] = {
          totalXP: 0,
          totalAccuracy: 0,
          totalTime: 0,
          quizCount: 0,
          earliestCompletion: attempt.submittedAt!,
        };
      }

      const stats = studentStats[attempt.studentId];
      stats.totalXP += attempt.xpEarned;
      stats.totalAccuracy += attempt.accuracy;
      stats.totalTime += attempt.timeTaken;
      stats.quizCount += 1;
      if (attempt.submittedAt! < stats.earliestCompletion) {
        stats.earliestCompletion = attempt.submittedAt!;
      }
    });

  const entries: LeaderboardEntry[] = Object.entries(studentStats).map(([studentId, stats]) => {
    const student = students.find((s) => s.id === studentId)!;
    return {
      rank: 0,
      studentId,
      studentName: student.name,
      avatarUrl: student.avatarUrl,
      totalXP: stats.totalXP,
      accuracy: stats.quizCount > 0 ? stats.totalAccuracy / stats.quizCount : 0,
      averageTime: stats.quizCount > 0 ? stats.totalTime / stats.quizCount : 0,
      earliestCompletion: stats.earliestCompletion,
      quizzesCompleted: stats.quizCount,
    };
  });

  entries.sort((a, b) => {
    if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if (a.averageTime !== b.averageTime) return a.averageTime - b.averageTime;
    return a.earliestCompletion.getTime() - b.earliestCompletion.getTime();
  });

  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateWatermark(userId: string, quizId: string): string {
  const timestamp = new Date().toISOString();
  return `${userId.slice(-4)}-${quizId.slice(-4)}-${timestamp.slice(11, 19).replace(/:/g, '')}`;
}

export function detectAnomalousAttempt(
  attempt: QuizAttempt,
  previousAttempts: QuizAttempt[],
  quiz: Quiz
): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (attempt.accuracy === 100 && attempt.timeTaken < quiz.timeLimit * 0.2) {
    reasons.push('Perfect score with unusually fast completion time');
  }

  if (previousAttempts.length > 0) {
    const avgPrevAccuracy = previousAttempts.reduce((sum, a) => sum + a.accuracy, 0) / previousAttempts.length;
    if (attempt.accuracy - avgPrevAccuracy > 50) {
      reasons.push('Significant accuracy improvement from previous attempts');
    }

    const avgPrevTime = previousAttempts.reduce((sum, a) => sum + a.timeTaken, 0) / previousAttempts.length;
    if (avgPrevTime / attempt.timeTaken > 3) {
      reasons.push('Completion time significantly faster than previous attempts');
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

const AI_QUESTION_BANK: Record<string, QuizQuestion[]> = {
  'Computer Science': [
    createQuizQuestion(
      'What is the purpose of an operating system?',
      [
        { text: 'To manage hardware and software resources', isCorrect: true },
        { text: 'To browse the internet', isCorrect: false },
        { text: 'To write documents', isCorrect: false },
        { text: 'To play games', isCorrect: false },
      ],
      10,
      'Operating Systems'
    ),
    createQuizQuestion(
      'What does CPU stand for?',
      [
        { text: 'Central Processing Unit', isCorrect: true },
        { text: 'Computer Personal Unit', isCorrect: false },
        { text: 'Central Program Utility', isCorrect: false },
        { text: 'Core Processing Unit', isCorrect: false },
      ],
      10,
      'Hardware'
    ),
    createQuizQuestion(
      'What is recursion in programming?',
      [
        { text: 'A function that calls itself', isCorrect: true },
        { text: 'A loop that runs forever', isCorrect: false },
        { text: 'A type of variable', isCorrect: false },
        { text: 'A sorting algorithm', isCorrect: false },
      ],
      10,
      'Programming Concepts'
    ),
    createQuizQuestion(
      'Which data structure is best for implementing a priority queue?',
      [
        { text: 'Heap', isCorrect: true },
        { text: 'Array', isCorrect: false },
        { text: 'Linked List', isCorrect: false },
        { text: 'Stack', isCorrect: false },
      ],
      10,
      'Data Structures'
    ),
    createQuizQuestion(
      'What is Big O notation used for?',
      [
        { text: 'Describing algorithm efficiency', isCorrect: true },
        { text: 'Writing comments', isCorrect: false },
        { text: 'Defining variables', isCorrect: false },
        { text: 'Creating loops', isCorrect: false },
      ],
      10,
      'Algorithm Analysis'
    ),
  ],
  Mathematics: [
    createQuizQuestion(
      'What is the quadratic formula used for?',
      [
        { text: 'Finding roots of quadratic equations', isCorrect: true },
        { text: 'Calculating area', isCorrect: false },
        { text: 'Finding prime numbers', isCorrect: false },
        { text: 'Solving linear equations', isCorrect: false },
      ],
      10,
      'Algebra'
    ),
    createQuizQuestion(
      'What is the value of pi (π) approximately?',
      [
        { text: '3.14159', isCorrect: true },
        { text: '2.71828', isCorrect: false },
        { text: '1.41421', isCorrect: false },
        { text: '1.61803', isCorrect: false },
      ],
      10,
      'Constants'
    ),
    createQuizQuestion(
      'What is the Pythagorean theorem?',
      [
        { text: 'a² + b² = c²', isCorrect: true },
        { text: 'a + b = c', isCorrect: false },
        { text: 'a × b = c', isCorrect: false },
        { text: 'a² - b² = c²', isCorrect: false },
      ],
      10,
      'Geometry'
    ),
  ],
  History: [
    createQuizQuestion(
      'In which year did World War II end?',
      [
        { text: '1945', isCorrect: true },
        { text: '1944', isCorrect: false },
        { text: '1946', isCorrect: false },
        { text: '1943', isCorrect: false },
      ],
      10,
      'World War II'
    ),
    createQuizQuestion(
      'Who was the first President of the United States?',
      [
        { text: 'George Washington', isCorrect: true },
        { text: 'Thomas Jefferson', isCorrect: false },
        { text: 'John Adams', isCorrect: false },
        { text: 'Benjamin Franklin', isCorrect: false },
      ],
      10,
      'American History'
    ),
  ],
  Science: [
    createQuizQuestion(
      "What is the chemical symbol for water?",
      [
        { text: 'H₂O', isCorrect: true },
        { text: 'CO₂', isCorrect: false },
        { text: 'NaCl', isCorrect: false },
        { text: 'O₂', isCorrect: false },
      ],
      10,
      'Chemistry'
    ),
    createQuizQuestion(
      "What is Newton's first law of motion?",
      [
        { text: 'An object at rest stays at rest unless acted upon by a force', isCorrect: true },
        { text: 'Force equals mass times acceleration', isCorrect: false },
        { text: 'Every action has an equal and opposite reaction', isCorrect: false },
        { text: 'Energy cannot be created or destroyed', isCorrect: false },
      ],
      10,
      'Physics'
    ),
  ],
};

export async function simulateAIQuizGeneration(config: AIQuizConfig): Promise<Quiz> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const subjectQuestions = AI_QUESTION_BANK[config.subject] || AI_QUESTION_BANK['Computer Science'];
  const selectedQuestions = shuffleArray(subjectQuestions).slice(0, config.numberOfQuestions);

  const questions: QuizQuestion[] = selectedQuestions.map((q) => ({
    ...q,
    id: generateId(),
    marks: config.marksPerQuestion,
    options: q.options.slice(0, config.optionsPerQuestion).map((opt) => ({
      ...opt,
      id: generateId(),
    })),
  }));

  return {
    id: generateId(),
    title: `${config.topic} Quiz`,
    description: config.description,
    classId: '',
    teacherId: '',
    subject: config.subject,
    topic: config.topic,
    difficulty: config.difficulty,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    timeLimit: config.timeLimit,
    maxAttempts: 3,
    isPublished: false,
    createdAt: new Date(),
    creationMethod: 'ai_topic',
    questions,
  };
}

export async function simulatePDFQuizGeneration(config: PDFQuizConfig): Promise<Quiz> {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const questions: QuizQuestion[] = Array.from({ length: config.numberOfQuestions }, (_, i) => ({
    id: generateId(),
    text: `Question ${i + 1} extracted from "${config.fileName}" regarding key concepts`,
    options: Array.from({ length: config.optionsPerQuestion }, (_, j) => ({
      id: generateId(),
      text: `Option ${String.fromCharCode(65 + j)} from document analysis`,
      isCorrect: j === 0,
    })),
    marks: config.marksPerQuestion,
    topic: `Section ${Math.floor(i / 2) + 1}`,
  }));

  return {
    id: generateId(),
    title: `Quiz from ${config.fileName}`,
    description: `AI-generated quiz based on content extracted from ${config.fileName}`,
    classId: '',
    teacherId: '',
    subject: 'Document Analysis',
    topic: config.fileName.replace('.pdf', ''),
    difficulty: config.difficulty,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    timeLimit: config.timeLimit,
    maxAttempts: 3,
    isPublished: false,
    createdAt: new Date(),
    creationMethod: 'ai_pdf',
    questions,
  };
}

export async function simulatePracticeQuestionGeneration(
  subject: string,
  topic: string,
  difficulty: Difficulty,
  excludeIds: string[]
): Promise<QuizQuestion> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const subjectQuestions = AI_QUESTION_BANK[subject] || AI_QUESTION_BANK['Computer Science'];
  const availableQuestions = subjectQuestions.filter((q) => !excludeIds.includes(q.id));

  if (availableQuestions.length === 0) {
    return {
      id: generateId(),
      text: `Generated practice question about ${topic} in ${subject}`,
      options: [
        { id: generateId(), text: 'Correct answer', isCorrect: true },
        { id: generateId(), text: 'Incorrect option A', isCorrect: false },
        { id: generateId(), text: 'Incorrect option B', isCorrect: false },
        { id: generateId(), text: 'Incorrect option C', isCorrect: false },
      ],
      marks: 10,
      topic,
    };
  }

  const question = shuffleArray(availableQuestions)[0];
  return {
    ...question,
    id: generateId(),
    options: question.options.map((opt) => ({ ...opt, id: generateId() })),
  };
}

export function generateTeacherAnalytics(classId: string): TeacherAnalytics {
  return {
    classId,
    quizId: 'quiz-1',
    questionStats: [
      { questionId: 'q1', failureRate: 0.15, averageTime: 45 },
      { questionId: 'q2', failureRate: 0.25, averageTime: 60 },
      { questionId: 'q3', failureRate: 0.10, averageTime: 30 },
      { questionId: 'q4', failureRate: 0.35, averageTime: 90 },
      { questionId: 'q5', failureRate: 0.20, averageTime: 55 },
    ],
    difficultyVsPerformance: [
      { difficulty: 'very_easy', averageScore: 95, averageTime: 120 },
      { difficulty: 'easy', averageScore: 85, averageTime: 200 },
      { difficulty: 'medium', averageScore: 72, averageTime: 350 },
      { difficulty: 'hard', averageScore: 58, averageTime: 500 },
      { difficulty: 'very_hard', averageScore: 42, averageTime: 700 },
    ],
    studentPerformance: MOCK_STUDENTS.map((s) => ({
      studentId: s.id,
      averageScore: Math.floor(Math.random() * 40) + 60,
      quizzesCompleted: Math.floor(Math.random() * 5) + 1,
      totalXP: s.totalXP,
    })),
  };
}

export function generateStudentInsights(studentId: string): StudentInsights {
  return {
    studentId,
    weakTopics: ['Recursion', 'Trees', 'Dynamic Programming'],
    strongTopics: ['Variables', 'Loops', 'Arrays'],
    accuracyTrend: [
      { date: new Date('2024-03-01'), accuracy: 65 },
      { date: new Date('2024-03-08'), accuracy: 70 },
      { date: new Date('2024-03-15'), accuracy: 72 },
      { date: new Date('2024-03-22'), accuracy: 78 },
      { date: new Date('2024-03-29'), accuracy: 82 },
    ],
    suggestedPracticeTopics: ['Binary Trees', 'Graph Algorithms', 'Recursion Basics'],
    totalQuizzesTaken: 8,
    averageAccuracy: 73,
    averageTime: 480,
  };
}

export function generateAIBadgeDescription(performance: {
  accuracy: number;
  streaks: number;
  xp: number;
}): Badge {
  const descriptions = [
    'Demonstrated exceptional pattern recognition across diverse topics',
    'Achieved remarkable consistency in challenging problem domains',
    'Mastered complex concepts with outstanding speed and precision',
  ];

  return {
    id: `prestige-${generateId()}`,
    name: 'AI Achievement Badge',
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    icon: '🏅',
    rarity: 'prestige',
    aiGenerated: true,
    earnedAt: new Date(),
  };
}
