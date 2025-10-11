-- DogHealthy Database - Complete Migration Script
-- Run this file in Supabase SQL Editor to create all tables at once
-- This will execute all migrations in the correct order

-- ============================================
-- Migration 01: Create Users Table
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_doghealthy_users_email ON public.doghealthy_users(email);
ALTER TABLE public.doghealthy_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.doghealthy_users;
CREATE POLICY "Users can view their own profile" ON public.doghealthy_users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.doghealthy_users;
CREATE POLICY "Users can update their own profile" ON public.doghealthy_users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.doghealthy_users;
CREATE POLICY "Users can insert their own profile" ON public.doghealthy_users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_doghealthy_users_updated_at ON public.doghealthy_users;
CREATE TRIGGER update_doghealthy_users_updated_at
    BEFORE UPDATE ON public.doghealthy_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 02: Create Dogs Table
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_doghealthy_dogs_user_id ON public.doghealthy_dogs(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_dogs_is_active ON public.doghealthy_dogs(is_active);
ALTER TABLE public.doghealthy_dogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own dogs" ON public.doghealthy_dogs;
CREATE POLICY "Users can view their own dogs" ON public.doghealthy_dogs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own dogs" ON public.doghealthy_dogs;
CREATE POLICY "Users can insert their own dogs" ON public.doghealthy_dogs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own dogs" ON public.doghealthy_dogs;
CREATE POLICY "Users can update their own dogs" ON public.doghealthy_dogs FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own dogs" ON public.doghealthy_dogs;
CREATE POLICY "Users can delete their own dogs" ON public.doghealthy_dogs FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_doghealthy_dogs_updated_at ON public.doghealthy_dogs;
CREATE TRIGGER update_doghealthy_dogs_updated_at
    BEFORE UPDATE ON public.doghealthy_dogs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 03: Create Health Records Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.doghealthy_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis TEXT,
    treatment TEXT,
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    cost DECIMAL(10, 2),
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_doghealthy_health_records_dog_id ON public.doghealthy_health_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_health_records_record_date ON public.doghealthy_health_records(record_date);
CREATE INDEX IF NOT EXISTS idx_doghealthy_health_records_record_type ON public.doghealthy_health_records(record_type);
ALTER TABLE public.doghealthy_health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view health records for their dogs" ON public.doghealthy_health_records;
CREATE POLICY "Users can view health records for their dogs" ON public.doghealthy_health_records FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert health records for their dogs" ON public.doghealthy_health_records;
CREATE POLICY "Users can insert health records for their dogs" ON public.doghealthy_health_records FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update health records for their dogs" ON public.doghealthy_health_records;
CREATE POLICY "Users can update health records for their dogs" ON public.doghealthy_health_records FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete health records for their dogs" ON public.doghealthy_health_records;
CREATE POLICY "Users can delete health records for their dogs" ON public.doghealthy_health_records FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_health_records.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_doghealthy_health_records_updated_at ON public.doghealthy_health_records;
CREATE TRIGGER update_doghealthy_health_records_updated_at
    BEFORE UPDATE ON public.doghealthy_health_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 04: Create Vaccinations Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.doghealthy_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_type VARCHAR(100),
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

CREATE INDEX IF NOT EXISTS idx_doghealthy_vaccinations_dog_id ON public.doghealthy_vaccinations(dog_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_vaccinations_next_due_date ON public.doghealthy_vaccinations(next_due_date);
CREATE INDEX IF NOT EXISTS idx_doghealthy_vaccinations_vaccine_type ON public.doghealthy_vaccinations(vaccine_type);
ALTER TABLE public.doghealthy_vaccinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view vaccinations for their dogs" ON public.doghealthy_vaccinations;
CREATE POLICY "Users can view vaccinations for their dogs" ON public.doghealthy_vaccinations FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert vaccinations for their dogs" ON public.doghealthy_vaccinations;
CREATE POLICY "Users can insert vaccinations for their dogs" ON public.doghealthy_vaccinations FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update vaccinations for their dogs" ON public.doghealthy_vaccinations;
CREATE POLICY "Users can update vaccinations for their dogs" ON public.doghealthy_vaccinations FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete vaccinations for their dogs" ON public.doghealthy_vaccinations;
CREATE POLICY "Users can delete vaccinations for their dogs" ON public.doghealthy_vaccinations FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_vaccinations.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_doghealthy_vaccinations_updated_at ON public.doghealthy_vaccinations;
CREATE TRIGGER update_doghealthy_vaccinations_updated_at
    BEFORE UPDATE ON public.doghealthy_vaccinations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 05: Create Medications Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.doghealthy_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    prescribed_by VARCHAR(255),
    purpose TEXT,
    side_effects TEXT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_times JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_doghealthy_medications_dog_id ON public.doghealthy_medications(dog_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_medications_is_active ON public.doghealthy_medications(is_active);
CREATE INDEX IF NOT EXISTS idx_doghealthy_medications_end_date ON public.doghealthy_medications(end_date);
ALTER TABLE public.doghealthy_medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view medications for their dogs" ON public.doghealthy_medications;
CREATE POLICY "Users can view medications for their dogs" ON public.doghealthy_medications FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_medications.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert medications for their dogs" ON public.doghealthy_medications;
CREATE POLICY "Users can insert medications for their dogs" ON public.doghealthy_medications FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_medications.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update medications for their dogs" ON public.doghealthy_medications;
CREATE POLICY "Users can update medications for their dogs" ON public.doghealthy_medications FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_medications.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete medications for their dogs" ON public.doghealthy_medications;
CREATE POLICY "Users can delete medications for their dogs" ON public.doghealthy_medications FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_medications.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_doghealthy_medications_updated_at ON public.doghealthy_medications;
CREATE TRIGGER update_doghealthy_medications_updated_at
    BEFORE UPDATE ON public.doghealthy_medications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 06: Create Appointments Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.doghealthy_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    clinic_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_doghealthy_appointments_dog_id ON public.doghealthy_appointments(dog_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_appointments_appointment_date ON public.doghealthy_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_doghealthy_appointments_status ON public.doghealthy_appointments(status);
ALTER TABLE public.doghealthy_appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view appointments for their dogs" ON public.doghealthy_appointments;
CREATE POLICY "Users can view appointments for their dogs" ON public.doghealthy_appointments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert appointments for their dogs" ON public.doghealthy_appointments;
CREATE POLICY "Users can insert appointments for their dogs" ON public.doghealthy_appointments FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update appointments for their dogs" ON public.doghealthy_appointments;
CREATE POLICY "Users can update appointments for their dogs" ON public.doghealthy_appointments FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete appointments for their dogs" ON public.doghealthy_appointments;
CREATE POLICY "Users can delete appointments for their dogs" ON public.doghealthy_appointments FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_appointments.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_doghealthy_appointments_updated_at ON public.doghealthy_appointments;
CREATE TRIGGER update_doghealthy_appointments_updated_at
    BEFORE UPDATE ON public.doghealthy_appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 07: Create Weight Logs Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.doghealthy_weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5, 2) NOT NULL,
    measurement_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_doghealthy_weight_logs_dog_id ON public.doghealthy_weight_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_weight_logs_measurement_date ON public.doghealthy_weight_logs(measurement_date);
ALTER TABLE public.doghealthy_weight_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view weight logs for their dogs" ON public.doghealthy_weight_logs;
CREATE POLICY "Users can view weight logs for their dogs" ON public.doghealthy_weight_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_weight_logs.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert weight logs for their dogs" ON public.doghealthy_weight_logs;
CREATE POLICY "Users can insert weight logs for their dogs" ON public.doghealthy_weight_logs FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_weight_logs.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update weight logs for their dogs" ON public.doghealthy_weight_logs;
CREATE POLICY "Users can update weight logs for their dogs" ON public.doghealthy_weight_logs FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_weight_logs.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete weight logs for their dogs" ON public.doghealthy_weight_logs;
CREATE POLICY "Users can delete weight logs for their dogs" ON public.doghealthy_weight_logs FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.doghealthy_dogs WHERE doghealthy_dogs.id = doghealthy_weight_logs.dog_id AND doghealthy_dogs.user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_doghealthy_weight_logs_updated_at ON public.doghealthy_weight_logs;
CREATE TRIGGER update_doghealthy_weight_logs_updated_at
    BEFORE UPDATE ON public.doghealthy_weight_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 08: Create Vets Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.doghealthy_vets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_doghealthy_vets_user_id ON public.doghealthy_vets(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_vets_is_primary ON public.doghealthy_vets(is_primary);
ALTER TABLE public.doghealthy_vets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own vets" ON public.doghealthy_vets;
CREATE POLICY "Users can view their own vets" ON public.doghealthy_vets FOR SELECT 
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own vets" ON public.doghealthy_vets;
CREATE POLICY "Users can insert their own vets" ON public.doghealthy_vets FOR INSERT 
    WITH CHECK (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own vets" ON public.doghealthy_vets;
CREATE POLICY "Users can update their own vets" ON public.doghealthy_vets FOR UPDATE 
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own vets" ON public.doghealthy_vets;
CREATE POLICY "Users can delete their own vets" ON public.doghealthy_vets FOR DELETE 
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

CREATE OR REPLACE FUNCTION update_doghealthy_vets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_doghealthy_vets_updated_at ON public.doghealthy_vets;
CREATE TRIGGER update_doghealthy_vets_updated_at
    BEFORE UPDATE ON public.doghealthy_vets
    FOR EACH ROW
    EXECUTE FUNCTION update_doghealthy_vets_updated_at();

-- ============================================
-- Migration 09: Update Tables for Vet Linking
-- ============================================

-- Update health_records table
ALTER TABLE public.doghealthy_health_records 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visit_date DATE;

UPDATE public.doghealthy_health_records 
SET visit_date = record_date 
WHERE visit_date IS NULL AND record_date IS NOT NULL;

UPDATE public.doghealthy_health_records hr
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE hr.dog_id = d.id AND hr.user_id IS NULL;

ALTER TABLE public.doghealthy_health_records 
ALTER COLUMN user_id SET NOT NULL;

-- Update vaccinations table
ALTER TABLE public.doghealthy_vaccinations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS administered_date DATE;

UPDATE public.doghealthy_vaccinations 
SET administered_date = vaccination_date 
WHERE administered_date IS NULL AND vaccination_date IS NOT NULL;

UPDATE public.doghealthy_vaccinations v
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE v.dog_id = d.id AND v.user_id IS NULL;

ALTER TABLE public.doghealthy_vaccinations 
ALTER COLUMN user_id SET NOT NULL;

-- Update medications table
ALTER TABLE public.doghealthy_medications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE public.doghealthy_medications m
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE m.dog_id = d.id AND m.user_id IS NULL;

ALTER TABLE public.doghealthy_medications 
ALTER COLUMN user_id SET NOT NULL;

-- Update appointments table
ALTER TABLE public.doghealthy_appointments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES public.doghealthy_vets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS purpose TEXT;

UPDATE public.doghealthy_appointments 
SET purpose = appointment_type 
WHERE purpose IS NULL AND appointment_type IS NOT NULL;

UPDATE public.doghealthy_appointments a
SET user_id = d.user_id
FROM public.doghealthy_dogs d
WHERE a.dog_id = d.id AND a.user_id IS NULL;

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

-- ============================================
-- Migration 10: Add Missing Notes Columns
-- ============================================

-- Add notes column to health_records table if it doesn't exist
ALTER TABLE public.doghealthy_health_records 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Also make sure medications table has notes column
ALTER TABLE public.doghealthy_medications 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- Migration Complete!
-- ============================================
-- All tables created successfully with RLS policies and triggers

