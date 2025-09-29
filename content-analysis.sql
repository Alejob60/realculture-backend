-- Detailed analysis of the contents table
-- This script will help understand the data structure and patterns

-- 1. Get column information for contents table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;

-- 2. Count of contents by type
SELECT 
    type,
    COUNT(*) as count
FROM contents
GROUP BY type
ORDER BY count DESC;

-- 3. Count of contents by status
SELECT 
    status,
    COUNT(*) as count
FROM contents
GROUP BY status
ORDER BY count DESC;

-- 4. Recent contents with all fields
SELECT 
    id,
    "creatorUserId",
    "media_url",
    "created_at",
    "updated_at",
    "expires_at",
    filename,
    type,
    status,
    duration,
    title,
    description,
    prompt,
    metadata,
    "audio_url",
    "audio_duration",
    "audio_voice"
FROM contents
ORDER BY "created_at" DESC
LIMIT 20;

-- 5. Contents with audio information
SELECT 
    id,
    type,
    "audio_url",
    "audio_duration",
    "audio_voice",
    "created_at"
FROM contents
WHERE "audio_url" IS NOT NULL
ORDER BY "created_at" DESC;

-- 6. Contents by creator (top 10 creators)
SELECT 
    "creatorUserId",
    COUNT(*) as content_count
FROM contents
GROUP BY "creatorUserId"
ORDER BY content_count DESC
LIMIT 10;

-- 7. Contents with missing media URLs
SELECT 
    id,
    type,
    "media_url",
    "created_at",
    status
FROM contents
WHERE "media_url" IS NULL OR "media_url" = ''
ORDER BY "created_at" DESC;

-- 8. Contents by date (daily counts)
SELECT 
    DATE("created_at") as creation_date,
    COUNT(*) as daily_count
FROM contents
GROUP BY DATE("created_at")
ORDER BY creation_date DESC
LIMIT 30;

-- 9. Check user roles
SELECT 
    "userId",
    email,
    name,
    role,
    credits
FROM users
ORDER BY "createdAt" DESC;

-- 10. Count users by role
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY user_count DESC;