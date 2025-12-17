import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserProfile } from '@/lib/auth';
import nodemailer from 'nodemailer';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const profile = await getUserProfile(user.id);

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can invite users' },
        { status: 403 }
      );
    }

    const { email, fullName, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

    // Create user in Supabase Auth using the client-side method
    // Note: This creates the auth user but we need to manually create the profile
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        data: {
          full_name: fullName || null,
        }
      }
    });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Create profile in database using Supabase client
    const { error: profileError } = await db
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName || null,
        role: role
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Send invitation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Invitation to Rizak Issue Tracking System',
      html: `
        <h2>Welcome to Rizak!</h2>
        <p>You have been invited to join the Rizak Issue Tracking System${fullName ? ` as ${fullName}` : ''}.</p>
        <p><strong>Your account details:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Temporary Password: ${tempPassword}</li>
          <li>Role: ${role}</li>
        </ul>
        <p>Please follow these steps to get started:</p>
        <ol>
          <li>Visit <a href="${appUrl}/login">${appUrl}/login</a></li>
          <li>Sign in with the credentials above</li>
          <li>Change your password immediately after logging in</li>
        </ol>
        <p>If you have any questions, please contact your administrator.</p>
        <br>
        <p>Best regards,<br>Rizak Team</p>
      `,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error: any) {
    console.error('Invite user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to invite user' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
