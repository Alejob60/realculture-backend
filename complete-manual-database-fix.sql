-- Complete Manual Database Fix
-- This script will fix all the schema issues including duplicate columns and type mismatches

-- 1. First, check current table structures
-- Users table structure:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Contents table structure:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;

-- 2. Add missing columns to contents table
ALTER TABLE contents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_duration FLOAT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS audio_voice TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 3. Consolidate duplicate columns in contents table
-- Check if creatorUserId exists and is of type uuid
DO $$ 
BEGIN
    -- Ensure creatorUserId column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'creatorUserId') THEN
        ALTER TABLE contents ADD COLUMN creatorUserId UUID;
    END IF;
    
    -- Ensure creatorUserId is of type uuid
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'creatorUserId' AND data_type != 'uuid') THEN
        ALTER TABLE contents ALTER COLUMN "creatorUserId" TYPE UUID USING "creatorUserId"::UUID;
    END IF;
    
    -- Copy data from other user ID columns to creatorUserId if needed
    -- This is a safe operation that won't overwrite existing data
    UPDATE contents 
    SET "creatorUserId" = COALESCE("creatorUserId", userid::UUID, "userId"::UUID)
    WHERE "creatorUserId" IS NULL AND (userid IS NOT NULL OR "userId" IS NOT NULL);
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contents_creator_user_id ON contents("creatorUserId");
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);

-- 5. Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'contents' 
        AND kcu.column_name = 'creatorUserId'
    ) THEN
        ALTER TABLE contents 
        ADD CONSTRAINT fk_contents_creator 
        FOREIGN KEY ("creatorUserId") REFERENCES users("userId") 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Verify the final structure
-- Final contents table structure:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;

-- Check that the updated_at column now exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contents' AND column_name = 'updated_at';

-- Test the relationship
SELECT 
    c.id,
    c."creatorUserId",
    u."userId",
    u.email
FROM contents c
JOIN users u ON c."creatorUserId" = u."userId"
LIMIT 5;