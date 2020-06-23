import { Test, TestingModule } from '@nestjs/testing';
import { EspGateway } from './esp.gateway';

describe('EspGateway', () => {
  let gateway: EspGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspGateway],
    }).compile();

    gateway = module.get<EspGateway>(EspGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
