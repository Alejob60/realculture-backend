-- Add any missing fields to the contents table based on the Content entity

-- Add audio_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'audio_url') THEN
        ALTER TABLE contents ADD COLUMN audio_url TEXT;
    END IF;
END $$;

-- Add audio_duration column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'audio_duration') THEN
        ALTER TABLE contents ADD COLUMN audio_duration FLOAT;
    END IF;
END $$;

-- Add audio_voice column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'audio_voice') THEN
        ALTER TABLE contents ADD COLUMN audio_voice TEXT;
    END IF;
END $$;

-- Add expires_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'expires_at') THEN
        ALTER TABLE contents ADD COLUMN expires_at TIMESTAMP;
    END IF;
END $$;

-- Add filename column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'filename') THEN
        ALTER TABLE contents ADD COLUMN filename TEXT;
    END IF;
END $$;

-- Add title column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'title') THEN
        ALTER TABLE contents ADD COLUMN title TEXT;
    END IF;
END $$;

-- Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'description') THEN
        ALTER TABLE contents ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'metadata') THEN
        ALTER TABLE contents ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Ensure userid column is of type uuid
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'userid' AND data_type != 'uuid') THEN
        ALTER TABLE contents ALTER COLUMN userid TYPE UUID USING userid::UUID;
    END IF;
END $$;

-- Verify all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;