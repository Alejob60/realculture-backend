-- Fix the userid column type in contents table to match the userId column type in users table
-- First, check if the column exists and its current type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contents' AND column_name = 'userid';

-- If the userid column is not of type uuid, alter it
ALTER TABLE contents 
ALTER COLUMN userid TYPE uuid USING userid::uuid;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contents' AND column_name = 'userid';