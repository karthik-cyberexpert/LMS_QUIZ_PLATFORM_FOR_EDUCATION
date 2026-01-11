import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');

    let sql = 'SELECT q.*, (SELECT COUNT(*) FROM questions WHERE quizId = q.id) as questionCount FROM quizzes q';
    const params = [];

    if (classId) {
      sql += ' WHERE q.classId = ?';
      params.push(classId);
    } else if (teacherId) {
      sql += ' WHERE q.teacherId = ?';
      params.push(teacherId);
    } else if (studentId) {
      // Fetch all published quizzes for classes the student is enrolled in
      sql = `
        SELECT q.*, (SELECT COUNT(*) FROM questions WHERE quizId = q.id) as questionCount
        FROM quizzes q
        JOIN class_students cs ON q.classId = cs.classId
        WHERE cs.studentId = ? AND q.isPublished = 1
      `;
      params.push(studentId);
    }

    sql += ' ORDER BY createdAt DESC';

    const quizzes = await query(sql, params) as any[];

    // For each quiz, fetch its questions if it's a single quiz request or needed
    // For a list, we might just return the quiz metadata for performance
    return NextResponse.json({ quizzes });

  } catch (error) {
    console.error('Quizzes GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const quizData = await request.json();
    const {
      title, description, classId, teacherId, questions,
      difficulty, totalMarks, timeLimit, maxAttempts,
      deadline, subject, topic, creationMethod
    } = quizData;

    const quizId = `quiz-${Date.now()}`;

    // 1. Insert Quiz
    await connection.execute(
      `INSERT INTO quizzes (
        id, title, description, classId, teacherId, difficulty, 
        totalMarks, timeLimit, maxAttempts, deadline, subject, 
        topic, creationMethod, isPublished
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quizId, title, description, classId, teacherId, difficulty,
        totalMarks, timeLimit, maxAttempts, deadline ? new Date(deadline) : null,
        subject, topic, creationMethod, true
      ]
    );

    // 2. Insert Questions and Options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionId = `question-${Date.now()}-${i}`;
      
      await connection.execute(
        'INSERT INTO questions (id, quizId, text, marks, timeLimit, explanation, topic, `order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [questionId, quizId, q.text, q.marks, q.timeLimit || null, q.explanation || null, q.topic || null, i]
      );

      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        const optionId = `option-${Date.now()}-${i}-${j}`;
        
        await connection.execute(
          'INSERT INTO options (id, questionId, text, isCorrect) VALUES (?, ?, ?, ?)',
          [optionId, questionId, o.text, o.isCorrect]
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ success: true, quizId });

  } catch (error) {
    await connection.rollback();
    console.error('Quiz POST API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    connection.release();
  }
}
