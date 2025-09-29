import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { ValidateMediaDto } from './dtos/validate-media.dto';
import { MergeMediaDto } from './dtos/merge-media.dto';
import { ValidateMediaResponseDto, MergeMediaResponseDto } from './dtos/media-response.dto';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Post('validate-media')
  async validateMedia(
    @Body() validateMediaDto: ValidateMediaDto,
  ): Promise<ValidateMediaResponseDto> {
    this.logger.log('Validating media files');
    
    if (!validateMediaDto.mediaItems || validateMediaDto.mediaItems.length === 0) {
      throw new BadRequestException('No media items provided');
    }
    
    // Extract userId from request (in a real implementation, this would come from the JWT token)
    const userId = validateMediaDto.userId || 'default-user-id';
    
    return this.mediaService.validateMedia(
      validateMediaDto.mediaItems,
      userId,
      validateMediaDto.projectId,
    );
  }

  @Post('merge-media')
  async mergeMedia(
    @Body() mergeMediaDto: MergeMediaDto,
  ): Promise<MergeMediaResponseDto> {
    this.logger.log('Merging media files');
    
    // Validate that at least one media type is provided
    if (!mergeMediaDto.videoId && !mergeMediaDto.audioId && !mergeMediaDto.subtitleId &&
        !mergeMediaDto.videoUrl && !mergeMediaDto.audioUrl && !mergeMediaDto.subtitleUrl) {
      throw new BadRequestException('At least one media item must be provided');
    }
    
    // Extract userId from request (in a real implementation, this would come from the JWT token)
    const userId = mergeMediaDto.userId || 'default-user-id';
    
    return this.mediaService.mergeMedia(
      mergeMediaDto.videoId || '',
      mergeMediaDto.audioId || '',
      mergeMediaDto.subtitleId || '',
      mergeMediaDto.videoUrl || '',
      mergeMediaDto.audioUrl || '',
      mergeMediaDto.subtitleUrl || '',
      userId,
      mergeMediaDto.projectId,
    );
  }
}