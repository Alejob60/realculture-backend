-- Simple SQL script to retrieve data from the main tables in RealCulture database
-- This script is designed for PostgreSQL and can be used in DBeaver

-- 1. Get all users
SELECT * FROM users;

-- 2. Get all content with more details
SELECT 
    id,
    "creatorUserId",
    "media_url",
    "created_at",
    "updated_at",
    type,
    status,
    title,
    description,
    duration,
    "audio_url",
    "audio_duration",
    "audio_voice"
FROM contents
ORDER BY "created_at" DESC;

-- 3. Get all generated images
SELECT * FROM generated_images;

-- 4. Get all generated videos
SELECT * FROM generated_videos;

-- 5. Get all generated audios
SELECT * FROM generated_audios;

-- 6. Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'contents' as table_name, COUNT(*) as count FROM contents
UNION ALL
SELECT 'generated_images' as table_name, COUNT(*) as count FROM generated_images
UNION ALL
SELECT 'generated_videos' as table_name, COUNT(*) as count FROM generated_videos
UNION ALL
SELECT 'generated_audios' as table_name, COUNT(*) as count FROM generated_audios;

-- 7. Check for any orphaned records in generated_audios (no matching user)
SELECT ga.* 
FROM generated_audios ga
LEFT JOIN users u ON ga."userId" = u."userId"
WHERE u."userId" IS NULL;

-- 8. Get recent records from each table (last 3 from each)
SELECT 'contents' as source, "id"::text, "created_at" as created_at 
FROM contents 
ORDER BY "created_at" DESC 
LIMIT 3
UNION ALL
SELECT 'generated_images' as source, "id"::text, "createdAt" as created_at
FROM generated_images 
ORDER BY "createdAt" DESC 
LIMIT 3
UNION ALL
SELECT 'generated_videos' as source, "id"::text, "createdAt" as created_at
FROM generated_videos 
ORDER BY "createdAt" DESC 
LIMIT 3
UNION ALL
SELECT 'generated_audios' as source, "id"::text, "createdAt" as created_at
FROM generated_audios 
ORDER BY "createdAt" DESC 
LIMIT 3
ORDER BY created_at DESC;