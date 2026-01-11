import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    const students = await query(
      `SELECT u.id, u.name, u.email, u.role, u.totalXP, u.avatarUrl, u.createdAt 
       FROM users u 
       JOIN class_students cs ON u.id = cs.studentId 
       WHERE cs.classId = ?`,
      [classId]
    ) as any[];

    return NextResponse.json({ students });

  } catch (error) {
    console.error('Class Students GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
