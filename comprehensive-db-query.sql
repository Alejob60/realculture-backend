-- Comprehensive SQL script to retrieve all data from the RealCulture database
-- This script is designed for PostgreSQL and can be used in DBeaver

-- 1. List all tables in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Get row counts for all tables
SELECT 
    schemaname,
    tablename,
    n_tup_ins - n_tup_del AS row_count
FROM pg_stat_user_tables
ORDER BY tablename;

-- 3. Get all data from users table
SELECT * FROM users;

-- 4. Get all data from contents table
SELECT * FROM contents;

-- 5. Get all data from generated_images table
SELECT * FROM generated_images;

-- 6. Get all data from generated_videos table
SELECT * FROM generated_videos;

-- 7. Get all data from generated_audios table
SELECT * FROM generated_audios;

-- 8. Get all data from generated_music table (if it exists)
SELECT * FROM generated_music;

-- 9. Get all data from influencers table (if it exists)
SELECT * FROM influencers;

-- 10. Get all data from products table (if it exists)
SELECT * FROM products;

-- 11. Get all data from creators table (if it exists)
SELECT * FROM creators;

-- 12. Check the structure of generated_audios table to verify column types
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'generated_audios' 
ORDER BY ordinal_position;

-- 13. Check the structure of users table to verify column types
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 14. Find any records in generated_audios that don't have a matching user
SELECT ga.* 
FROM generated_audios ga
LEFT JOIN users u ON ga."userId" = u."userId"
WHERE u."userId" IS NULL;

-- 15. Get recent content from all tables (last 5 records from each)
(
    SELECT 'contents' as source, "id"::text, "created_at" as created_at, "type" 
    FROM contents 
    ORDER BY "created_at" DESC 
    LIMIT 5
)
UNION ALL
(
    SELECT 'generated_images' as source, "id"::text, "createdAt" as created_at, 'image' as type
    FROM generated_images 
    ORDER BY "createdAt" DESC 
    LIMIT 5
)
UNION ALL
(
    SELECT 'generated_videos' as source, "id"::text, "createdAt" as created_at, 'video' as type
    FROM generated_videos 
    ORDER BY "createdAt" DESC 
    LIMIT 5
)
UNION ALL
(
    SELECT 'generated_audios' as source, "id"::text, "createdAt" as created_at, 'audio' as type
    FROM generated_audios 
    ORDER BY "createdAt" DESC 
    LIMIT 5
)
ORDER BY created_at DESC;