import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth';
import db from '@/lib/db';
import Header from '@/components/Header';
import DashboardCharts from './DashboardCharts';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    redirect('/login');
  }

  // Fetch issues based on role
  let issuesQuery = db.from('issues').select('*');
  
  // Regular users can only see their own issues
  if (profile.role !== 'admin') {
    issuesQuery = issuesQuery.eq('created_by', user.id);
  }

  const { data: allIssues, error: issuesError } = await issuesQuery;

  if (issuesError) {
    console.error('Error fetching issues:', issuesError);
  }

  const issues = allIssues || [];

  // Calculate statistics
  const stats = {
    total_issues: issues.length,
    open_issues: issues.filter(i => i.status === 'open').length,
    in_progress_issues: issues.filter(i => i.status === 'in_progress').length,
    resolved_issues: issues.filter(i => i.status === 'resolved').length,
    closed_issues: issues.filter(i => i.status === 'closed').length,
    low_priority: issues.filter(i => i.priority === 'low').length,
    medium_priority: issues.filter(i => i.priority === 'medium').length,
    high_priority: issues.filter(i => i.priority === 'high').length,
  };

  // Get recent issues (already filtered by role above)
  const recentIssues = issues.slice(0, 10);

  const statusData = [
    { name: 'Open', value: stats.open_issues },
    { name: 'In Progress', value: stats.in_progress_issues },
    { name: 'Resolved', value: stats.resolved_issues },
    { name: 'Closed', value: stats.closed_issues },
  ];

  const priorityData = [
    { name: 'Low', value: stats.low_priority },
    { name: 'Medium', value: stats.medium_priority },
    { name: 'High', value: stats.high_priority },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={profile.email} userRole={profile.role} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Issues</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_issues}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-3xl font-bold text-blue-600">{stats.open_issues}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.in_progress_issues}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved_issues}</p>
          </div>
        </div>

        {/* Charts */}
        <DashboardCharts statusData={statusData} priorityData={priorityData} />

        {/* My Issues */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {profile.role === 'admin' ? 'Recent Issues' : 'My Recent Issues'}
            </h3>
          </div>
          <div className="p-6">
            {recentIssues.length === 0 ? (
              <p className="text-gray-600">No issues found.</p>
            ) : (
              <div className="space-y-4">
                {recentIssues.map((issue: any) => (
                  <a
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.description ? issue.description.substring(0, 100) : 'No description'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                          issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          issue.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
