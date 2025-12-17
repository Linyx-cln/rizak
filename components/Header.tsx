'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Header({ userEmail, userRole }: { userEmail: string; userRole: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-gray-900">Rizak</h1>
          <nav className="flex space-x-4">
            <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
            <a href="/issues" className="text-gray-700 hover:text-gray-900">Issues</a>
            {userRole === 'admin' && (
              <a href="/admin/invite" className="text-gray-700 hover:text-gray-900">Invite Users</a>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{userEmail}</span>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{userRole}</span>
          <a href="/settings" className="text-sm text-gray-700 hover:text-gray-900">Settings</a>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
