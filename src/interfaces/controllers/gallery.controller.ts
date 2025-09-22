import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GalleryService } from '../../infrastructure/services/gallery.service';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { GalleryQueryDto } from '../dto/gallery-query.dto';
import { UserRole } from '../../domain/enums/user-role.enum';
import { RequestWithUser } from 'src/types/request-with-user';

@ApiTags('gallery')
@Controller('gallery')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @ApiOperation({ summary: 'Get user gallery (Creator/PRO only)' })
  @ApiQuery({ type: GalleryQueryDto })
  @ApiResponse({ status: 200, description: 'Returns user gallery.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getGallery(@Req() req: RequestWithUser, @Query() query: GalleryQueryDto) {
    const user = req.user;
    
    // Validate user object
    if (!user) {
      this.logger.error('User object is undefined in request');
      throw new BadRequestException('User information is missing from request');
    }
    
    // Validate user ID
    if (!user.id) {
      this.logger.error('User ID is undefined in request');
      throw new BadRequestException('User ID is missing from request');
    }
    
    this.logger.log(`Gallery request received for user: ${user.id}, role: ${user.role}`);
    
    if (user.role !== UserRole.CREATOR && user.role !== UserRole.PRO) {
      this.logger.warn(`User ${user.id} with role ${user.role} attempted to access gallery but was forbidden`);
      throw new ForbiddenException('You do not have permission to access the gallery.');
    }
    
    this.logger.log(`User ${user.id} authorized to access gallery, fetching gallery data`);
    const galleryData = await this.galleryService.getUserGallery(user.id);
    
    this.logger.log(`Gallery data fetched for user ${user.id}. Item count: ${galleryData.length}`);
    this.logger.debug(`Gallery data: ${JSON.stringify(galleryData, null, 2)}`);
    
    return galleryData;
  }
}