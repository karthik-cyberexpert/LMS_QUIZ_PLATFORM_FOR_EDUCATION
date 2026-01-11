import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;

    // 1. Fetch Quiz Metadata
    const quizzes = await query('SELECT * FROM quizzes WHERE id = ?', [quizId]) as any[];
    if (quizzes.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizzes[0];

    // 2. Fetch Questions
    const questions = await query(
      'SELECT * FROM questions WHERE quizId = ? ORDER BY `order` ASC',
      [quizId]
    ) as any[];

    // 3. Fetch Options for each question
    for (const question of questions) {
      const options = await query(
        'SELECT * FROM options WHERE questionId = ?',
        [question.id]
      ) as any[];
      question.options = options;
    }

    quiz.questions = questions;

    return NextResponse.json({ quiz });

  } catch (error) {
    console.error('Quiz Detail GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const connection = await pool.getConnection();
  try {
    const { id: quizId } = await params;
    const body = await request.json();
    
    // Destructure with safe defaults
    const { 
      title = 'Untitled Quiz', 
      description = '', 
      difficulty = 'medium', 
      totalMarks = 0, 
      timeLimit = 600, 
      maxAttempts = 3, 
      deadline = null, 
      isPublished = false,
      questions = []
    } = body;

    await connection.beginTransaction();

    // 1. Update Quiz Metadata
    await connection.execute(
      `UPDATE quizzes SET 
        title = ?, description = ?, difficulty = ?, totalMarks = ?, 
        timeLimit = ?, maxAttempts = ?, deadline = ?, isPublished = ?
       WHERE id = ?`,
      [
        title, 
        description, 
        difficulty, 
        totalMarks, 
        timeLimit, 
        maxAttempts, 
        deadline ? new Date(deadline) : null, 
        isPublished ? 1 : 0, 
        quizId
      ]
    );

    // 2. Clear existing questions and options (Cascades to options if DB set up correctly, 
    // but we'll be safe and handle it if needed or assume CASCADE)
    // Based on our schema.sql, options have FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    // And questions have FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
    // However, we don't want to delete the QUIZ, just the questions.
    await connection.execute('DELETE FROM questions WHERE quizId = ?', [quizId]);

    // 3. Re-insert Questions and Options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionId = q.id?.startsWith('q-') ? `question-${Date.now()}-${i}` : q.id;
      
      await connection.execute(
        'INSERT INTO questions (id, quizId, text, marks, timeLimit, explanation, topic, `order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [questionId, quizId, q.text, q.marks, q.timeLimit || null, q.explanation || null, q.topic || null, i]
      );

      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        const optionId = o.id?.startsWith('opt-') ? `option-${Date.now()}-${i}-${j}` : o.id;
        
        await connection.execute(
          'INSERT INTO options (id, questionId, text, isCorrect) VALUES (?, ?, ?, ?)',
          [optionId, questionId, o.text, o.isCorrect ? 1 : 0]
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    await connection.rollback();
    console.error('Quiz Detail PATCH API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    await query('DELETE FROM quizzes WHERE id = ?', [quizId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quiz Detail DELETE API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
