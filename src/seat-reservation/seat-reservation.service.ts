import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ReservationStatus, SeatStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { SeatReservationResponse } from './models/response/seat-reservation.response';
import { randomUUID } from 'crypto';
import { ClientKafka } from '@nestjs/microservices';
import { PreReservationRequestEvent } from './models/pre-reservation-event';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SeatReservationService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async getUserReservations(userId: string) {
    const seatReservedList = await this.prismaService.seatReservation.findMany({
      where: {
        userId: userId,
      },
    });
    return seatReservedList.map((seatReserved) => new SeatReservationResponse(seatReserved));
  }

  async preReservation(seatIdList: string[], userId: string) {
    const requestId = randomUUID();
    for (const id of seatIdList) {
      const seat = await this.checkIfSeatIsAvailable(id);

      const locked = await this.redisService.setSeatLock({
        sessionId: seat.sessionId,
        seatId: seat.id,
        userId: userId,
        ttlSeconds: 30,
      });

      if (!locked) {
        this.kafkaClient.emit('seat.pre-reservation.failed', {
          key: id,
          value: {
            requestId: requestId,
            seatId: id,
            userId: userId,
            reason: 'SEAT_BOOKING',
          },
        });
        Logger.log('Seat is currently booking:', id);
        continue;
      }

      const payload: PreReservationRequestEvent = {
        requestId: requestId,
        seatId: id,
        userId,
        expiresInSeconds: 30,
        createdAt: new Date().toISOString(),
        attempt: 0,
        sessionId: seat.sessionId,
      };

      this.kafkaClient.emit('seat.pre-reservation.requested', {
        key: id,
        value: payload,
      });
    }
    return {
      message: 'Pre reservation requested successfully',
      requestId: requestId,
    };
  }

  async confirmReservation(requestId: string, userId: string) {
    const seatReservation = await this.prismaService.seatReservation.findMany({
      where: {
        requestId,
      },
    });
    if (!seatReservation || seatReservation.length === 0) {
      Logger.error(`Seat reservation not found with requestId: ${requestId}`, 'SeatService');
      throw new NotFoundException('Seat reservation not found');
    }
    for (const reservation of seatReservation) {
      if (reservation.expiresAt < new Date()) {
        Logger.error(`Seat reservation is expired requestId: ${requestId}`, 'SeatService');
        throw new HttpException('Seat reservation is expired', 400);
      }
      if (reservation.userId !== userId) {
        Logger.error(
          `Seat reservation does not belong to user requestId: ${requestId}, userId: ${userId}`,
          'SeatService',
        );
        throw new HttpException('Seat reservation does not belong to user', 400);
      }
      if (reservation.status !== ReservationStatus.PENDING) {
        Logger.error(`Reservation already finished requestId: ${requestId}`, 'SeatService');
        throw new HttpException('Reservation already finished', 400);
      }
      await this.prismaService.seatReservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: ReservationStatus.CONFIRMED,
        },
      });
      await this.prismaService.seat.update({
        where: {
          id: reservation.seatId,
        },
        data: {
          status: SeatStatus.RESERVED,
        },
      });
    }

    this.kafkaClient.emit('seat.pre-reservation.confirmed', {
      key: requestId,
      value: {
        userId: userId,
      },
    });
    return { message: 'Seat reservation confirmed successfully' };
  }

  private async checkIfSeatIsAvailable(seatId: string) {
    const seat = await this.prismaService.seat.findUnique({
      where: {
        id: seatId,
      },
    });
    if (!seat) {
      Logger.error(`Seat not found with id: ${seatId}`, 'SeatService');
      throw new NotFoundException('Seat not found');
    }
    if (seat.status !== SeatStatus.FREE) {
      Logger.error(`Seat is not available with id: ${seatId}`, 'SeatService');
      throw new ConflictException('Seat is not available');
    }
    return seat;
  }
}
