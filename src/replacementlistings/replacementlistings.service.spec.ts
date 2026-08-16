import { Test, TestingModule } from '@nestjs/testing';
import { ReplacementlistingsService } from './replacementlistings.service';

describe('ReplacementlistingsService', () => {
  let service: ReplacementlistingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReplacementlistingsService],
    }).compile();

    service = module.get<ReplacementlistingsService>(ReplacementlistingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
