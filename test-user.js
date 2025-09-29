const { DataSource } = require('typeorm');
const { User } = require('./dist/domain/entities/user.entity');

// Create a simple data source configuration
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'realculture-db.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'adminrealculture',
  password: process.env.DB_PASSWORD || 'Alejob6005901@/',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' || true,
  entities: [User],
  synchronize: false,
  logging: false
});

async function testUser() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    // Check if user exists
    const userRepository = dataSource.getRepository(User);
    const userId = '20bcd340-8a06-4a2f-be87-fce4fd6b318c';
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found with ID:', userId);
    }
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUser();