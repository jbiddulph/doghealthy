# DogHealthy Database Migrations

This directory contains SQL migration files for the DogHealthy application using Supabase (PostgreSQL).

## Table Prefix

All tables are prefixed with `doghealthy_` to maintain namespace organization.

## Database Schema Overview

### Tables

1. **doghealthy_users** - User accounts
2. **doghealthy_dogs** - Dog profiles owned by users
3. **doghealthy_health_records** - Medical history and health records
4. **doghealthy_vaccinations** - Vaccination records and schedules
5. **doghealthy_medications** - Current and past medications
6. **doghealthy_appointments** - Veterinary and grooming appointments
7. **doghealthy_weight_logs** - Weight tracking over time

## Features

### Security
- **Row Level Security (RLS)** enabled on all tables
- Users can only access data for their own dogs
- Automatic user authentication via Supabase Auth

### Automatic Timestamps
- All tables have `created_at` and `updated_at` columns
- Automatic trigger updates `updated_at` on row changes

### Cascading Deletes
- Deleting a user removes all their dogs and related data
- Deleting a dog removes all related health records, vaccinations, etc.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Log in to your Supabase project
2. Go to **SQL Editor**
3. Run the migration files in order (numbered from 01 to 07)

### Option 2: Supabase CLI

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Initialize Supabase in your project (if not done)
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or run individual migration files
psql $DATABASE_URL -f supabase/migrations/20251010000001_create_users_table.sql
```

### Option 3: Direct SQL Execution

Connect to your Supabase PostgreSQL database and execute the migration files in order:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/20251010000001_create_users_table.sql
```

## Migration Order

Execute migrations in this exact order:

1. `20251010000001_create_users_table.sql` - Base users table with RLS
2. `20251010000002_create_dogs_table.sql` - Dogs table with user relationship
3. `20251010000003_create_health_records_table.sql` - Health records
4. `20251010000004_create_vaccinations_table.sql` - Vaccination tracking
5. `20251010000005_create_medications_table.sql` - Medication management
6. `20251010000006_create_appointments_table.sql` - Appointment scheduling
7. `20251010000007_create_weight_logs_table.sql` - Weight tracking

## After Running Migrations

### 1. Generate Prisma Client

After running the SQL migrations, generate the Prisma client to sync with your schema:

```bash
npx prisma db pull  # Pull the schema from database (optional)
npx prisma generate # Generate Prisma client
```

### 2. Verify Tables

Check that all tables were created successfully:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'doghealthy_%'
ORDER BY table_name;
```

### 3. Test RLS Policies

Verify that Row Level Security is working:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'doghealthy_%';
```

## Connection String Format

Your `.env` file should contain:

```bash
# Direct connection to database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# For Supabase client (if using @supabase/supabase-js)
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_KEY="[YOUR-ANON-KEY]"
```

## Additional Notes

### User ID Mapping

The `doghealthy_users` table uses UUIDs that match Supabase Auth user IDs. When a user signs up through Supabase Auth:

1. Supabase creates an auth.users record
2. Your application creates a matching doghealthy_users record with the same ID
3. RLS policies use `auth.uid()` to match the authenticated user

### JSON Fields

Some tables use JSONB columns for flexible data:

- `doghealthy_health_records.attachments` - Store file URLs and metadata
- `doghealthy_medications.reminder_times` - Array of reminder times

Example JSONB structure:

```json
// attachments
{
  "files": [
    {
      "url": "https://...",
      "name": "x-ray.jpg",
      "type": "image/jpeg"
    }
  ]
}

// reminder_times
{
  "times": ["08:00", "20:00"]
}
```

## Rollback

To rollback (remove all tables), execute in reverse order:

```sql
DROP TABLE IF EXISTS public.doghealthy_weight_logs CASCADE;
DROP TABLE IF EXISTS public.doghealthy_appointments CASCADE;
DROP TABLE IF EXISTS public.doghealthy_medications CASCADE;
DROP TABLE IF EXISTS public.doghealthy_vaccinations CASCADE;
DROP TABLE IF EXISTS public.doghealthy_health_records CASCADE;
DROP TABLE IF EXISTS public.doghealthy_dogs CASCADE;
DROP TABLE IF EXISTS public.doghealthy_users CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
```

## Support

For issues with migrations, check:
- Supabase Dashboard > Database > Tables
- Supabase Dashboard > Database > Roles (ensure proper permissions)
- Supabase Dashboard > Authentication (for RLS testing)

