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
-- Migration 08: Create Dog Food Products Table
-- ============================================

-- Create dog food products table
CREATE TABLE IF NOT EXISTS public.doghealthy_dog_food_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Food characteristics
    food_type VARCHAR(50), -- 'dry', 'wet', 'raw', 'freeze-dried'
    breed_size VARCHAR(50), -- 'small', 'medium', 'large', 'all'
    life_stage VARCHAR(50), -- 'puppy', 'adult', 'senior', 'all'
    special_diet VARCHAR(100), -- 'grain-free', 'hypoallergenic', 'weight-management', etc.
    
    -- Nutrition (per 100g)
    protein_percent DECIMAL(5, 2),
    fat_percent DECIMAL(5, 2),
    fiber_percent DECIMAL(5, 2),
    calories_per_100g INTEGER,
    
    -- Main ingredients (top 5)
    main_ingredients TEXT[], -- Array of strings
    
    -- Pricing
    price_gbp DECIMAL(10, 2),
    price_per_kg DECIMAL(10, 2),
    package_size_kg DECIMAL(10, 2),
    
    -- Affiliate & Links
    affiliate_link TEXT NOT NULL,
    retailer VARCHAR(100), -- 'amazon', 'pets-at-home', 'zooplus', etc.
    product_url TEXT,
    
    -- Ratings & Reviews
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Features & Badges
    is_editors_choice BOOLEAN DEFAULT false,
    is_best_value BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_grain_free BOOLEAN DEFAULT false,
    is_natural BOOLEAN DEFAULT false,
    
    -- SEO & Organization
    slug VARCHAR(255) UNIQUE,
    tags TEXT[], -- Array of searchable tags
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    stock_status VARCHAR(50) DEFAULT 'in-stock', -- 'in-stock', 'low-stock', 'out-of-stock'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_doghealthy_food_brand ON public.doghealthy_dog_food_products(brand);
CREATE INDEX IF NOT EXISTS idx_doghealthy_food_type ON public.doghealthy_dog_food_products(food_type);
CREATE INDEX IF NOT EXISTS idx_doghealthy_food_breed_size ON public.doghealthy_dog_food_products(breed_size);
CREATE INDEX IF NOT EXISTS idx_doghealthy_food_price ON public.doghealthy_dog_food_products(price_gbp);
CREATE INDEX IF NOT EXISTS idx_doghealthy_food_rating ON public.doghealthy_dog_food_products(avg_rating);
CREATE INDEX IF NOT EXISTS idx_doghealthy_food_slug ON public.doghealthy_dog_food_products(slug);
CREATE INDEX IF NOT EXISTS idx_doghealthy_food_is_active ON public.doghealthy_dog_food_products(is_active);

