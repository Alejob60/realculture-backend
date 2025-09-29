import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedAudioRepository } from './generated-audio.repository';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';

describe('GeneratedAudioRepository', () => {
  let repository: GeneratedAudioRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [GeneratedAudioEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([GeneratedAudioEntity]),
      ],
      providers: [GeneratedAudioRepository],
    }).compile();

    repository = module.get<GeneratedAudioRepository>(GeneratedAudioRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});