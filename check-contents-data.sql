-- Check sample data in contents table
SELECT 
    id,
    userid,
    type,
    media_url,
    status,
    created_at,
    title,
    description
FROM contents 
LIMIT 10;

-- Check if there are any contents with null userid
SELECT COUNT(*) as null_userid_count
FROM contents 
WHERE userid IS NULL;

-- Check the data types of userid values
SELECT 
    pg_typeof(userid) as userid_type,
    COUNT(*) as count
FROM contents 
GROUP BY pg_typeof(userid);