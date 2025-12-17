'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Issue, Comment, Profile } from '@/types';

interface IssueDetailsProps {
  issue: Issue;
  comments: Comment[];
  users: Profile[];
  currentUserId: string;
  currentUserRole: string;
}

export default function IssueDetails({
  issue,
  comments: initialComments,
  users,
  currentUserId,
  currentUserRole,
}: IssueDetailsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: issue.title,
    description: issue.description || '',
    priority: issue.priority,
    status: issue.status,
    assigned_to: issue.assigned_to || '',
  });

  // Only the issue creator can edit or delete
  const canEdit = issue.created_by === currentUserId;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete issue');
      }

      router.push('/issues');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assigned_to: formData.assigned_to || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update issue');
      }

      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add comment');
      }

      setNewComment('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Issue Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
          <div className="flex gap-2">
            {canEdit && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Edit Issue
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {currentUserRole === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  >
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'admin').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm rounded ${
                issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {issue.priority}
              </span>
              <span className={`px-3 py-1 text-sm rounded ${
                issue.status === 'open' ? 'bg-blue-100 text-blue-800' :
                issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {issue.status.replace('_', ' ')}
              </span>
            </div>

            <div>
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Created by</p>
                <p className="font-medium">{issue.creator?.full_name || issue.creator?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned to</p>
                <p className="font-medium">{issue.assignee?.full_name || issue.assignee?.email || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{new Date(issue.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last updated</p>
                <p className="font-medium">{new Date(issue.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>

        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <p className="text-gray-600">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900">
                    {comment.user?.full_name || comment.user?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add a comment</label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              placeholder="Write your comment..."
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}
