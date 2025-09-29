-- Add missing columns to fix immediate issues
-- Run this on your database to add the missing updated_at column

-- Add updated_at column if it doesn't exist
ALTER TABLE contents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;

-- Add any other potentially missing columns
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_duration FLOAT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_voice TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contents_creator_user_id ON contents("creatorUserId");
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;