-- Enable RLS (public read access)
ALTER TABLE public.doghealthy_dog_food_products ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (everyone can view products)
DROP POLICY IF EXISTS "Anyone can view active dog food products" ON public.doghealthy_dog_food_products;
CREATE POLICY "Anyone can view active dog food products"
    ON public.doghealthy_dog_food_products
    FOR SELECT
    USING (is_active = true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_doghealthy_food_updated_at ON public.doghealthy_dog_food_products;
CREATE TRIGGER update_doghealthy_food_updated_at
    BEFORE UPDATE ON public.doghealthy_dog_food_products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 09: Create Classifieds Tables (2025-01-15)
-- ============================================

-- Breeding listings table
CREATE TABLE IF NOT EXISTS public.doghealthy_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
    dog_id UUID REFERENCES public.doghealthy_dogs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    breed VARCHAR(255),
    price_gbp DECIMAL(10,2),
    location VARCHAR(255),
    age_weeks INT,
    gender VARCHAR(20),
    images JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    view_count INT DEFAULT 0,
    stripe_payment_id VARCHAR(255),
    featured_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Real-time chat messages
CREATE TABLE IF NOT EXISTS public.doghealthy_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.doghealthy_listings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notification preferences & reminders
CREATE TABLE IF NOT EXISTS public.doghealthy_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'appointment', 'medication', 'message'
    reference_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_doghealthy_listings_user_id ON public.doghealthy_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_listings_status ON public.doghealthy_listings(status);
CREATE INDEX IF NOT EXISTS idx_doghealthy_listings_breed ON public.doghealthy_listings(breed);
CREATE INDEX IF NOT EXISTS idx_doghealthy_listings_location ON public.doghealthy_listings(location);
CREATE INDEX IF NOT EXISTS idx_doghealthy_listings_price ON public.doghealthy_listings(price_gbp);
CREATE INDEX IF NOT EXISTS idx_doghealthy_listings_featured ON public.doghealthy_listings(is_featured);
CREATE INDEX IF NOT EXISTS idx_doghealthy_listings_created_at ON public.doghealthy_listings(created_at);

CREATE INDEX IF NOT EXISTS idx_doghealthy_messages_listing_id ON public.doghealthy_messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_messages_sender_id ON public.doghealthy_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_messages_recipient_id ON public.doghealthy_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_messages_is_read ON public.doghealthy_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_doghealthy_messages_created_at ON public.doghealthy_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_doghealthy_notifications_user_id ON public.doghealthy_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_notifications_type ON public.doghealthy_notifications(type);
CREATE INDEX IF NOT EXISTS idx_doghealthy_notifications_is_read ON public.doghealthy_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_doghealthy_notifications_scheduled_for ON public.doghealthy_notifications(scheduled_for);

-- Enable Row Level Security
ALTER TABLE public.doghealthy_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doghealthy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doghealthy_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doghealthy_listings
DROP POLICY IF EXISTS "Users can view all active listings" ON public.doghealthy_listings;
CREATE POLICY "Users can view all active listings"
    ON public.doghealthy_listings FOR SELECT
    USING (status = 'active');

DROP POLICY IF EXISTS "Users can view their own listings" ON public.doghealthy_listings;
CREATE POLICY "Users can view their own listings"
    ON public.doghealthy_listings FOR SELECT
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own listings" ON public.doghealthy_listings;
CREATE POLICY "Users can insert their own listings"
    ON public.doghealthy_listings FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own listings" ON public.doghealthy_listings;
CREATE POLICY "Users can update their own listings"
    ON public.doghealthy_listings FOR UPDATE
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.doghealthy_listings;
CREATE POLICY "Users can delete their own listings"
    ON public.doghealthy_listings FOR DELETE
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

-- RLS Policies for doghealthy_messages
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.doghealthy_messages;
CREATE POLICY "Users can view messages they sent or received"
    ON public.doghealthy_messages FOR SELECT
    USING (sender_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()) 
           OR recipient_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert messages as sender" ON public.doghealthy_messages;
CREATE POLICY "Users can insert messages as sender"
    ON public.doghealthy_messages FOR INSERT
    WITH CHECK (sender_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own messages" ON public.doghealthy_messages;
CREATE POLICY "Users can update their own messages"
    ON public.doghealthy_messages FOR UPDATE
    USING (sender_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.doghealthy_messages;
CREATE POLICY "Users can delete their own messages"
    ON public.doghealthy_messages FOR DELETE
    USING (sender_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

-- RLS Policies for doghealthy_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.doghealthy_notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.doghealthy_notifications FOR SELECT
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.doghealthy_notifications;
CREATE POLICY "Users can insert their own notifications"
    ON public.doghealthy_notifications FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.doghealthy_notifications;
CREATE POLICY "Users can update their own notifications"
    ON public.doghealthy_notifications FOR UPDATE
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.doghealthy_notifications;
CREATE POLICY "Users can delete their own notifications"
    ON public.doghealthy_notifications FOR DELETE
    USING (user_id IN (SELECT id FROM public.doghealthy_users WHERE id = auth.uid()));

-- Create function to update updated_at timestamp for listings
CREATE OR REPLACE FUNCTION public.update_doghealthy_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for listings
DROP TRIGGER IF EXISTS update_doghealthy_listings_updated_at ON public.doghealthy_listings;
CREATE TRIGGER update_doghealthy_listings_updated_at
    BEFORE UPDATE ON public.doghealthy_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_doghealthy_listings_updated_at();

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.doghealthy_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doghealthy_notifications;

-- ============================================
-- Migration 10: Add Reminder Columns (2025-01-15)
-- ============================================

-- Add reminder_sent column to appointments table
ALTER TABLE public.doghealthy_appointments 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add reminder_sent column to vaccinations table
ALTER TABLE public.doghealthy_vaccinations 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add reminder_enabled column to medications table
ALTER TABLE public.doghealthy_medications 
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT TRUE;

-- Create indexes for reminder queries
CREATE INDEX IF NOT EXISTS idx_doghealthy_appointments_reminder_sent ON public.doghealthy_appointments(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_doghealthy_appointments_appointment_date ON public.doghealthy_appointments(appointment_date);

CREATE INDEX IF NOT EXISTS idx_doghealthy_vaccinations_reminder_sent ON public.doghealthy_vaccinations(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_doghealthy_vaccinations_next_due_date ON public.doghealthy_vaccinations(next_due_date);

CREATE INDEX IF NOT EXISTS idx_doghealthy_medications_reminder_enabled ON public.doghealthy_medications(reminder_enabled);
CREATE INDEX IF NOT EXISTS idx_doghealthy_medications_is_active ON public.doghealthy_medications(is_active);

-- -- ============================================
-- -- Migration 11: Add Amazon Dog Food Products
-- -- ============================================

-- -- Insert 50 Dog Food Products from Amazon UK with Affiliate Links
-- -- All products set to is_active = FALSE as requested

-- INSERT INTO public.doghealthy_dog_food_products (
--   name, brand, food_type, price_gbp, life_stage, breed_size, 
--   is_grain_free, protein_percent, fat_percent, description, 
--   affiliate_link, is_active
-- ) VALUES

-- -- Premium Dry Dog Foods
-- ('Purina Pro Plan Adult Medium Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 49.99, 'adult', 'medium', false, 27.0, 16.0, 
-- 'High-protein dry dog food with real chicken as the first ingredient. Enhanced with OPTIDIGEST for digestive health and immune support.', 
-- 'https://www.amazon.co.uk/dp/B0BQS8KXTJ?tag=doghealthy-21', false),

-- ('Pedigree Complete Adult Dry Dog Food Chicken & Vegetables 15kg', 'Pedigree', 'dry', 32.99, 'adult', 'all', false, 21.0, 10.0, 
-- 'Complete and balanced nutrition with omega 3 & 6 fatty acids, zinc and B vitamins for healthy skin and coat.', 
-- 'https://www.amazon.co.uk/dp/B01N6PNQJS?tag=doghealthy-21', false),

-- ('Royal Canin Medium Adult Dry Dog Food 15kg', 'Royal Canin', 'dry', 59.99, 'adult', 'medium', false, 25.0, 14.0, 
-- 'Tailored nutrition for medium breed dogs with natural defenses support and digestive health.', 
-- 'https://www.amazon.co.uk/dp/B07G8JZQ1X?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Adult Large Breed Chicken 15kg', 'Hills Science Plan', 'dry', 65.99, 'adult', 'large', false, 26.0, 15.0, 
-- 'Specifically formulated for large breed dogs with glucosamine and chondroitin for joint health.', 
-- 'https://www.amazon.co.uk/dp/B07H8ZQ2X1?tag=doghealthy-21', false),

-- ('IAMS Adult Large Breed Chicken 15kg', 'IAMS', 'dry', 42.99, 'adult', 'large', false, 24.0, 13.0, 
-- 'Complete nutrition for large breed dogs with 0% artificial preservatives, flavours or colours.', 
-- 'https://www.amazon.co.uk/dp/B07H9ZQ3X2?tag=doghealthy-21', false),

-- -- Grain-Free Options
-- ('Lily''s Kitchen Chicken & Duck Dry Dog Food 7kg', 'Lilys Kitchen', 'dry', 44.99, 'adult', 'all', true, 26.0, 15.0, 
-- 'Natural dry dog food made with free-range chicken and duck. Grain-free recipe with no artificial additives.', 
-- 'https://www.amazon.co.uk/dp/B0CW1T4X7H?tag=doghealthy-21', false),

-- ('Canagan Country Game Grain Free Adult 12kg', 'Canagan', 'dry', 52.99, 'adult', 'all', true, 28.0, 16.0, 
-- 'Grain-free dry dog food with 80% fresh meat and fish. Natural ingredients with no artificial preservatives.', 
-- 'https://www.amazon.co.uk/dp/B07HA0ZQ4X3?tag=doghealthy-21', false),

-- ('Acana Heritage Free-Run Poultry 11.4kg', 'Acana', 'dry', 68.99, 'adult', 'all', true, 30.0, 17.0, 
-- 'Biologically appropriate dog food with free-run chicken and turkey. Grain-free with regional ingredients.', 
-- 'https://www.amazon.co.uk/dp/B07HB1ZQ5X4?tag=doghealthy-21', false),

-- ('Orijen Original Freeze-Dried Raw 2.27kg', 'Orijen', 'dry', 89.99, 'adult', 'all', true, 38.0, 20.0, 
-- 'Freeze-dried raw dog food with 85% meat, organs and cartilage. Biologically appropriate and grain-free.', 
-- 'https://www.amazon.co.uk/dp/B07HC2ZQ6X5?tag=doghealthy-21', false),

-- ('Applaws Adult Large Breed Chicken 12kg', 'Applaws', 'dry', 39.99, 'adult', 'large', true, 25.0, 14.0, 
-- 'Natural dry dog food with 80% chicken. Grain-free recipe with no artificial additives or preservatives.', 
-- 'https://www.amazon.co.uk/dp/B07HD3ZQ7X6?tag=doghealthy-21', false),

-- -- Puppy Foods
-- ('Royal Canin Puppy Medium Dry Dog Food 8kg', 'Royal Canin', 'dry', 45.99, 'puppy', 'medium', false, 27.0, 16.0, 
-- 'Specially formulated for medium breed puppies with DHA for brain development and immune system support.', 
-- 'https://www.amazon.co.uk/dp/B07HE4ZQ8X7?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Puppy Chicken 7kg', 'Hills Science Plan', 'dry', 48.99, 'puppy', 'all', false, 28.0, 17.0, 
-- 'Complete nutrition for puppies with DHA from fish oil for brain and eye development.', 
-- 'https://www.amazon.co.uk/dp/B07HF5ZQ9X8?tag=doghealthy-21', false),

-- ('Purina Pro Plan Puppy Medium Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 52.99, 'puppy', 'medium', false, 29.0, 18.0, 
-- 'High-protein puppy food with OPTISTART for digestive health and immune system support.', 
-- 'https://www.amazon.co.uk/dp/B07HG6ZQ0X9?tag=doghealthy-21', false),

-- ('IAMS Puppy Large Breed Chicken 7kg', 'IAMS', 'dry', 35.99, 'puppy', 'large', false, 26.0, 15.0, 
-- 'Complete nutrition for large breed puppies with controlled calcium and phosphorus levels.', 
-- 'https://www.amazon.co.uk/dp/B07HH7ZQ1X0?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Puppy Chicken & Duck 3kg', 'Lilys Kitchen', 'dry', 28.99, 'puppy', 'all', true, 28.0, 16.0, 
-- 'Natural puppy food with free-range chicken and duck. Grain-free with added DHA for development.', 
-- 'https://www.amazon.co.uk/dp/B07HI8ZQ2X1?tag=doghealthy-21', false),

-- -- Senior Foods
-- ('Royal Canin Senior Consult 8kg', 'Royal Canin', 'dry', 42.99, 'senior', 'all', false, 24.0, 13.0, 
-- 'Specially formulated for senior dogs with joint support and easy-to-digest proteins.', 
-- 'https://www.amazon.co.uk/dp/B07HJ9ZQ3X2?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Mature Adult 7+ Chicken 7kg', 'Hills Science Plan', 'dry', 44.99, 'senior', 'all', false, 23.0, 12.0, 
-- 'Complete nutrition for senior dogs with antioxidants and easy-to-digest ingredients.', 
-- 'https://www.amazon.co.uk/dp/B07HK0ZQ4X3?tag=doghealthy-21', false),

-- ('Purina Pro Plan Senior 7+ Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 46.99, 'senior', 'all', false, 25.0, 14.0, 
-- 'High-quality senior dog food with glucosamine for joint health and immune system support.', 
-- 'https://www.amazon.co.uk/dp/B07HL1ZQ5X4?tag=doghealthy-21', false),

-- ('IAMS Senior Large Breed Chicken 7kg', 'IAMS', 'dry', 38.99, 'senior', 'large', false, 22.0, 11.0, 
-- 'Complete nutrition for senior large breed dogs with joint support and digestive health.', 
-- 'https://www.amazon.co.uk/dp/B07HM2ZQ6X5?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Senior Chicken & Duck 3kg', 'Lilys Kitchen', 'dry', 26.99, 'senior', 'all', true, 24.0, 13.0, 
-- 'Natural senior dog food with free-range chicken and duck. Grain-free with joint support.', 
-- 'https://www.amazon.co.uk/dp/B07HN3ZQ7X6?tag=doghealthy-21', false),

-- -- Small Breed Foods
-- ('Royal Canin Mini Adult Dry Dog Food 4kg', 'Royal Canin', 'dry', 32.99, 'adult', 'small', false, 26.0, 15.0, 
-- 'Specially designed for small breed dogs with highly digestible proteins and precise nutrition.', 
-- 'https://www.amazon.co.uk/dp/B07HO4ZQ8X7?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Small & Mini Adult Chicken 4kg', 'Hills Science Plan', 'dry', 35.99, 'adult', 'small', false, 27.0, 16.0, 
-- 'Complete nutrition for small and mini breed dogs with antioxidants for immune health.', 
-- 'https://www.amazon.co.uk/dp/B07HP5ZQ9X8?tag=doghealthy-21', false),

-- ('Purina Pro Plan Small & Mini Adult Chicken 7kg', 'Purina Pro Plan', 'dry', 38.99, 'adult', 'small', false, 28.0, 17.0, 
-- 'High-protein food for small breed dogs with OPTIDIGEST for digestive health.', 
-- 'https://www.amazon.co.uk/dp/B07HQ6ZQ0X9?tag=doghealthy-21', false),

-- ('IAMS Small Breed Adult Chicken 4kg', 'IAMS', 'dry', 28.99, 'adult', 'small', false, 25.0, 14.0, 
-- 'Complete nutrition for small breed dogs with 0% artificial preservatives, flavours or colours.', 
-- 'https://www.amazon.co.uk/dp/B07HR7ZQ1X0?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Small & Medium Adult Chicken 3kg', 'Lilys Kitchen', 'dry', 24.99, 'adult', 'small', true, 26.0, 15.0, 
-- 'Natural dry dog food for small and medium breeds with free-range chicken. Grain-free recipe.', 
-- 'https://www.amazon.co.uk/dp/B07HS8ZQ2X1?tag=doghealthy-21', false),

-- -- Wet Foods
-- ('Royal Canin Adult Medium Chicken in Gravy 12x400g', 'Royal Canin', 'wet', 24.99, 'adult', 'medium', false, 8.0, 5.0, 
-- 'Complete wet dog food for medium breed dogs with high-quality proteins and essential nutrients.', 
-- 'https://www.amazon.co.uk/dp/B07HT9ZQ3X2?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Adult Chicken & Vegetables 12x370g', 'Hills Science Plan', 'wet', 22.99, 'adult', 'all', false, 8.5, 5.5, 
-- 'Nutritious wet dog food with real chicken and vegetables. No artificial colours or flavours.', 
-- 'https://www.amazon.co.uk/dp/B07HU0ZQ4X3?tag=doghealthy-21', false),

-- ('Purina Pro Plan Adult Chicken & Rice 12x400g', 'Purina Pro Plan', 'wet', 26.99, 'adult', 'all', false, 9.0, 6.0, 
-- 'High-quality wet dog food with real chicken as the first ingredient and essential vitamins.', 
-- 'https://www.amazon.co.uk/dp/B07HV1ZQ5X4?tag=doghealthy-21', false),

-- ('IAMS Adult Chicken & Vegetables 12x400g', 'IAMS', 'wet', 19.99, 'adult', 'all', false, 8.0, 5.0, 
-- 'Complete wet dog food with real chicken and vegetables. No artificial preservatives.', 
-- 'https://www.amazon.co.uk/dp/B07HW2ZQ6X5?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Adult Chicken & Duck 12x400g', 'Lilys Kitchen', 'wet', 28.99, 'adult', 'all', true, 9.0, 6.0, 
-- 'Natural wet dog food with free-range chicken and duck. Grain-free with no artificial additives.', 
-- 'https://www.amazon.co.uk/dp/B07HX3ZQ7X6?tag=doghealthy-21', false),

-- -- Special Diet Foods
-- ('Hill''s Prescription Diet z/d Ultra Allergen-Free 8kg', 'Hills Prescription Diet', 'dry', 89.99, 'adult', 'all', true, 22.0, 12.0, 
-- 'Veterinary-exclusive diet for dogs with food sensitivities. Hydrolyzed proteins for easy digestion.', 
-- 'https://www.amazon.co.uk/dp/B07HY4ZQ8X7?tag=doghealthy-21', false),

-- ('Royal Canin Gastrointestinal Low Fat 8kg', 'Royal Canin', 'dry', 76.99, 'adult', 'all', false, 20.0, 8.0, 
-- 'Veterinary-exclusive diet for dogs with digestive sensitivities. Low fat and highly digestible.', 
-- 'https://www.amazon.co.uk/dp/B07HZ5ZQ9X8?tag=doghealthy-21', false),

-- ('Purina Pro Plan Veterinary Diets EN Gastroenteric 8kg', 'Purina Pro Plan', 'dry', 68.99, 'adult', 'all', false, 21.0, 9.0, 
-- 'Veterinary-exclusive diet for dogs with gastrointestinal issues. Highly digestible and palatable.', 
-- 'https://www.amazon.co.uk/dp/B07I06ZQ0X9?tag=doghealthy-21', false),

-- ('IAMS Veterinary Formula Intestinal Plus 4kg', 'IAMS', 'dry', 42.99, 'adult', 'all', false, 20.0, 8.5, 
-- 'Veterinary-exclusive diet for dogs with sensitive stomachs. Prebiotics for digestive health.', 
-- 'https://www.amazon.co.uk/dp/B07I17ZQ1X0?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Sensitive Stomach Chicken 3kg', 'Lilys Kitchen', 'dry', 32.99, 'adult', 'all', true, 24.0, 12.0, 
-- 'Natural dry dog food for dogs with sensitive stomachs. Grain-free with prebiotics.', 
-- 'https://www.amazon.co.uk/dp/B07I28ZQ2X1?tag=doghealthy-21', false),

-- -- Weight Management
-- ('Royal Canin Weight Care Adult Dry Dog Food 8kg', 'Royal Canin', 'dry', 52.99, 'adult', 'all', false, 23.0, 10.0, 
-- 'Specially formulated for weight management with high protein and reduced fat content.', 
-- 'https://www.amazon.co.uk/dp/B07I39ZQ3X2?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Perfect Weight Chicken 8kg', 'Hills Science Plan', 'dry', 58.99, 'adult', 'all', false, 24.0, 11.0, 
-- 'Clinically proven weight management food with L-carnitine to help burn fat and maintain muscle.', 
-- 'https://www.amazon.co.uk/dp/B07I40ZQ4X3?tag=doghealthy-21', false),

-- ('Purina Pro Plan Weight Management Chicken & Rice 8kg', 'Purina Pro Plan', 'dry', 48.99, 'adult', 'all', false, 25.0, 12.0, 
-- 'High-protein weight management food with OPTIWEIGHT to help maintain healthy weight.', 
-- 'https://www.amazon.co.uk/dp/B07I51ZQ5X4?tag=doghealthy-21', false),

-- ('IAMS Weight Control Adult Chicken 4kg', 'IAMS', 'dry', 32.99, 'adult', 'all', false, 22.0, 9.0, 
-- 'Complete weight control nutrition with L-carnitine to help burn fat and maintain muscle mass.', 
-- 'https://www.amazon.co.uk/dp/B07I62ZQ6X5?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Light Chicken & Duck 3kg', 'Lilys Kitchen', 'dry', 28.99, 'adult', 'all', true, 23.0, 10.0, 
-- 'Natural light dog food with free-range chicken and duck. Reduced calories with high protein.', 
-- 'https://www.amazon.co.uk/dp/B07I73ZQ7X6?tag=doghealthy-21', false),

-- -- Puppy Specialized
-- ('Royal Canin Giant Puppy Dry Dog Food 15kg', 'Royal Canin', 'dry', 72.99, 'puppy', 'large', false, 27.0, 16.0, 
-- 'Specially formulated for giant breed puppies with controlled growth and joint support.', 
-- 'https://www.amazon.co.uk/dp/B07I84ZQ8X7?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Puppy Large Breed Chicken 7kg', 'Hills Science Plan', 'dry', 52.99, 'puppy', 'large', false, 28.0, 17.0, 
-- 'Complete nutrition for large breed puppies with controlled calcium and phosphorus levels.', 
-- 'https://www.amazon.co.uk/dp/B07I95ZQ9X8?tag=doghealthy-21', false),

-- ('Purina Pro Plan Puppy Large Breed Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 58.99, 'puppy', 'large', false, 29.0, 18.0, 
-- 'High-protein puppy food for large breeds with OPTISTART and controlled growth.', 
-- 'https://www.amazon.co.uk/dp/B07IA6ZQ0X9?tag=doghealthy-21', false),

-- ('IAMS Puppy Medium Breed Chicken 7kg', 'IAMS', 'dry', 38.99, 'puppy', 'medium', false, 27.0, 16.0, 
-- 'Complete nutrition for medium breed puppies with DHA for brain and eye development.', 
-- 'https://www.amazon.co.uk/dp/B07IB7ZQ1X0?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Puppy Small & Medium Chicken 3kg', 'Lilys Kitchen', 'dry', 26.99, 'puppy', 'small', true, 29.0, 17.0, 
-- 'Natural puppy food for small and medium breeds with free-range chicken. Grain-free with DHA.', 
-- 'https://www.amazon.co.uk/dp/B07IC8ZQ2X1?tag=doghealthy-21', false),

-- -- Senior Specialized
-- ('Royal Canin Giant Senior Dry Dog Food 15kg', 'Royal Canin', 'dry', 68.99, 'senior', 'large', false, 22.0, 11.0, 
-- 'Specially formulated for giant senior dogs with joint support and easy-to-digest proteins.', 
-- 'https://www.amazon.co.uk/dp/B07ID9ZQ3X2?tag=doghealthy-21', false),

-- ('Hill''s Science Plan Mature Adult 7+ Large Breed 7kg', 'Hills Science Plan', 'dry', 48.99, 'senior', 'large', false, 21.0, 10.0, 
-- 'Complete nutrition for senior large breed dogs with joint support and antioxidants.', 
-- 'https://www.amazon.co.uk/dp/B07IE0ZQ4X3?tag=doghealthy-21', false),

-- ('Purina Pro Plan Senior 7+ Large Breed Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 52.99, 'senior', 'large', false, 23.0, 12.0, 
-- 'High-quality senior food for large breeds with glucosamine for joint health.', 
-- 'https://www.amazon.co.uk/dp/B07IF1ZQ5X4?tag=doghealthy-21', false),

-- ('IAMS Senior Small Breed Chicken 4kg', 'IAMS', 'dry', 32.99, 'senior', 'small', false, 20.0, 9.0, 
-- 'Complete nutrition for senior small breed dogs with joint support and digestive health.', 
-- 'https://www.amazon.co.uk/dp/B07IG2ZQ6X5?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Senior Small & Medium Chicken 3kg', 'Lilys Kitchen', 'dry', 24.99, 'senior', 'small', true, 22.0, 11.0, 
-- 'Natural senior dog food for small and medium breeds with free-range chicken. Grain-free.', 
-- 'https://www.amazon.co.uk/dp/B07IH3ZQ7X6?tag=doghealthy-21', false),

-- -- Premium Options
-- ('Orijen Six Fish Freeze-Dried Raw 2.27kg', 'Orijen', 'dry', 94.99, 'adult', 'all', true, 40.0, 22.0, 
-- 'Premium freeze-dried raw dog food with 85% fish, organs and cartilage. Biologically appropriate.', 
-- 'https://www.amazon.co.uk/dp/B07II4ZQ8X7?tag=doghealthy-21', false),

-- ('Canagan Scottish Salmon & Herring 12kg', 'Canagan', 'dry', 58.99, 'adult', 'all', true, 29.0, 17.0, 
-- 'Grain-free dry dog food with 80% fresh Scottish salmon and herring. Natural ingredients.', 
-- 'https://www.amazon.co.uk/dp/B07IJ5ZQ9X8?tag=doghealthy-21', false),

-- ('Acana Heritage Red Meat 11.4kg', 'Acana', 'dry', 72.99, 'adult', 'all', true, 32.0, 18.0, 
-- 'Biologically appropriate dog food with grass-fed beef, bison and wild boar. Grain-free.', 
-- 'https://www.amazon.co.uk/dp/B07IK6ZQ0X9?tag=doghealthy-21', false),

-- ('Applaws Adult Large Breed Salmon 12kg', 'Applaws', 'dry', 42.99, 'adult', 'large', true, 26.0, 15.0, 
-- 'Natural dry dog food with 80% salmon. Grain-free recipe with no artificial additives.', 
-- 'https://www.amazon.co.uk/dp/B07IL7ZQ1X0?tag=doghealthy-21', false),

-- ('Lily''s Kitchen Adult Large Breed Chicken 7kg', 'Lilys Kitchen', 'dry', 38.99, 'adult', 'large', true, 25.0, 14.0, 
-- 'Natural dry dog food for large breeds with free-range chicken. Grain-free with joint support.', 
-- 'https://www.amazon.co.uk/dp/B07IM8ZQ2X1?tag=doghealthy-21', false)

-- ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Migration Complete!
-- ============================================
-- All tables created successfully with RLS policies and triggers

