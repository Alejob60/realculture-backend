export class MediaStatusDto {
  id: string;
  type: string;
  status: 'valid' | 'expired' | 'uploaded' | 'missing';
  url?: string;
  errorMessage?: string;
}

export class ValidateMediaResponseDto {
  mediaStatus: MediaStatusDto[];
}

export class MergeMediaResponseDto {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  finalMediaUrl?: string;
  sasUrl?: string;
  errorMessage?: string;
  duration?: number;
}