export interface ImageResult {
  signedUrl: string;
  imageUrl: string;
  fileName: string;
}

export interface ImageResponse {
  type: string;
  signedUrl: string;
  imageUrl: string;
  fileName: string;
  prompt: string;
}

export interface DualImageResult {
  images: ImageResponse[];
  dualImageMode: boolean;
}

export interface SingleImageResult {
  signedUrl: string;
  imageUrl: string;
  fileName: string;
  prompt: string;
  useFlux: boolean;
}