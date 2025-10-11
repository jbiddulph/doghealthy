-- Create email leads table for marketing
CREATE TABLE IF NOT EXISTS public.doghealthy_email_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100), -- 'food-quiz', 'newsletter', 'pdf-download', etc.
    
    -- Quiz data (if from food quiz)
    quiz_answers JSONB,
    recommended_products UUID[],
    
    -- Status
    subscribed BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_email_leads_email ON public.doghealthy_email_leads(email);
CREATE INDEX idx_email_leads_source ON public.doghealthy_email_leads(source);
CREATE INDEX idx_email_leads_subscribed ON public.doghealthy_email_leads(subscribed);
CREATE INDEX idx_email_leads_created ON public.doghealthy_email_leads(created_at);

-- Enable RLS
ALTER TABLE public.doghealthy_email_leads ENABLE ROW LEVEL SECURITY;

-- Policy for inserting leads (anyone can submit their email)
CREATE POLICY "Anyone can submit email for leads"
    ON public.doghealthy_email_leads
    FOR INSERT
    WITH CHECK (true);

-- Only admins can view/update (you'll set this up later)
-- For now, no SELECT policy means only authenticated users with direct DB access can view

