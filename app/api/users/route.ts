import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: users, error } = await db
      .from('profiles')
      .select('id, email, full_name, role')
      .order('full_name')
      .order('email');

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
