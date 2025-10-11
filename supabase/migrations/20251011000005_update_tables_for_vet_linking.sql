-- Update health_records table to add vet_id and user_id
ALTER TABLE public.doghealthy_health_records 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visit_date DATE;

-- Migrate data from record_date to visit_date if needed
UPDATE public.doghealthy_health_records 
SET visit_date = record_date 
WHERE visit_date IS NULL AND record_date IS NOT NULL;

-- Populate user_id from dog_id relationship
UPDATE public.doghealthy_health_records hr
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE hr.dog_id = d.id AND hr.user_id IS NULL;

-- Make user_id NOT NULL after populating
ALTER TABLE public.doghealthy_health_records 
ALTER COLUMN user_id SET NOT NULL;

-- Update vaccinations table to add user_id and vet_id
ALTER TABLE public.doghealthy_vaccinations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);

-- Populate user_id from dog_id relationship
UPDATE public.doghealthy_vaccinations v
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE v.dog_id = d.id AND v.user_id IS NULL;

-- Make user_id NOT NULL after populating
ALTER TABLE public.doghealthy_vaccinations 
ALTER COLUMN user_id SET NOT NULL;

-- Update medications table to add user_id and vet_id
ALTER TABLE public.doghealthy_medications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL;

-- Populate user_id from dog_id relationship
UPDATE public.doghealthy_medications m
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE m.dog_id = d.id AND m.user_id IS NULL;

-- Make user_id NOT NULL after populating
ALTER TABLE public.doghealthy_medications 
ALTER COLUMN user_id SET NOT NULL;

-- Update appointments table to add user_id, vet_id, and purpose field
ALTER TABLE public.doghealthy_appointments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Migrate data from appointment_type to purpose if needed
UPDATE public.doghealthy_appointments 
SET purpose = appointment_type 
WHERE purpose IS NULL AND appointment_type IS NOT NULL;

-- Populate user_id from dog_id relationship
UPDATE public.doghealthy_appointments a
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE a.dog_id = d.id AND a.user_id IS NULL;

-- Make user_id NOT NULL after populating
ALTER TABLE public.doghealthy_appointments 
ALTER COLUMN user_id SET NOT NULL;

-- Create indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_doghealthy_health_records_vet_id ON public.doghealthy_health_records(vet_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_health_records_user_id ON public.doghealthy_health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_vaccinations_vet_id ON public.doghealthy_vaccinations(vet_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_vaccinations_user_id ON public.doghealthy_vaccinations(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_medications_vet_id ON public.doghealthy_medications(vet_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_medications_user_id ON public.doghealthy_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_appointments_vet_id ON public.doghealthy_appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_appointments_user_id ON public.doghealthy_appointments(user_id);

