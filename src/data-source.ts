import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from './domain/entities/user.entity';
import { Content } from './domain/entities/content.entity';

// Carga variables desde .env o .env.production
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // ⚠️ No uses true en producción
  logging: false,
  ssl: process.env.SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [UserEntity, Content],
  migrations: ['src/migrations/*.ts'],
});
