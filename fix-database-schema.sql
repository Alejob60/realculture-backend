-- Comprehensive database schema cleanup script
-- This script will fix the duplicate columns and type mismatches in the users and contents tables
-- Run this script using: psql -U your_username -d your_database_name -f fix-database-schema.sql

-- First, let's check the current state of the tables
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

-- Step 1: Consolidate duplicate columns in users table
-- The users table has resetToken and resettoken, resetTokenExpires and resettokenexpires
-- We'll keep the camelCase versions and drop the lowercase ones

DO $$ 
BEGIN
    -- Drop resettoken if resetToken exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'resettoken') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'resetToken') THEN
        ALTER TABLE users DROP COLUMN IF EXISTS resettoken;
    END IF;
    
    -- Drop resettokenexpires if resetTokenExpires exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'resettokenexpires') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'resetTokenExpires') THEN
        ALTER TABLE users DROP COLUMN IF EXISTS resettokenexpires;
    END IF;
END $$;

-- Step 2: Consolidate duplicate columns in contents table
-- The contents table has multiple duplicates:
-- userId/userid/creatorUserId/creator_id
-- mediaUrl/mediaurl/media_url
-- createdAt/createdat/created_at

DO $$ 
BEGIN
    -- First, ensure we have a creatorUserId column of type uuid
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'creatorUserId') THEN
        ALTER TABLE contents ADD COLUMN creatorUserId UUID;
    END IF;
    
    -- Ensure creatorUserId is of type uuid
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'creatorUserId' AND data_type != 'uuid') THEN
        ALTER TABLE contents ALTER COLUMN "creatorUserId" TYPE UUID USING "creatorUserId"::UUID;
    END IF;
    
    -- Now consolidate all user ID columns into creatorUserId
    -- If userid exists and has data, copy it to creatorUserId
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'userid') THEN
        UPDATE contents 
        SET "creatorUserId" = userid::UUID 
        WHERE "creatorUserId" IS NULL AND userid IS NOT NULL;
    END IF;
    
    -- If userId exists and has data, copy it to creatorUserId
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'userId') THEN
        UPDATE contents 
        SET "creatorUserId" = "userId"::UUID 
        WHERE "creatorUserId" IS NULL AND "userId" IS NOT NULL;
    END IF;
    
    -- If creator_id exists and has data, copy it to creatorUserId
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'creator_id') THEN
        UPDATE contents 
        SET "creatorUserId" = "creator_id" 
        WHERE "creatorUserId" IS NULL AND "creator_id" IS NOT NULL;
    END IF;
    
    -- Drop the duplicate user ID columns
    ALTER TABLE contents DROP COLUMN IF EXISTS userid;
    ALTER TABLE contents DROP COLUMN IF EXISTS "userId";
    ALTER TABLE contents DROP COLUMN IF EXISTS "creator_id";
    
    -- Consolidate media URL columns
    -- Ensure we have a media_url column (matching the entity definition)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'media_url') THEN
        ALTER TABLE contents ADD COLUMN media_url TEXT;
    END IF;
    
    -- Copy data from duplicate columns to media_url
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'mediaurl') THEN
        UPDATE contents 
        SET media_url = mediaurl 
        WHERE media_url IS NULL AND mediaurl IS NOT NULL;
        ALTER TABLE contents DROP COLUMN IF EXISTS mediaurl;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'url') THEN
        UPDATE contents 
        SET media_url = url 
        WHERE media_url IS NULL AND url IS NOT NULL;
        ALTER TABLE contents DROP COLUMN IF EXISTS url;
    END IF;
    
    -- Consolidate created date columns
    -- Ensure we have a created_at column (matching the entity definition)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'created_at') THEN
        ALTER TABLE contents ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Copy data from duplicate columns to created_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'createdat') THEN
        UPDATE contents 
        SET created_at = createdat 
        WHERE created_at IS NULL AND createdat IS NOT NULL;
        ALTER TABLE contents DROP COLUMN IF EXISTS createdat;
    END IF;
    
    -- Add missing columns that are in the entity but not in the table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'audio_url') THEN
        ALTER TABLE contents ADD COLUMN audio_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'audio_duration') THEN
        ALTER TABLE contents ADD COLUMN audio_duration FLOAT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'audio_voice') THEN
        ALTER TABLE contents ADD COLUMN audio_voice TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'expires_at') THEN
        ALTER TABLE contents ADD COLUMN expires_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'filename') THEN
        ALTER TABLE contents ADD COLUMN filename TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'title') THEN
        ALTER TABLE contents ADD COLUMN title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'description') THEN
        ALTER TABLE contents ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'metadata') THEN
        ALTER TABLE contents ADD COLUMN metadata JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'updated_at') THEN
        ALTER TABLE contents ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
END $$;

-- Step 3: Add foreign key constraint
DO $$ 
BEGIN
    -- Check if the foreign key constraint already exists
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

-- Step 4: Create indexes for better performance
DO $$ 
BEGIN
    -- Index on creatorUserId for faster joins
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'contents' 
        AND indexname = 'idx_contents_creator_user_id'
    ) THEN
        CREATE INDEX idx_contents_creator_user_id ON contents("creatorUserId");
    END IF;
    
    -- Index on created_at for faster date filtering
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'contents' 
        AND indexname = 'idx_contents_created_at'
    ) THEN
        CREATE INDEX idx_contents_created_at ON contents(created_at);
    END IF;
    
    -- Index on type for faster filtering by content type
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'contents' 
        AND indexname = 'idx_contents_type'
    ) THEN
        CREATE INDEX idx_contents_type ON contents(type);
    END IF;
END $$;

-- Step 5: Verify the changes
-- Final users table structure:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Final contents table structure:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;

-- Checking foreign key relationship:
SELECT 
    c.id,
    c."creatorUserId",
    u."userId",
    u.email
FROM contents c
JOIN users u ON c."creatorUserId" = u."userId"
LIMIT 5;

-- Database schema cleanup completed successfully!