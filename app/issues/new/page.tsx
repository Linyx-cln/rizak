import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth';
import Header from '@/components/Header';
import NewIssueForm from './NewIssueForm';
import db from '@/lib/db';

export default async function NewIssuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    redirect('/login');
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
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Create New Issue</h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <NewIssueForm users={users} currentUserRole={profile.role} />
        </div>
      </main>
    </div>
  );
}
