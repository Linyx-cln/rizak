import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserProfile } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const profile = await getUserProfile(user.id);
    const { id } = await params;

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: issue, error } = await db
      .from('issues')
      .select(`
        *,
        creator:profiles!created_by(id, email, full_name, role),
        assignee:profiles!assigned_to(id, email, full_name, role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
      throw error;
    }

    // Regular users can only view their own issues
    if (profile.role !== 'admin' && issue.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ issue });
  } catch (error: any) {
    console.error('Get issue error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch issue' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const profile = await getUserProfile(user.id);
    const { id } = await params;

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, priority, status, assigned_to } = body;

    // Check if user has permission to update (only creator)
    const { data: issueCheck, error: checkError } = await db
      .from('issues')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (checkError || !issueCheck) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Only the issue creator can update the issue
    if (issueCheck.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own issues' },
        { status: 403 }
      );
    }

    const updates: any = {};

    if (title !== undefined) {
      updates.title = title;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (priority !== undefined) {
      updates.priority = priority;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (assigned_to !== undefined) {
      updates.assigned_to = assigned_to;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data: issue, error } = await db
      .from('issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ issue });
  } catch (error: any) {
    console.error('Update issue error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update issue' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const profile = await getUserProfile(user.id);
    const { id } = await params;

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if issue exists and get owner
    const { data: issueCheck, error: checkError } = await db
      .from('issues')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (checkError || !issueCheck) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Only the issue creator can delete the issue
    if (issueCheck.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own issues' },
        { status: 403 }
      );
    }

    const { error } = await db
      .from('issues')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete issue error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete issue' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
