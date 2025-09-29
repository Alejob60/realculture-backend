// Test script to verify blob path extraction
const { ContentUseCase } = require('./dist/application/use-cases/content.use-case');

// Create an instance of the ContentUseCase
const contentUseCase = new ContentUseCase();

// Test the extractBlobPathFromUrl method
const testUrls = [
  'https://realculturestorage.blob.core.windows.net/images/test-image.jpg',
  'https://realculturestorage.blob.core.windows.net/videos/test-video.mp4',
  'https://realculturestorage.blob.core.windows.net/audio/test-audio.mp3',
  'https://realculturestorage.blob.core.windows.net/images/subfolder/test-image.jpg',
  'invalid-url'
];

console.log('Testing blob path extraction:');
testUrls.forEach(url => {
  // We need to access the private method, so let's make it accessible for testing
  const blobPath = contentUseCase['extractBlobPathFromUrl'](url);
  console.log(`URL: ${url}`);
  console.log(`Blob Path: ${blobPath}`);
  console.log('---');
});