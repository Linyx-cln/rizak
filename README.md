# Rizak - Issue Tracking Web Application

A full-stack issue tracking system built with Next.js, Supabase, and TypeScript. This application allows teams to manage issues efficiently with role-based access control, real-time updates, and email notifications.

## 🎯 Features

### Core Functionality
- **User Authentication** - Secure registration and login using Supabase Auth
- **Issue Management** - Create, read, update, and delete issues
- **Role-Based Access Control**
  - **Users**: Can only view and manage their own issues
  - **Admins**: Can view and comment on all issues
- **Comments System** - Add comments to issues for collaboration
- **Dashboard** - Visual analytics with charts showing issue statistics
- **Email Invitations** - Admins can invite new users via email
- **Password Management** - Users can change their passwords securely
- **Filtering & Search** - Filter issues by status, priority, and assignment

### User Features
- Create personal issues with title, description, and priority
- Update issue status (open, in progress, resolved, closed)
- Delete own issues
- Add comments to own issues
- View personal dashboard with statistics
- Change password in settings

### Admin Features
- View all issues from all users
- Comment on any issue
- Invite new users with specific roles

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - CSS framework
- **Recharts** - Data visualization for dashboard

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL Database
- **Nodemailer** - Email sending for invitations

### Database
- **PostgreSQL** (via Supabase)
  - `profiles` - User profiles with roles
  - `issues` - Issue tracking with relationships
  - `comments` - Issue comments

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Gmail account for email invitations (or other SMTP service)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rizak
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy your project URL and anon/public key
4. Go to **Authentication** → **Providers** → **Email**
5. **Disable** "Confirm email" option
6. Go to **SQL Editor** and run the migration SQL (see Database Setup below)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Gmail App Password Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → 2-Step Verification → App Passwords
3. Generate a new app password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

### 5. Database Setup

Run the SQL migration in Supabase:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click **Run**

This creates:
- `profiles` table (user profiles with roles)
- `issues` table (issue tracking)
- `comments` table (issue comments)
- Indexes for performance
- Triggers for auto-updating timestamps

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 User Roles & Permissions

### Regular User
- ✅ Register and login
- ✅ Create issues
- ✅ View only their own issues
- ✅ Update their own issues (title, description, priority, status)
- ✅ Delete their own issues
- ✅ Comment on their own issues
- ✅ View personal dashboard with statistics
- ✅ Change password
- ❌ Cannot see other users' issues
- ❌ Cannot invite users
- ❌ Cannot assign issues to others
- ❌ Cannot see list of other users

### Admin
- ✅ View all issues from all users
- ✅ Comment on any issue
- ✅ Invite new users via email
- ✅ View global dashboard statistics
- ❌ Cannot create issues
- ❌ Cannot edit any issues
- ❌ Cannot delete any issues
- ❌ Cannot see list of other users (only admins for assignment)

## 📱 Application Pages

### Public Pages
- `/login` - User login
- `/register` - New user registration

### Protected Pages (Requires Authentication)
- `/dashboard` - Dashboard with charts and recent issues
- `/issues` - List all issues (filtered by role)
- `/issues/new` - Create new issue
- `/issues/[id]` - View and edit issue details
- `/settings` - Change password and view profile
- `/admin/invite` - Invite new users (admin only)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/change-password` - Change password

### Issues
- `GET /api/issues` - List issues (filtered by role)
- `POST /api/issues` - Create new issue
- `GET /api/issues/[id]` - Get issue details
- `PATCH /api/issues/[id]` - Update issue
- `DELETE /api/issues/[id]` - Delete issue

### Comments
- `GET /api/issues/[id]/comments` - Get issue comments
- `POST /api/issues/[id]/comments` - Add comment

### Admin
- `POST /api/admin/invite` - Invite user via email
- `GET /api/users` - List all users

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t rizak .

# Run the container
docker run -p 3000:3000 --env-file .env.local rizak
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### profiles
```sql
- id (UUID, FK to auth.users)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- role (TEXT: 'admin' | 'user')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### issues
```sql
- id (SERIAL, PK)
- title (TEXT)
- description (TEXT)
- priority (TEXT: 'low' | 'medium' | 'high')
- status (TEXT: 'open' | 'in_progress' | 'resolved' | 'closed')
- created_by (UUID, FK to profiles)
- assigned_to (UUID, FK to profiles, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### comments
```sql
- id (SERIAL, PK)
- issue_id (INTEGER, FK to issues)
- user_id (UUID, FK to profiles)
- content (TEXT)
- created_at (TIMESTAMP)
```

## 🔧 Development

### Project Structure

```
rizak/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── admin/                # Admin-only endpoints
│   │   ├── issues/               # Issue CRUD operations
│   │   └── users/                # User management
│   ├── admin/                    # Admin pages
│   │   └── invite/               # User invitation
│   ├── dashboard/                # Dashboard page
│   ├── issues/                   # Issue pages
│   │   ├── [id]/                 # Issue detail page
│   │   └── new/                  # Create issue page
│   ├── settings/                 # Settings page
│   ├── login/                    # Login page
│   └── register/                 # Register page
├── components/                   # React components
│   ├── Header.tsx                # Navigation header
│   ├── IssueCard.tsx             # Issue list card
│   └── IssueForm.tsx             # Issue create/edit form
├── lib/                          # Utility functions
│   ├── auth.ts                   # Authentication helpers
│   ├── db.ts                     # Database client
│   └── supabase/                 # Supabase clients
│       ├── client.ts             # Browser client
│       └── server.ts             # Server client
├── migrations/                   # Database migrations
│   └── 001_initial_schema.sql    # Initial database schema
├── scripts/                      # Utility scripts
│   └── show-migration.js         # Display migration SQL
├── types/                        # TypeScript types
├── utils/                        # Supabase utilities
├── public/                       # Static files
├── .env.local                    # Environment variables
├── docker-compose.yml            # Docker compose config
├── Dockerfile                    # Docker configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # TailwindCSS configuration
└── package.json                  # Dependencies
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎯 Usage Guide

