# Database Schema Fix Instructions

This document provides instructions on how to fix the database schema issues identified in your RealCulture AI backend.

## Issues Identified

1. **Duplicate columns with different names**:
   - Users table: `resetToken` and `resettoken`, `resetTokenExpires` and `resettokenexpires`
   - Contents table: Multiple user ID columns (`userId`, `userid`, `creatorUserId`, `creator_id`)
   - Contents table: Multiple media URL columns (`mediaUrl`, `mediaurl`, `media_url`)
   - Contents table: Multiple created date columns (`createdAt`, `createdat`, `created_at`)

2. **Type mismatches**:
   - User ID columns have inconsistent types (some `uuid`, some `character varying`)

3. **Missing foreign key constraints**:
   - No proper relationship enforced between users and contents tables

## Solution

The provided `fix-database-schema.sql` script will:

1. Consolidate duplicate columns
2. Ensure proper data types (especially for UUID columns)
3. Add missing foreign key constraints
4. Create helpful indexes for performance
5. Add any missing columns required by the entity definitions

## How to Run the Fix

### Option 1: Using psql command line

1. Make sure your PostgreSQL database is running
2. Navigate to the backend directory:
   ```bash
   cd c:\MisyBot\RealCulture AI\backend
   ```
3. Run the script:
   ```bash
   psql -U your_username -d your_database_name -f fix-database-schema.sql
   ```

### Option 2: Using a database GUI tool

1. Open your preferred PostgreSQL GUI tool (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Open the `fix-database-schema.sql` file
4. Execute the script

### Option 3: Manual execution

If you prefer to run the commands manually, here are the key steps:

1. **Consolidate user ID columns in contents table**:
   ```sql
   -- Add creatorUserId column if it doesn't exist
   ALTER TABLE contents ADD COLUMN IF NOT EXISTS "creatorUserId" UUID;
   
   -- Copy data from other user ID columns
   UPDATE contents SET "creatorUserId" = userid::UUID WHERE "creatorUserId" IS NULL AND userid IS NOT NULL;
   UPDATE contents SET "creatorUserId" = "userId"::UUID WHERE "creatorUserId" IS NULL AND "userId" IS NOT NULL;
   
   -- Drop duplicate columns
   ALTER TABLE contents DROP COLUMN IF EXISTS userid;
   ALTER TABLE contents DROP COLUMN IF EXISTS "userId";
   ALTER TABLE contents DROP COLUMN IF EXISTS "creator_id";
   ```

2. **Add foreign key constraint**:
   ```sql
   ALTER TABLE contents 
   ADD CONSTRAINT fk_contents_creator 
   FOREIGN KEY ("creatorUserId") REFERENCES users("userId") 
   ON DELETE CASCADE;
   ```

3. **Create indexes**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_contents_creator_user_id ON contents("creatorUserId");
   CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at);
   CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);
   ```

## After Running the Fix

1. Restart your backend application
2. Test the gallery endpoint to ensure it's working correctly
3. Verify that SAS URLs are being generated properly

## Troubleshooting

If you encounter any issues:

1. **Connection errors**: Make sure your PostgreSQL server is running and accessible
2. **Permission errors**: Ensure your database user has sufficient privileges to modify tables
3. **Data conversion errors**: Some columns might have data that can't be converted to UUID - you may need to clean this data first

## Verification

After running the script, you can verify the changes by running:

```sql
-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check contents table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contents' 
ORDER BY ordinal_position;

-- Test the relationship
SELECT 
    c.id,
    c."creatorUserId",
    u."userId",
    u.email
FROM contents c
JOIN users u ON c."creatorUserId" = u."userId"
LIMIT 5;
```