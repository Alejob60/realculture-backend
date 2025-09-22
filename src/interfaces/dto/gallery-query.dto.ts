import { ApiProperty } from '@nestjs/swagger';

export class GalleryQueryDto {
  @ApiProperty({ 
    required: false, 
    description: 'Filter by content type',
    enum: ['image', 'audio', 'video', 'text', 'other']
  })
  type?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Page number for pagination',
    example: 1
  })
  page?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Number of items per page',
    example: 10
  })
  limit?: number;
}