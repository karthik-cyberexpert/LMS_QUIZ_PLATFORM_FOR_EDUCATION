import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, action, details, quizId, attemptId } = await request.json();
    const id = `log-${Date.now()}`;

    await query(
      `INSERT INTO audit_logs (id, userId, action, details, quizId, attemptId) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, action, details, quizId || null, attemptId || null]
    );

    return NextResponse.json({ success: true, id });

  } catch (error) {
    console.error('Audit Log POST API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let sql = 'SELECT * FROM audit_logs';
    const params = [];

    if (userId) {
      sql += ' WHERE userId = ?';
      params.push(userId);
    }

    sql += ' ORDER BY timestamp DESC LIMIT 100';

    const logs = await query(sql, params);
    return NextResponse.json({ logs });

  } catch (error) {
    console.error('Audit Log GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
