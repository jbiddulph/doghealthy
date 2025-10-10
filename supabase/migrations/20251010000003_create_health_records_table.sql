-- Create health records table
CREATE TABLE IF NOT EXISTS public.doghealthy_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_type VARCHAR(50) NOT NULL, -- checkup, illness, injury, surgery, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis TEXT,
    treatment TEXT,
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    cost DECIMAL(10, 2),
    attachments JSONB, -- Store file URLs or metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_doghealthy_health_records_dog_id ON public.doghealthy_health_records(dog_id);
CREATE INDEX idx_doghealthy_health_records_record_date ON public.doghealthy_health_records(record_date);
CREATE INDEX idx_doghealthy_health_records_record_type ON public.doghealthy_health_records(record_type);

-- Enable Row Level Security
ALTER TABLE public.doghealthy_health_records ENABLE ROW LEVEL SECURITY;

-- Create policies (users can manage records for their own dogs)
CREATE POLICY "Users can view health records for their dogs"
    ON public.doghealthy_health_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert health records for their dogs"
    ON public.doghealthy_health_records
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update health records for their dogs"
    ON public.doghealthy_health_records
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete health records for their dogs"
    ON public.doghealthy_health_records
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_doghealthy_health_records_updated_at
    BEFORE UPDATE ON public.doghealthy_health_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

