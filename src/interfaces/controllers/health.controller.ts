import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('db')
  async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: '✅ Conectado a la base de datos correctamente' };
    } catch (error) {
      return {
        status: '❌ Error de conexión',
        error: error.message,
      };
    }
  }
}
