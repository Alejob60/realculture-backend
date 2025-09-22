const { Client } = require('pg');
const { config } = require('dotenv');

// Load environment variables
config();

async function testGalleryLogic() {
  console.log('Testing gallery logic...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('✅ Database connection established');

    // Use the user ID from the data you provided
    const testUserId = '20bcd340-8a06-4a2f-be87-fce4fd6b318c';
    console.log(`\n🧪 Testing gallery logic for user ID: ${testUserId}`);

    // First, let's see what's actually in the contents table for this user
    console.log('\n--- Checking ALL content for this user (using userId column) ---');
    const allUserContentQuery = `
      SELECT id, title, description, type, "createdAt", "mediaUrl", "expiresAt", "userId", "creatorUserId"
      FROM contents 
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
    `;
    
    const allUserContentResult = await client.query(allUserContentQuery, [testUserId]);
    console.log(`📄 All content for user (userId column) - Found ${allUserContentResult.rowCount} items:`);
    
    // Now check using creatorUserId column
    console.log('\n--- Checking ALL content for this user (using creatorUserId column) ---');
    const allUserContentByCreatorQuery = `
      SELECT id, title, description, type, "createdAt", "mediaUrl", "expiresAt", "userId", "creatorUserId"
      FROM contents 
      WHERE "creatorUserId" = $1
      ORDER BY "createdAt" DESC
    `;
    
    const allUserContentByCreatorResult = await client.query(allUserContentByCreatorQuery, [testUserId]);
    console.log(`📄 All content for user (creatorUserId column) - Found ${allUserContentByCreatorResult.rowCount} items:`);
    allUserContentByCreatorResult.rows.forEach(content => {
      console.log(`  - ID: ${content.id}, Type: ${content.type}, Created: ${content.createdAt}, Expires: ${content.expiresAt}, Title: ${content.title}`);
      console.log(`    userId: ${content.userId}, creatorUserId: ${content.creatoruserid}`);
      
      // Check if content is expired
      if (content.expiresAt) {
        const expiresAt = new Date(content.expiresAt);
        const now = new Date();
        if (expiresAt < now) {
          console.log(`    ⚠️  This content expired on ${expiresAt} (${Math.floor((now - expiresAt) / (1000 * 60 * 60 * 24))} days ago)`);
        } else {
          console.log(`    ✅ This content expires on ${expiresAt}`);
        }
      } else {
        console.log(`    ✅ This content has no expiration date`);
      }
    });

    // Check the user's role
    console.log('\n--- Checking user role ---');
    const userQuery = `
      SELECT "userId", email, role, credits
      FROM users 
      WHERE "userId" = $1
    `;
    
    const userResult = await client.query(userQuery, [testUserId]);
    if (userResult.rowCount > 0) {
      const user = userResult.rows[0];
      console.log(`  - User ID: ${user.userId}, Email: ${user.email}, Role: ${user.role}, Credits: ${user.credits}`);
      
      // Check if user has proper role for gallery access
      if (user.role !== 'CREATOR' && user.role !== 'PRO') {
        console.log('⚠️  User does not have proper role for gallery access');
      } else {
        console.log('✅ User has proper role for gallery access');
      }
    } else {
      console.log('❌ User not found');
    }

    // Get the first day of the current month
    const dateFrom = new Date();
    dateFrom.setDate(1);
    dateFrom.setHours(0, 0, 0, 0);

    // Get the current date
    const dateTo = new Date();
    dateTo.setHours(23, 59, 59, 999);

    console.log(`\n📅 Current date range: ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);

    // Test with date restrictions using creatorUserId (actual issue)
    console.log('\n--- Testing Content with Date Filter (using creatorUserId) ---');
    const contentQuery = `
      SELECT id, title, description, type, "createdAt", "mediaUrl", "expiresAt"
      FROM contents 
      WHERE "creatorUserId" = $1 
        AND "createdAt" BETWEEN $2 AND $3
        AND ("expiresAt" > $4 OR "expiresAt" IS NULL)
      ORDER BY "createdAt" DESC
    `;
    
    const contentResult = await client.query(contentQuery, [testUserId, dateFrom, dateTo, new Date()]);
    console.log(`📄 Contents with date filter (creatorUserId) - Found ${contentResult.rowCount} items:`);
    contentResult.rows.forEach(content => {
      console.log(`  - ID: ${content.id}, Type: ${content.type}, Created: ${content.createdAt}, Expires: ${content.expiresAt}, Title: ${content.title}`);
    });

    // Test the gallery service logic with the 30-day filter using creatorUserId
    console.log('\n--- Testing Content with 30-day Filter (using creatorUserId) ---');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentContentQuery = `
      SELECT id, title, description, type, "createdAt", "mediaUrl", "expiresAt"
      FROM contents 
      WHERE "creatorUserId" = $1 
        AND "createdAt" > $2
        AND ("expiresAt" > $3 OR "expiresAt" IS NULL)
      ORDER BY "createdAt" DESC
    `;
    
    const recentContentResult = await client.query(recentContentQuery, [testUserId, thirtyDaysAgo, new Date()]);
    console.log(`📄 Recent contents (last 30 days, creatorUserId) - Found ${recentContentResult.rowCount} items:`);
    recentContentResult.rows.forEach(content => {
      console.log(`  - ID: ${content.id}, Type: ${content.type}, Created: ${content.createdAt}, Expires: ${content.expiresAt}, Title: ${content.title}`);
    });

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`  - Content with userId column: ${allUserContentResult.rowCount} items`);
    console.log(`  - Content with creatorUserId column: ${allUserContentByCreatorResult.rowCount} items`);
    console.log(`  - Recent content (30 days, creatorUserId): ${recentContentResult.rowCount} items`);
    
    if (recentContentResult.rowCount > 0) {
      console.log('✅ Gallery service SHOULD return data when using creatorUserId');
      console.log('❌ But gallery service is currently using userId column, which is NULL');
      console.log('\n🔍 ROOT CAUSE: Data inconsistency - content has creatorUserId but NULL userId');
    } else {
      console.log('⚠️  No recent content found even with creatorUserId filter');
    }

  } catch (error) {
    console.error('❌ Error during gallery logic test:', error);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

// Run the test
testGalleryLogic();