-- Create vaccinations table
CREATE TABLE IF NOT EXISTS public.doghealthy_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_type VARCHAR(100), -- rabies, distemper, parvovirus, etc.
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    batch_number VARCHAR(100),
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_doghealthy_vaccinations_dog_id ON public.doghealthy_vaccinations(dog_id);
CREATE INDEX idx_doghealthy_vaccinations_next_due_date ON public.doghealthy_vaccinations(next_due_date);
CREATE INDEX idx_doghealthy_vaccinations_vaccine_type ON public.doghealthy_vaccinations(vaccine_type);

-- Enable Row Level Security
ALTER TABLE public.doghealthy_vaccinations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view vaccinations for their dogs"
    ON public.doghealthy_vaccinations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vaccinations for their dogs"
    ON public.doghealthy_vaccinations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update vaccinations for their dogs"
    ON public.doghealthy_vaccinations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete vaccinations for their dogs"
    ON public.doghealthy_vaccinations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_doghealthy_vaccinations_updated_at
    BEFORE UPDATE ON public.doghealthy_vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

