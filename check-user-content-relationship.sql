-- Check the relationship between users and contents

-- Find contents with valid user references
SELECT 
    c.id,
    c.userid,
    u."userId",
    u.email
FROM contents c
JOIN users u ON c.userid = u."userId"
LIMIT 5;

-- Find contents with invalid user references (orphaned contents)
SELECT 
    c.id,
    c.userid
FROM contents c
LEFT JOIN users u ON c.userid = u."userId"
WHERE u."userId" IS NULL
LIMIT 5;

-- Count contents per user
SELECT 
    u."userId",
    u.email,
    COUNT(c.id) as content_count
FROM users u
LEFT JOIN contents c ON u."userId" = c.userid
GROUP BY u."userId", u.email
ORDER BY content_count DESC
LIMIT 10;