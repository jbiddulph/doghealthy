# Supabase Setup Guide for DogHealthy

## Overview

Your Nuxt app is now configured with a complete Supabase database schema using the `doghealthy_` prefix for all tables [[memory:8657705]].

## Created SQL Migrations

The following migration files have been created in `supabase/migrations/`:

1. **20251010000001_create_users_table.sql** - User accounts
2. **20251010000002_create_dogs_table.sql** - Dog profiles
3. **20251010000003_create_health_records_table.sql** - Medical records
4. **20251010000004_create_vaccinations_table.sql** - Vaccination tracking
5. **20251010000005_create_medications_table.sql** - Medication management
6. **20251010000006_create_appointments_table.sql** - Appointment scheduling
7. **20251010000007_create_weight_logs_table.sql** - Weight tracking

## Quick Start

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your database to be provisioned
3. Go to **Project Settings** > **Database** to get your connection string
4. Go to **Project Settings** > **API** to get your API keys

### Step 2: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Database Connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Client
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_KEY="[YOUR-ANON-KEY]"
```

### Step 3: Run Database Migrations

#### Option A: All at Once (Recommended)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/run-all-migrations.sql`
5. Click **Run**

#### Option B: Individual Files

Run each migration file in order (01 through 07) in the SQL Editor.

### Step 4: Generate Prisma Client

After running the migrations:

```bash
# Generate Prisma client
npx prisma generate

# Optionally verify by pulling schema
npx prisma db pull
```

## Database Schema

### Tables Created

All tables use the `doghealthy_` prefix:

| Table Name | Purpose |
|-----------|---------|
| `doghealthy_users` | User accounts (linked to Supabase Auth) |
| `doghealthy_dogs` | Dog profiles owned by users |
| `doghealthy_health_records` | Medical history and health records |
| `doghealthy_vaccinations` | Vaccination records and due dates |
| `doghealthy_medications` | Current and past medications |
| `doghealthy_appointments` | Veterinary and grooming appointments |
| `doghealthy_weight_logs` | Weight tracking over time |

### Security Features

✅ **Row Level Security (RLS)** enabled on all tables  
✅ Users can only access their own data  
✅ Automatic timestamp management (`created_at`, `updated_at`)  
✅ Cascading deletes to maintain data integrity  
✅ Indexed columns for optimal query performance  

### Relationships

```
doghealthy_users
    └── doghealthy_dogs (one-to-many)
            ├── doghealthy_health_records (one-to-many)
            ├── doghealthy_vaccinations (one-to-many)
            ├── doghealthy_medications (one-to-many)
            ├── doghealthy_appointments (one-to-many)
            └── doghealthy_weight_logs (one-to-many)
```

## Using the Database

### With Prisma (Recommended)

```typescript
import { usePrisma } from '~/composables/usePrisma'

const prisma = usePrisma()

// Create a dog
const dog = await prisma.dog.create({
  data: {
    userId: user.id,
    name: 'Buddy',
    breed: 'Golden Retriever',
    birthDate: new Date('2020-01-15'),
    weightKg: 30.5
  }
})

// Get all dogs for a user
const dogs = await prisma.dog.findMany({
  where: {
    userId: user.id,
    isActive: true
  },
  include: {
    healthRecords: true,
    vaccinations: true
  }
})
```

### With Supabase Client

If you want to use the Supabase client directly:

```bash
npm install @supabase/supabase-js
```

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

// Query with automatic RLS
const { data: dogs, error } = await supabase
  .from('doghealthy_dogs')
  .select('*')
  .eq('is_active', true)
```

## Verification

After running migrations, verify in Supabase Dashboard:

1. Go to **Database** > **Tables**
2. You should see all 7 `doghealthy_*` tables
3. Click on each table to see the structure
4. Go to **Authentication** > **Policies** to see RLS policies

## Next Steps

1. ✅ Migrations created
2. ✅ Prisma schema configured
3. ⏭️ Run migrations in Supabase
4. ⏭️ Generate Prisma client
5. ⏭️ Set up Supabase Auth
6. ⏭️ Build your app!

## Troubleshooting

### "relation already exists" error
- Some tables already exist. Use `DROP TABLE` or the `run-all-migrations.sql` which uses `IF NOT EXISTS`

### RLS policies blocking queries
- Make sure users are authenticated via Supabase Auth
- Check that `auth.uid()` matches the user ID in your tables

### Prisma not finding tables
- Verify `DATABASE_URL` in `.env`
- Run `npx prisma db pull` to sync schema
- Run `npx prisma generate` to regenerate client

## Support

- See [supabase/migrations/README.md](./supabase/migrations/README.md) for detailed migration instructions
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

