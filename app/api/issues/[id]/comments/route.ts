import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if issue exists and user has access
    const { data: issueCheck, error: issueError } = await db
      .from('issues')
      .select('created_by')
      .eq('id', id)
      .single();

    if (issueError || !issueCheck) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Get user profile to check role
    const { getUserProfile } = await import('@/lib/auth');
    const profile = await getUserProfile(user.id);

    // Regular users can only view comments on their own issues
    if (profile?.role !== 'admin' && issueCheck.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: comments, error } = await db
      .from('comments')
      .select(`
        *,
        user:profiles!user_id(id, email, full_name, role)
      `)
      .eq('issue_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Verify issue exists and check access
    const { data: issueCheck, error: checkError } = await db
      .from('issues')
      .select('id, created_by')
      .eq('id', id)
      .single();
      
    if (checkError || !issueCheck) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Get user profile to check role
    const { getUserProfile } = await import('@/lib/auth');
    const profile = await getUserProfile(user.id);

    // Regular users can only comment on their own issues
    if (profile?.role !== 'admin' && issueCheck.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only comment on your own issues' },
        { status: 403 }
      );
    }

    const { data: comment, error } = await db
      .from('comments')
      .insert({
        issue_id: id,
        user_id: user.id,
        content: content
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
