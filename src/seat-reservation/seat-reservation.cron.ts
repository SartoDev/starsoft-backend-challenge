import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeatReservationCron {
  private readonly logger = new Logger(SeatReservationCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/15 * * * * *')
  async expireOldReservations() {
    const now = new Date();

    const result = await this.prisma.seatReservation.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    if(result.count === 0) {
      return;
    }

    await this.prisma.seat.updateMany({
      where: {
        status: 'BOOKING',
      },
      data: {
        status: 'FREE',
      },
    });

    if (result.count > 0) {
      this.logger.log(`Seats expired: ${result.count}`);
    }
  }
}
