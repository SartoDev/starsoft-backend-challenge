import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SeatReservationService } from './seat-reservation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SeatReservationController } from './seat-reservation.controller';
import { SeatReservationCron } from './seat-reservation.cron';
import { SeatReservationRetryWorker } from './seat-reservation.retry.worker';
import { SeatReservationWorker } from './seat-reservation.worker';

@Module({
  imports: [JwtModule],
  providers: [SeatReservationService, PrismaService, SeatReservationCron],
  controllers: [SeatReservationController, SeatReservationRetryWorker, SeatReservationWorker],
})
export class SeatReservationModule {}
