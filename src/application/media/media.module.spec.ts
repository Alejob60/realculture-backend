import { Test, TestingModule } from '@nestjs/testing';
import { MediaProcessingModule } from './media.module';

describe('MediaProcessingModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MediaProcessingModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});