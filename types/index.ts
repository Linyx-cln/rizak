export type Priority = 'low' | 'medium' | 'high';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  assignee?: Profile;
}

export interface Comment {
  id: number;
  issue_id: number;
  user_id: string;
  content: string;
  created_at: string;
  user?: Profile;
}

export interface IssueWithDetails extends Issue {
  comments?: Comment[];
}
