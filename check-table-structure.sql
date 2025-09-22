-- Check the structure of the users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check the structure of the contents table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;

-- Check sample data to understand the current values
SELECT userid FROM contents LIMIT 5;
SELECT "userId" FROM users LIMIT 5;