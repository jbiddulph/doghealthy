# DogHealthy - Nuxt App

A modern Nuxt 4 application with Tailwind CSS, Pinia state management, and Prisma ORM.

## Tech Stack

- **Nuxt 4** - Vue.js framework
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Prisma** - Database ORM
- **Supabase** - Backend as a Service (PostgreSQL)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# Database - Get from Supabase Dashboard > Project Settings > Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase - Get from Supabase Dashboard > Project Settings > API
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_KEY="[YOUR-ANON-KEY]"
```

### 3. Database Setup

**Important**: All database tables must be prefixed with `doghealthy_`

#### Run SQL Migrations on Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Execute the migration files in the `supabase/migrations/` directory in order (01 through 07)
4. Or use the Supabase CLI: `supabase db push`

See [supabase/migrations/README.md](./supabase/migrations/README.md) for detailed instructions.

#### Generate Prisma Client

After running the SQL migrations:

```bash
# Generate Prisma Client
npx prisma generate

# (Optional) Pull schema from database to verify
npx prisma db pull
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Project Structure

```
├── app/                    # App directory
│   └── app.vue            # Main app component
├── pages/                 # File-based routing
│   ├── index.vue         # Home page
│   └── auth/             # Authentication pages
│       └── login.vue
├── components/           # Vue components
├── composables/          # Composable functions
│   └── usePrisma.ts     # Prisma client composable
├── stores/               # Pinia stores
│   └── example.ts       # Example store
├── prisma/
│   └── schema.prisma    # Database schema
├── supabase/
│   └── migrations/      # SQL migration files
└── nuxt.config.ts       # Nuxt configuration
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Database Tables

All database tables are prefixed with `doghealthy_`:

- `doghealthy_users` - User accounts
- `doghealthy_dogs` - Dog profiles
- `doghealthy_health_records` - Medical records
- `doghealthy_vaccinations` - Vaccination tracking
- `doghealthy_medications` - Medication management
- `doghealthy_appointments` - Appointment scheduling
- `doghealthy_weight_logs` - Weight tracking

The Prisma schema automatically maps to these table names:

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique
  name  String?
  
  @@map("doghealthy_users")
}
```

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Automatic authentication via Supabase Auth
- Cascading deletes to maintain data integrity

## Additional Resources

- [Nuxt Documentation](https://nuxt.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
