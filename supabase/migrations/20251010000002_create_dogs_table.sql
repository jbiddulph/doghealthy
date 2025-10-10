-- Create dogs table
CREATE TABLE IF NOT EXISTS public.doghealthy_dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255),
    gender VARCHAR(20),
    birth_date DATE,
    weight_kg DECIMAL(5, 2),
    color VARCHAR(100),
    microchip_number VARCHAR(50),
    photo_url TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_doghealthy_dogs_user_id ON public.doghealthy_dogs(user_id);
CREATE INDEX idx_doghealthy_dogs_is_active ON public.doghealthy_dogs(is_active);

-- Enable Row Level Security
ALTER TABLE public.doghealthy_dogs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own dogs"
    ON public.doghealthy_dogs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dogs"
    ON public.doghealthy_dogs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dogs"
    ON public.doghealthy_dogs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dogs"
    ON public.doghealthy_dogs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_doghealthy_dogs_updated_at
    BEFORE UPDATE ON public.doghealthy_dogs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