### For First-Time Setup

1. **Register Admin Account**
   - Go to `/register`
   - Create your account
   - Go to Supabase Dashboard → Table Editor → `profiles`
   - Change your role from `user` to `admin`

2. **Invite Team Members**
   - Login as admin
   - Navigate to **Invite Users**
   - Enter email, name, and role
   - User receives email with temporary password

3. **Invited User First Login**
   - Check email for temporary password
   - Login at `/login`
   - Go to **Settings** → Change Password
   - Set a new secure password

### Creating Issues

1. Click **Issues** → **New Issue**
2. Fill in:
   - Title (required)
   - Description
   - Priority (low, medium, high)
   - Assign to admin (optional, admin only)
3. Click **Create Issue**

### Managing Issues

- **View**: Click on any issue from the list
- **Edit**: Click "Edit Issue" button (owner or admin)
- **Delete**: Click "Delete" button (owner or admin)
- **Comment**: Add comments in the issue detail page
- **Update Status**: Change status in edit mode (open → in progress → resolved → closed)

## 🔐 Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control on all routes
- **Row-Level Security**: Users can only access their own data
- **Password Hashing**: Handled by Supabase Auth
- **HTTPS**: Enforced in production via Supabase
- **SQL Injection Protection**: Parameterized queries via Supabase client

## 🐛 Troubleshooting

### "Email confirmation required" error
- Disable email confirmation in Supabase Dashboard → Authentication → Providers → Email

### Cannot see invited user
- Check Supabase Dashboard → Authentication → Users
- Verify the profile was created in the `profiles` table

### Email not sending
- Verify Gmail app password is correct
- Check EMAIL_USER and EMAIL_PASSWORD in .env.local
- Ensure 2FA is enabled on Gmail account

### Database connection issues
- Ensure you ran the migration SQL in Supabase
- Check NEXT_PUBLIC_SUPABASE_URL and key are correct
- Verify Supabase project is not paused

### Users can see other users' issues
- Verify role-based filtering is working in API routes
- Check that users are logged in with the correct account
- Admins can see all issues by design

## 📝 Assignment Requirements Checklist

- ✅ Full-stack web application
- ✅ User authentication and registration
- ✅ Issue CRUD operations
- ✅ Admin and User roles with different permissions
- ✅ Users can only manage their own issues
- ✅ Admins can view and comment on all issues
- ✅ Email invitations for new users
- ✅ Dashboard with data visualization
- ✅ Comments system
- ✅ Filtering by status, priority
- ✅ Responsive design with TailwindCSS
- ✅ TypeScript for type safety
- ✅ Docker containerization
- ✅ PostgreSQL database
- ✅ RESTful API
- ✅ Comprehensive README

## 🌟 Key Features Implemented

### Role-Based Access Control
- Users see and manage only their own issues
- Admins have full visibility and control over all issues
- Enforced at the API level for security

### Email System
- Automated email invitations with temporary passwords
- Gmail SMTP integration
- Password change functionality for security

### Data Visualization
- Dashboard with Recharts
- Issue statistics by status
- Recent issues list

### Modern UI/UX
- Responsive design
- Clean, professional interface
- Intuitive navigation
- Form validation and error handling

## 📄 License

MIT


