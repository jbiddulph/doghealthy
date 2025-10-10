-- Create medications table
CREATE TABLE IF NOT EXISTS public.doghealthy_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100), -- daily, twice daily, weekly, etc.
    start_date DATE NOT NULL,
    end_date DATE,
    prescribed_by VARCHAR(255),
    purpose TEXT,
    side_effects TEXT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_times JSONB, -- Array of times to send reminders
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_doghealthy_medications_dog_id ON public.doghealthy_medications(dog_id);
CREATE INDEX idx_doghealthy_medications_is_active ON public.doghealthy_medications(is_active);
CREATE INDEX idx_doghealthy_medications_end_date ON public.doghealthy_medications(end_date);

-- Enable Row Level Security
ALTER TABLE public.doghealthy_medications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view medications for their dogs"
    ON public.doghealthy_medications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_medications.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert medications for their dogs"
    ON public.doghealthy_medications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_medications.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update medications for their dogs"
    ON public.doghealthy_medications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_medications.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete medications for their dogs"
    ON public.doghealthy_medications
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_medications.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_doghealthy_medications_updated_at
    BEFORE UPDATE ON public.doghealthy_medications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

