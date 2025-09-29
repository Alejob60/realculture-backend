-- Analysis of the relationship between users and contents
-- This script will help understand how users interact with content

-- 1. Get users with their content counts
SELECT 
    u."userId",
    u.email,
    u.name,
    COUNT(c.id) as content_count
FROM users u
LEFT JOIN contents c ON u."userId" = c."creatorUserId"
GROUP BY u."userId", u.email, u.name
ORDER BY content_count DESC;

-- 2. Get detailed information for users with the most content
SELECT 
    u."userId",
    u.email,
    u.name,
    u."createdAt" as user_created_at,
    c.id as content_id,
    c.type as content_type,
    c."created_at" as content_created_at,
    c.title as content_title
FROM users u
JOIN contents c ON u."userId" = c."creatorUserId"
WHERE u."userId" IN (
    SELECT "creatorUserId"
    FROM contents
    GROUP BY "creatorUserId"
    ORDER BY COUNT(*) DESC
    LIMIT 5
)
ORDER BY u."userId", c."created_at" DESC;

-- 3. Check for contents with invalid creatorUserId (orphaned contents)
SELECT 
    c.id,
    c."creatorUserId",
    c."created_at",
    c.type
FROM contents c
LEFT JOIN users u ON c."creatorUserId" = u."userId"
WHERE u."userId" IS NULL;

-- 4. Users who have never created content
SELECT 
    u."userId",
    u.email,
    u.name,
    u."createdAt"
FROM users u
LEFT JOIN contents c ON u."userId" = c."creatorUserId"
WHERE c."creatorUserId" IS NULL;

-- 5. Content distribution by user role
SELECT 
    u.role,
    COUNT(c.id) as content_count,
    COUNT(DISTINCT u."userId") as user_count
FROM users u
JOIN contents c ON u."userId" = c."creatorUserId"
GROUP BY u.role
ORDER BY content_count DESC;

-- 6. Recent activity by users (last 7 days)
SELECT 
    u."userId",
    u.email,
    COUNT(c.id) as recent_content_count
FROM users u
JOIN contents c ON u."userId" = c."creatorUserId"
WHERE c."created_at" >= NOW() - INTERVAL '7 days'
GROUP BY u."userId", u.email
ORDER BY recent_content_count DESC;