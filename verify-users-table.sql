-- Verify the users table structure

-- Check if userId column exists and is of type uuid
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'userId';

-- Check all columns in users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check sample data
SELECT "userId", email, name, role FROM users LIMIT 5;