-- Create appointments table
CREATE TABLE IF NOT EXISTS public.doghealthy_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_type VARCHAR(100) NOT NULL, -- checkup, grooming, training, surgery, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    clinic_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
    reminder_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_doghealthy_appointments_dog_id ON public.doghealthy_appointments(dog_id);
CREATE INDEX idx_doghealthy_appointments_appointment_date ON public.doghealthy_appointments(appointment_date);
CREATE INDEX idx_doghealthy_appointments_status ON public.doghealthy_appointments(status);

-- Enable Row Level Security
ALTER TABLE public.doghealthy_appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view appointments for their dogs"
    ON public.doghealthy_appointments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert appointments for their dogs"
    ON public.doghealthy_appointments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update appointments for their dogs"
    ON public.doghealthy_appointments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete appointments for their dogs"
    ON public.doghealthy_appointments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.doghealthy_dogs
            WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id
            AND doghealthy_dogs.user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_doghealthy_appointments_updated_at
    BEFORE UPDATE ON public.doghealthy_appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

