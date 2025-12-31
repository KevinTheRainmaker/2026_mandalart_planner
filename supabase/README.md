# Supabase Setup

## Database Migrations

To apply the database schema, follow these steps:

### 1. Create a Supabase Project

Go to [Supabase](https://supabase.com) and create a new project.

### 2. Apply the Migration

Option A: Using Supabase Dashboard (SQL Editor)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the content from `migrations/20260101000000_init_schema.sql`
4. Paste and run it

Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 3. Update Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=http://localhost:5173
```

Get these values from:
- Supabase Dashboard → Settings → API

### 4. Configure Email Templates

1. Go to Authentication → Email Templates
2. Update the "Magic Link" template redirect URL to:
   ```
   {{ .SiteURL }}/auth/callback
   ```

### 5. Admin Email Configuration

To configure admin access:

1. Edit the migration file
2. Replace `admin@example.com` with your admin email
3. Re-run the migration

## Edge Functions

Edge Functions will be set up for AI summary generation.

See `/supabase/functions/` directory for implementation.
