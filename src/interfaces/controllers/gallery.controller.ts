import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { GalleryService } from '../../infrastructure/services/gallery.service';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { GalleryQueryDto } from '../dto/gallery-query.dto';
import { UserRole } from 'src/domain/enums/user-role.enum';
import { RequestWithUser } from 'src/types/request-with-user';

@Controller('gallery')
@UseGuards(JwtAuthGuard)
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async getGallery(@Req() req: RequestWithUser, @Query() query: GalleryQueryDto) {
    const user = req.user;
    if (user.role !== UserRole.CREATOR && user.role !== UserRole.PRO) {
      throw new ForbiddenException('You do not have permission to access the gallery.');
    }
    return this.galleryService.getUserGallery(user.id);
  }
}
