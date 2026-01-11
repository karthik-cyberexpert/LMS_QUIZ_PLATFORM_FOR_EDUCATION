import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // 1. Check if user already exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]) as any[];
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Generate a unique ID (matching the mock format for consistency)
    const id = `${role}-${Date.now()}`;

    // 4. Insert the new user
    await query(
      'INSERT INTO users (id, name, email, password, role, totalXP) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, role, 0]
    );

    // 5. Return success (excluding password)
    return NextResponse.json({
      user: {
        id,
        name,
        email,
        role,
        totalXP: 0,
        badges: []
      }
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
