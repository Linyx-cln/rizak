import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth';
import db from '@/lib/db';
import Header from '@/components/Header';
import IssueDetails from './IssueDetails';

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    redirect('/login');
  }

  const { id } = await params;

  // Fetch issue details
  const { data: issue, error: issueError } = await db
    .from('issues')
    .select(`
      *,
      creator:created_by(id, email, full_name, role),
      assignee:assigned_to(id, email, full_name, role)
    `)
    .eq('id', id)
    .single();

  if (issueError || !issue) {
    redirect('/issues');
  }

  // Regular users can only view their own issues
  if (profile.role !== 'admin' && issue.created_by !== user.id) {
    redirect('/issues');
  }

  // Fetch comments - authorization already checked above
  const { data: comments, error: commentsError } = await db
    .from('comments')
    .select(`
      *,
      user:profiles!user_id(id, email, full_name, role)
    `)
    .eq('issue_id', id)
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  // Only fetch users for assignment if current user is admin
  let users: any[] = [];
  if (profile.role === 'admin') {
    const { data: usersData } = await db
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('full_name', { ascending: true });
    users = usersData || [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={profile.email} userRole={profile.role} />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IssueDetails
          issue={issue}
          comments={comments || []}
          users={users}
          currentUserId={user.id}
          currentUserRole={profile.role}
        />
      </main>
    </div>
  );
}
