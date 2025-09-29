import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Content } from '../../domain/entities/content.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DataCleanupService {
  private readonly logger = new Logger(DataCleanupService.name);

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  /**
   * Removes content older than the specified number of days
   * @param days Number of days to keep content
   */
  async removeOldContent(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    this.logger.log(`Removing content older than ${days} days (before ${cutoffDate.toISOString()})`);

    try {
      const result = await this.contentRepository.delete({
        createdAt: LessThan(cutoffDate),
      });

      this.logger.log(`Successfully removed ${result.affected} old content items`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Error removing old content:', error);
      throw error;
    }
  }

  /**
   * Removes content older than the specified date
   * @param date Date before which content should be removed
   */
  async removeContentBeforeDate(date: Date): Promise<number> {
    this.logger.log(`Removing content older than ${date.toISOString()}`);

    try {
      const result = await this.contentRepository.delete({
        createdAt: LessThan(date),
      });

      this.logger.log(`Successfully removed ${result.affected} old content items`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Error removing old content:', error);
      throw error;
    }
  }

  /**
   * Scheduled task to automatically clean up old content
   * Runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldData() {
    this.logger.log('Starting scheduled cleanup of old data');
    try {
      // Remove content older than 30 days
      const removedCount = await this.removeOldContent(30);
      this.logger.log(`Scheduled cleanup completed. Removed ${removedCount} old content items`);
    } catch (error) {
      this.logger.error('Scheduled cleanup failed:', error);
    }
  }
}