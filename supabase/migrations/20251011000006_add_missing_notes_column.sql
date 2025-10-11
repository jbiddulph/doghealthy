-- Add notes column to health_records table if it doesn't exist
ALTER TABLE public.doghealthy_health_records 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Also make sure medications table has notes column
ALTER TABLE public.doghealthy_medications 
ADD COLUMN IF NOT EXISTS notes TEXT;

