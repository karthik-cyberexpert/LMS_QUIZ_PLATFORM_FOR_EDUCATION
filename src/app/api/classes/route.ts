import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');

    if (teacherId) {
      const classes = await query(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM class_students cs WHERE cs.classId = c.id) as studentCount,
                (SELECT COUNT(*) FROM quizzes q WHERE q.classId = c.id AND q.isPublished = 1) as quizCount
         FROM classes c 
         WHERE c.teacherId = ? 
         ORDER BY c.createdAt DESC`, 
        [teacherId]
      );
      return NextResponse.json({ classes });
    }

    if (studentId) {
      const classes = await query(
        `SELECT c.*,
                (SELECT COUNT(*) FROM class_students cs WHERE cs.classId = c.id) as studentCount,
                (SELECT COUNT(*) FROM quizzes q WHERE q.classId = c.id AND q.isPublished = 1) as quizCount
         FROM classes c 
         JOIN class_students cs ON c.id = cs.classId 
         WHERE cs.studentId = ? 
         ORDER BY c.createdAt DESC`,
        [studentId]
      );
      return NextResponse.json({ classes });
    }

    return NextResponse.json({ error: 'Missing teacherId or studentId' }, { status: 400 });

  } catch (error) {
    console.error('Classes GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, teacherId } = await request.json();

    // Generate a simple invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = `class-${Date.now()}`;

    await query(
      'INSERT INTO classes (id, name, description, inviteCode, teacherId) VALUES (?, ?, ?, ?, ?)',
      [id, name, description, inviteCode, teacherId]
    );

    const newClass = {
      id,
      name,
      description,
      inviteCode,
      teacherId,
      studentIds: [],
      quizIds: [],
      createdAt: new Date()
    };

    return NextResponse.json({ class: newClass });

  } catch (error) {
    console.error('Classes POST API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
