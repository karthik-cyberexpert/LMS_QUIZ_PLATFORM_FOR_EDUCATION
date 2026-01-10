-- QuizMaster AI Database Schema

CREATE DATABASE IF NOT EXISTS quizmaster_db;
USE quizmaster_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- To be hashed
    name VARCHAR(100) NOT NULL,
    role ENUM('teacher', 'student') NOT NULL,
    avatarUrl VARCHAR(255),
    totalXP INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    inviteCode VARCHAR(10) UNIQUE NOT NULL,
    teacherId VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Class-Student Relationship (Many-to-Many)
CREATE TABLE IF NOT EXISTS class_students (
    classId VARCHAR(50),
    studentId VARCHAR(50),
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (classId, studentId),
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    classId VARCHAR(50) NOT NULL,
    teacherId VARCHAR(50) NOT NULL,
    difficulty ENUM('very_easy', 'easy', 'medium', 'hard', 'very_hard') NOT NULL,
    totalMarks INT NOT NULL,
    timeLimit INT NOT NULL, -- In seconds
    maxAttempts INT DEFAULT 3,
    deadline DATETIME,
    isPublished BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subject VARCHAR(100),
    topic VARCHAR(100),
    creationMethod ENUM('manual', 'ai_topic', 'ai_pdf') DEFAULT 'manual',
    isPractice BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    quizId VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    marks INT NOT NULL,
    timeLimit INT, -- Optional per-question limit
    explanation TEXT,
    topic VARCHAR(100),
    `order` INT NOT NULL,
    FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 6. Options Table
CREATE TABLE IF NOT EXISTS options (
    id VARCHAR(50) PRIMARY KEY,
    questionId VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    isCorrect BOOLEAN NOT NULL,
    FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
);

-- 7. Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
    id VARCHAR(50) PRIMARY KEY,
    quizId VARCHAR(50) NOT NULL,
    studentId VARCHAR(50) NOT NULL,
    startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submittedAt DATETIME,
    score INT DEFAULT 0,
    maxScore INT NOT NULL,
    accuracy DOUBLE DEFAULT 0.0,
    timeTaken INT DEFAULT 0, -- In seconds
    xpEarned INT DEFAULT 0,
    attemptNumber INT NOT NULL,
    isAutoSubmitted BOOLEAN DEFAULT FALSE,
    isFlagged BOOLEAN DEFAULT FALSE,
    flagReason TEXT,
    FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Attempt Answers
CREATE TABLE IF NOT EXISTS attempt_answers (
    attemptId VARCHAR(50) NOT NULL,
    questionId VARCHAR(50) NOT NULL,
    optionId VARCHAR(50) NOT NULL,
    PRIMARY KEY (attemptId, questionId),
    FOREIGN KEY (attemptId) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (optionId) REFERENCES options(id) ON DELETE CASCADE
);

-- 9. Warnings Table
CREATE TABLE IF NOT EXISTS warnings (
    id VARCHAR(50) PRIMARY KEY,
    attemptId VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT,
    FOREIGN KEY (attemptId) REFERENCES attempts(id) ON DELETE CASCADE
);

-- 10. Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(20),
    rarity ENUM('common', 'rare', 'epic', 'legendary', 'prestige') NOT NULL,
    aiGenerated BOOLEAN DEFAULT FALSE
);

-- 11. User Badges
CREATE TABLE IF NOT EXISTS user_badges (
    userId VARCHAR(50) NOT NULL,
    badgeId VARCHAR(50) NOT NULL,
    earnedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, badgeId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badgeId) REFERENCES badges(id) ON DELETE CASCADE
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quizId VARCHAR(50),
    attemptId VARCHAR(50),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Initial Badges
INSERT IGNORE INTO badges (id, name, description, icon, rarity, aiGenerated) VALUES
('first_quiz', 'First Steps', 'Complete your first quiz', '🎯', 'common', FALSE),
('perfect_score', 'Perfectionist', 'Score 100% on any quiz', '⭐', 'rare', FALSE),
('speed_demon', 'Speed Demon', 'Complete a quiz in under 50% of time limit', '⚡', 'rare', FALSE),
('streak_3', 'On Fire', 'Get 3 correct answers in a row', '🔥', 'common', FALSE),
('streak_10', 'Unstoppable', 'Get 10 correct answers in a row', '💪', 'epic', FALSE),
('xp_1000', 'Rising Star', 'Earn 1000 total XP', '🌟', 'common', FALSE),
('xp_5000', 'Knowledge Seeker', 'Earn 5000 total XP', '📚', 'rare', FALSE),
('xp_10000', 'Scholar', 'Earn 10000 total XP', '🎓', 'epic', FALSE),
('practice_master', 'Practice Master', 'Complete 50 practice questions', '🏋️', 'rare', FALSE),
('class_champion', 'Class Champion', 'Rank #1 on a class leaderboard', '🏆', 'legendary', FALSE),
('ai_conqueror', 'AI Conqueror', 'Master AI-generated quizzes', '🤖', 'prestige', TRUE),
('knowledge_titan', 'Knowledge Titan', 'Exceptional mastery across all topics', '🏛️', 'prestige', TRUE);
