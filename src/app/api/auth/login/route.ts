import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Fetch user by email
    const users = await query(
      'SELECT id, name, email, password, role, totalXP, avatarUrl FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    // 2. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Fetch user badges
    const badges = await query(
      `SELECT b.*, ub.earnedAt 
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badgeId 
       WHERE ub.userId = ?`,
      [user.id]
    ) as any[];

    // 4. Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        badges: badges.map(b => ({
          ...b,
          earnedAt: b.earnedAt ? new Date(b.earnedAt) : undefined
        }))
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
