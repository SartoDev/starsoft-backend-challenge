import { Test, TestingModule } from '@nestjs/testing';
import { SeatReservationService } from './seat-reservation.service';

describe('SeatReservationService', () => {
  let service: SeatReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeatReservationService],
    }).compile();

    service = module.get<SeatReservationService>(SeatReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
