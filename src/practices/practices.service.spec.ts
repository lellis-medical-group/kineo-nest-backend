import { Test, TestingModule } from '@nestjs/testing';
import { PracticesService } from './practices.service';

describe('PracticesService', () => {
  let service: PracticesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PracticesService],
    }).compile();

    service = module.get<PracticesService>(PracticesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
