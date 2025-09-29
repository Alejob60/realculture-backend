import {
  Controller,
  Delete,
  UseGuards,
  Query,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DataCleanupService } from '../../infrastructure/services/data-cleanup.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('data-cleanup')
@Controller('data-cleanup')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataCleanupController {
  private readonly logger = new Logger(DataCleanupController.name);

  constructor(private readonly dataCleanupService: DataCleanupService) {}

  @Delete('old-content')
  @ApiOperation({ summary: 'Remove old content (Admin only)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to keep content (default: 30)' })
  @ApiResponse({ status: 200, description: 'Old content removed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async removeOldContent(@Query('days') days?: number) {
    try {
      // In a real implementation, you would check if the user is an admin
      // For now, we'll just log that this endpoint was called
      this.logger.warn('Manual cleanup endpoint called - in production this should be admin-only');
      
      const removedCount = await this.dataCleanupService.removeOldContent(days);
      
      return {
        status: 'success',
        message: `Successfully removed ${removedCount} old content items`,
        removedCount,
      };
    } catch (error) {
      this.logger.error('Error removing old content:', error);
      throw new HttpException(
        'Failed to remove old content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}