-- Migration: Create dashboard settings table
-- This migration is idempotent and safe to run multiple times

-- Create dashboard_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS dashboard_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    layout jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Create index on user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_user_id ON dashboard_settings(user_id);

-- Enable RLS
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ BEGIN
    -- Policy for users to see their own settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_settings' 
        AND policyname = 'Users can view their own dashboard settings'
    ) THEN
        CREATE POLICY "Users can view their own dashboard settings"
            ON dashboard_settings FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
    
    -- Policy for users to insert their own settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_settings' 
        AND policyname = 'Users can insert their own dashboard settings'
    ) THEN
        CREATE POLICY "Users can insert their own dashboard settings"
            ON dashboard_settings FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Policy for users to update their own settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_settings' 
        AND policyname = 'Users can update their own dashboard settings'
    ) THEN
        CREATE POLICY "Users can update their own dashboard settings"
            ON dashboard_settings FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
    
    -- Policy for users to delete their own settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_settings' 
        AND policyname = 'Users can delete their own dashboard settings'
    ) THEN
        CREATE POLICY "Users can delete their own dashboard settings"
            ON dashboard_settings FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create or replace function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_dashboard_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_dashboard_settings_updated_at
            BEFORE UPDATE ON dashboard_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
