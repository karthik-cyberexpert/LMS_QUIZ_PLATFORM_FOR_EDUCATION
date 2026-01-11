import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { inviteCode, studentId } = await request.json();

    // 1. Find the class by invite code
    const classes = await query('SELECT id FROM classes WHERE inviteCode = ?', [inviteCode]) as any[];
    if (classes.length === 0) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    const classId = classes[0].id;

    // 2. Check if student is already in the class
    const existingJoin = await query(
      'SELECT * FROM class_students WHERE classId = ? AND studentId = ?',
      [classId, studentId]
    ) as any[];

    if (existingJoin.length > 0) {
      return NextResponse.json({ error: 'You are already in this class' }, { status: 400 });
    }

    // 3. Join the class
    await query(
      'INSERT INTO class_students (classId, studentId) VALUES (?, ?)',
      [classId, studentId]
    );

    return NextResponse.json({ success: true, classId });

  } catch (error) {
    console.error('Join Class API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
