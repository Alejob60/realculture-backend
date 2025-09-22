-- Manual Database Fix for Missing Columns
-- Run these commands directly in your PostgreSQL database

-- Connect to your database and run these commands:

-- Add the missing updated_at column
ALTER TABLE contents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;

-- Add other potentially missing columns
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_duration FLOAT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_voice TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_contents_creator_user_id ON contents("creatorUserId");
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;

-- Check that the updated_at column now exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contents' AND column_name = 'updated_at';