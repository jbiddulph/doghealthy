-- Migration: Add reminder columns to existing tables
-- Date: 2025-01-15

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
