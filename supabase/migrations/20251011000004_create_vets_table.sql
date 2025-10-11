-- Create vets table
CREATE TABLE IF NOT EXISTS doghealthy_vets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES doghealthy_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    clinic_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    website VARCHAR(500),
    notes TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX idx_doghealthy_vets_user_id ON doghealthy_vets(user_id);

-- Create index on is_primary for faster primary vet lookups
CREATE INDEX idx_doghealthy_vets_is_primary ON doghealthy_vets(is_primary);

-- Enable Row Level Security
ALTER TABLE doghealthy_vets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own vets
CREATE POLICY "Users can view their own vets"
    ON doghealthy_vets FOR SELECT
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

-- Create policy to allow users to insert their own vets
CREATE POLICY "Users can insert their own vets"
    ON doghealthy_vets FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

-- Create policy to allow users to update their own vets
CREATE POLICY "Users can update their own vets"
    ON doghealthy_vets FOR UPDATE
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

-- Create policy to allow users to delete their own vets
CREATE POLICY "Users can delete their own vets"
    ON doghealthy_vets FOR DELETE
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_doghealthy_vets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_doghealthy_vets_updated_at
    BEFORE UPDATE ON doghealthy_vets
    FOR EACH ROW
    EXECUTE FUNCTION update_doghealthy_vets_updated_at();

