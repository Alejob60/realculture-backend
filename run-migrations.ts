import AppDataSource from './src/data-source';

async function runMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('DataSource initialized successfully');
    
    const pendingMigrations = await AppDataSource.showMigrations();
    console.log('Pending migrations:', pendingMigrations);
    
    await AppDataSource.runMigrations();
    console.log('Migrations executed successfully');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

runMigrations();