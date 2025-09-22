import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}
  
  @Get('ping')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  ping() {
    return { status: 'ok' };
  }
  
  @Get('db')
  @ApiOperation({ summary: 'Database connection check' })
  @ApiResponse({ status: 200, description: 'Database connection is healthy.' })
  @ApiResponse({ status: 500, description: 'Database connection failed.' })
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