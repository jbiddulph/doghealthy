-- Create users table
CREATE TABLE IF NOT EXISTS public.doghealthy_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on email for faster lookups
CREATE INDEX idx_doghealthy_users_email ON public.doghealthy_users(email);

-- Enable Row Level Security
ALTER TABLE public.doghealthy_users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view their own profile"
    ON public.doghealthy_users
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own profile"
    ON public.doghealthy_users
    FOR UPDATE
    USING (auth.uid() = id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert their own profile"
    ON public.doghealthy_users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_doghealthy_users_updated_at
    BEFORE UPDATE ON public.doghealthy_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

