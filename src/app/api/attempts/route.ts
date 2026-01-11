import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const attemptData = await request.json();
    const {
      quizId, studentId, answers, startedAt, submittedAt,
      score, maxScore, accuracy, timeTaken, xpEarned,
      attemptNumber, isAutoSubmitted, isFlagged, flagReason
    } = attemptData;

    const attemptId = `attempt-${Date.now()}`;

    // 1. Insert Attempt
    await connection.execute(
      `INSERT INTO attempts (
        id, quizId, studentId, startedAt, submittedAt, score, 
        maxScore, accuracy, timeTaken, xpEarned, attemptNumber, 
        isAutoSubmitted, isFlagged, flagReason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attemptId, quizId, studentId, new Date(startedAt), 
        submittedAt ? new Date(submittedAt) : null, score,
        maxScore, accuracy, timeTaken, xpEarned, attemptNumber,
        isAutoSubmitted, isFlagged, flagReason || null
      ]
    );

    // 2. Insert Answers
    for (const [questionId, optionId] of Object.entries(answers)) {
      await connection.execute(
        'INSERT INTO attempt_answers (attemptId, questionId, optionId) VALUES (?, ?, ?)',
        [attemptId, questionId, optionId as string]
      );
    }

    // 3. Update User XP
    await connection.execute(
      'UPDATE users SET totalXP = totalXP + ? WHERE id = ?',
      [xpEarned, studentId]
    );

    await connection.commit();
    return NextResponse.json({ success: true, attemptId });

  } catch (error) {
    await connection.rollback();
    console.error('Attempt POST API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const quizId = searchParams.get('quizId');
    const teacherId = searchParams.get('teacherId');

    let sql = `
      SELECT a.*, u.name as studentName 
      FROM attempts a
      JOIN users u ON a.studentId = u.id
    `;
    const params = [];

    if (studentId && quizId) {
      sql += ' WHERE a.studentId = ? AND a.quizId = ?';
      params.push(studentId, quizId);
    } else if (studentId) {
      sql += ' WHERE a.studentId = ?';
      params.push(studentId);
    } else if (quizId) {
      sql += ' WHERE a.quizId = ?';
      params.push(quizId);
    } else if (teacherId) {
      // Fetch all attempts for this teacher's quizzes
      sql += ' WHERE a.quizId IN (SELECT id FROM quizzes WHERE teacherId = ?)';
      params.push(teacherId);
    }

    sql += ' ORDER BY a.startedAt DESC';

    const attempts = await query(sql, params);
    return NextResponse.json({ attempts });

  } catch (error) {
    console.error('Attempts GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
