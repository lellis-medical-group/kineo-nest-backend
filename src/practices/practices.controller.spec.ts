import { Test, TestingModule } from '@nestjs/testing';
import { PracticesController } from './practices.controller';
import { PracticesService } from './practices.service';

describe('PracticesController', () => {
  let controller: PracticesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticesController],
      providers: [PracticesService],
    }).compile();

    controller = module.get<PracticesController>(PracticesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
