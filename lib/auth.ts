import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function getCurrentUser(request?: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuth(request?: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function getUserProfile(userId: string) {
  const db = (await import('@/lib/db')).default;
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

