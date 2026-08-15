import { Test, TestingModule } from '@nestjs/testing';
import { ReplacementlistingsController } from './replacementlistings.controller';
import { ReplacementlistingsService } from './replacementlistings.service';

describe('ReplacementlistingsController', () => {
  let controller: ReplacementlistingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplacementlistingsController],
      providers: [ReplacementlistingsService],
    }).compile();

    controller = module.get<ReplacementlistingsController>(ReplacementlistingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
