// src/infrastructure/database/postgres.pool.ts
import { Pool } from 'pg';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostgresPool {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  // Puedes agregar métodos para transacciones si quieres
}
