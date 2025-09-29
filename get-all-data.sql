-- SQL script to retrieve all data from the RealCulture database
-- This script can be used in DBeaver or other database tools for testing and analysis

-- First, let's see what tables exist in the database
\dt

-- Get all data from users table
SELECT * FROM users;

-- Get all data from contents table
SELECT * FROM contents;

-- Get all data from generated_images table
SELECT * FROM generated_images;

-- Get all data from generated_videos table
SELECT * FROM generated_videos;

-- Get all data from generated_audios table
SELECT * FROM generated_audios;

-- Get all data from generated_music table
SELECT * FROM generated_music;

-- Get all data from influencers table
SELECT * FROM influencers;

-- Get all data from products table
SELECT * FROM products;

-- Get all data from creators table
SELECT * FROM creators;

-- Get count of records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'contents' as table_name, COUNT(*) as record_count FROM contents
UNION ALL
SELECT 'generated_images' as table_name, COUNT(*) as record_count FROM generated_images
UNION ALL
SELECT 'generated_videos' as table_name, COUNT(*) as record_count FROM generated_videos
UNION ALL
SELECT 'generated_audios' as table_name, COUNT(*) as record_count FROM generated_audios
UNION ALL
SELECT 'generated_music' as table_name, COUNT(*) as record_count FROM generated_music
UNION ALL
SELECT 'influencers' as table_name, COUNT(*) as record_count FROM influencers
UNION ALL
SELECT 'products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'creators' as table_name, COUNT(*) as record_count FROM creators;

-- Get recent content (last 10 records from each content table)
SELECT 'contents' as source, id, "creatorUserId", "media_url", "created_at", type 
FROM contents 
ORDER BY "created_at" DESC 
LIMIT 10
UNION ALL
SELECT 'generated_images' as source, id, "user_id", "imageUrl", "createdAt", 'image' as type
FROM generated_images 
ORDER BY "createdAt" DESC 
LIMIT 10
UNION ALL
SELECT 'generated_videos' as source, id, "user_id", "videoUrl", "createdAt", 'video' as type
FROM generated_videos 
ORDER BY "createdAt" DESC 
LIMIT 10
UNION ALL
SELECT 'generated_audios' as source, id, "userId", "audioUrl", "createdAt", 'audio' as type
FROM generated_audios 
ORDER BY "createdAt" DESC 
LIMIT 10;