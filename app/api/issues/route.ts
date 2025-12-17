import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserProfile } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const profile = await getUserProfile(user.id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assigned_to');

    let query = db
      .from('issues')
      .select(`
        *,
        creator:created_by(id, email, full_name, role),
        assignee:assigned_to(id, email, full_name, role)
      `)
      .order('created_at', { ascending: false });

    // Regular users can only see their own issues
    if (profile.role !== 'admin') {
      query = query.eq('created_by', user.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ issues: data });
  } catch (error: any) {
    console.error('Get issues error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch issues' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const profile = await getUserProfile(user.id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Only regular users can create issues, admins cannot
    if (profile.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot create issues' },
        { status: 403 }
      );
    }

    const { title, description, priority, assigned_to } = await request.json();

    if (!title || !priority) {
      return NextResponse.json(
        { error: 'Title and priority are required' },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('issues')
      .insert({
        title,
        description: description || null,
        priority,
        created_by: user.id,
        assigned_to: assigned_to || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ issue: data }, { status: 201 });
  } catch (error: any) {
    console.error('Create issue error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create issue' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
