-- Migration: Create classifieds, chat, and notifications tables
-- Date: 2025-01-15

-- Breeding listings table
CREATE TABLE IF NOT EXISTS doghealthy_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES doghealthy_users(id) ON DELETE CASCADE,
    dog_id UUID REFERENCES doghealthy_dogs(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS doghealthy_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES doghealthy_listings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES doghealthy_users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES doghealthy_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notification preferences & reminders
CREATE TABLE IF NOT EXISTS doghealthy_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES doghealthy_users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_doghealthy_listings_user_id ON doghealthy_listings(user_id);
CREATE INDEX idx_doghealthy_listings_status ON doghealthy_listings(status);
CREATE INDEX idx_doghealthy_listings_breed ON doghealthy_listings(breed);
CREATE INDEX idx_doghealthy_listings_location ON doghealthy_listings(location);
CREATE INDEX idx_doghealthy_listings_price ON doghealthy_listings(price_gbp);
CREATE INDEX idx_doghealthy_listings_featured ON doghealthy_listings(is_featured);
CREATE INDEX idx_doghealthy_listings_created_at ON doghealthy_listings(created_at);

CREATE INDEX idx_doghealthy_messages_listing_id ON doghealthy_messages(listing_id);
CREATE INDEX idx_doghealthy_messages_sender_id ON doghealthy_messages(sender_id);
CREATE INDEX idx_doghealthy_messages_recipient_id ON doghealthy_messages(recipient_id);
CREATE INDEX idx_doghealthy_messages_is_read ON doghealthy_messages(is_read);
CREATE INDEX idx_doghealthy_messages_created_at ON doghealthy_messages(created_at);

CREATE INDEX idx_doghealthy_notifications_user_id ON doghealthy_notifications(user_id);
CREATE INDEX idx_doghealthy_notifications_type ON doghealthy_notifications(type);
CREATE INDEX idx_doghealthy_notifications_is_read ON doghealthy_notifications(is_read);
CREATE INDEX idx_doghealthy_notifications_scheduled_for ON doghealthy_notifications(scheduled_for);

-- Enable Row Level Security
ALTER TABLE doghealthy_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE doghealthy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doghealthy_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doghealthy_listings
CREATE POLICY "Users can view all active listings"
    ON doghealthy_listings FOR SELECT
    USING (status = 'active');

CREATE POLICY "Users can view their own listings"
    ON doghealthy_listings FOR SELECT
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own listings"
    ON doghealthy_listings FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own listings"
    ON doghealthy_listings FOR UPDATE
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own listings"
    ON doghealthy_listings FOR DELETE
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

-- RLS Policies for doghealthy_messages
CREATE POLICY "Users can view messages they sent or received"
    ON doghealthy_messages FOR SELECT
    USING (sender_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()) 
           OR recipient_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can insert messages as sender"
    ON doghealthy_messages FOR INSERT
    WITH CHECK (sender_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own messages"
    ON doghealthy_messages FOR UPDATE
    USING (sender_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own messages"
    ON doghealthy_messages FOR DELETE
    USING (sender_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

-- RLS Policies for doghealthy_notifications
CREATE POLICY "Users can view their own notifications"
    ON doghealthy_notifications FOR SELECT
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own notifications"
    ON doghealthy_notifications FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own notifications"
    ON doghealthy_notifications FOR UPDATE
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own notifications"
    ON doghealthy_notifications FOR DELETE
    USING (user_id IN (SELECT id FROM doghealthy_users WHERE id = auth.uid()));

-- Create function to update updated_at timestamp for listings
CREATE OR REPLACE FUNCTION update_doghealthy_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for listings
CREATE TRIGGER update_doghealthy_listings_updated_at
    BEFORE UPDATE ON doghealthy_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_doghealthy_listings_updated_at();

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE doghealthy_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE doghealthy_notifications;
