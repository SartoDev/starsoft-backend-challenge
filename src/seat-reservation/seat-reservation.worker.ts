import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import type { PreReservationRequestEvent } from './models/pre-reservation-event';
import { RedisService } from 'src/redis/redis.service';
import { ReservationStatus, SeatStatus } from 'generated/prisma/enums';

@Controller()
export class SeatReservationWorker {
  private readonly logger = new Logger(SeatReservationWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,
    private readonly redisService: RedisService,
  ) {}

  @EventPattern('seat.pre-reservation.requested')
  async handle(@Payload() payload: PreReservationRequestEvent) {
    const event = payload;
    this.logger.log('Received event:', payload);

    try {
      const alreadyProcessed = await this.prisma.seatReservation.findFirst({
        where: { seatId: event.seatId, requestId: event.requestId },
      });

      if (alreadyProcessed) {
        return;
      }

      const expiresAt = new Date(Date.now() + event.expiresInSeconds * 1000);

      await this.prisma.seat.update({
        where: { id: event.seatId, sessionId: event.sessionId },
        data: {
          status: SeatStatus.BOOKING,
        },
      });

      await this.prisma.seatReservation.create({
        data: {
          requestId: event.requestId,
          seatId: event.seatId,
          userId: event.userId,
          expiresAt,
          status: ReservationStatus.PENDING,
        },
      });
    } catch (err: any) {
      this.logger.error(err);
      await this.redisService.releaseSeatLock(event.sessionId, event.seatId);

      if (err?.code === 'P2002') {
        this.kafka.emit('seat.pre-reservation.failed', {
          key: event.seatId,
          value: {
            requestId: event.requestId,
            seatId: event.seatId,
            userId: event.userId,
            reason: 'SEAT_ALREADY_RESERVED',
          },
        });

        return;
      }

      await this.sendToRetry(event);
    }
  }

  private async sendToRetry(event: PreReservationRequestEvent) {
    const maxAttempts = 5;

    if (event.attempt >= maxAttempts) {
      this.kafka.emit('seat.pre-reservation.dlq', {
        key: event.seatId,
        value: {
          ...event,
          reason: 'MAX_RETRIES_REACHED',
        },
      });
      return;
    }

    this.kafka.emit('seat.pre-reservation.retry', {
      key: event.seatId,
      value: {
        ...event,
        attempt: event.attempt + 1,
      },
    });
  }
}
