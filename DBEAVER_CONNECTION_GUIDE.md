# DBeaver Connection Guide for RealCulture Database

## Database Connection Details

To connect to the RealCulture database using DBeaver, use the following connection parameters:

### Connection Settings
- **Host**: realculture-db.postgres.database.azure.com
- **Port**: 5432
- **Database**: postgres
- **Username**: adminrealculture
- **Password**: Alejob6005901@/
- **SSL**: Required (true)

### Connection Steps in DBeaver

1. Open DBeaver
2. Click on "New Database Connection" (or press Ctrl+Alt+Shift+N)
3. Select "PostgreSQL" from the list of databases
4. Fill in the connection details:
   - **Host**: realculture-db.postgres.database.azure.com
   - **Port**: 5432
   - **Database**: postgres
   - **Username**: adminrealculture
   - **Password**: Alejob6005901@/
5. Go to the "SSL" tab and check "Use SSL"
6. Click "Test Connection" to verify the connection works
7. Click "Finish" to save the connection

### Running the SQL Scripts

Once connected, you can run the provided SQL scripts:

1. **simple-db-query.sql** - Basic queries to get data from main tables
2. **comprehensive-db-query.sql** - More detailed queries with table structures and diagnostics

To run a script:
1. Right-click on your database connection and select "SQL Editor" → "Open SQL Script"
2. Select one of the provided SQL files
3. Press Ctrl+Enter to execute the entire script or select specific queries to run

### Common Queries to Try

After connecting, you can also run these individual queries:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count records in each table
SELECT schemaname, tablename, n_tup_ins - n_tup_del AS row_count
FROM pg_stat_user_tables
ORDER BY tablename;

-- Get recent content (last 10 records)
SELECT 'contents' as source, id, "created_at" as created_at 
FROM contents 
ORDER BY "created_at" DESC 
LIMIT 10;
```

### Troubleshooting

If you have connection issues:

1. **Verify credentials**: Make sure you're using the correct username and password
2. **Check SSL settings**: Ensure SSL is enabled for this Azure PostgreSQL database
3. **Network connectivity**: Verify you can reach the database host
4. **Firewall rules**: Ensure your IP is allowed to connect to the Azure PostgreSQL server

### Important Notes

- This is a production database, so be careful with any write operations
- The database uses UUIDs for primary keys in most tables
- Some tables have foreign key relationships that should be maintained
- The `generated_audios` table has a known type mismatch issue between `userId` and the `users` table