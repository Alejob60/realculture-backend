const { DataSource } = require('typeorm');
const { UserEntity } = require('./dist/domain/entities/user.entity');
const { GeneratedAudioEntity } = require('./dist/domain/entities/generated-audio.entity');

// Create a simple data source to check the schema
const dataSource = new DataSource({
  type: 'postgres',
  host: 'realculture-db.postgres.database.azure.com',
  port: 5432,
  username: 'adminrealculture',
  password: 'Alejob6005901@/',
  database: 'postgres',
  entities: [UserEntity, GeneratedAudioEntity],
  synchronize: false,
  logging: false,
  ssl: true,
});

async function checkSchema() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    // Get table information
    const queryRunner = dataSource.createQueryRunner();
    const audioTable = await queryRunner.getTable('generated_audios');
    const userTable = await queryRunner.getTable('users');
    
    console.log('Generated Audios table columns:');
    audioTable.columns.forEach(column => {
      console.log(`  ${column.name}: ${column.type}`);
    });
    
    console.log('\nUsers table columns:');
    userTable.columns.forEach(column => {
      console.log(`  ${column.name}: ${column.type}`);
    });
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();