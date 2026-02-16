import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SeatResponse } from './models/response/seat.response';
import { CreateSeatRequest } from './models/request/create-seat.request';
import { ReservationStatus, SeatStatus } from 'generated/prisma/enums';
import { UpdateSeatRequest } from './models/request/update-seat.request';

@Injectable()
export class SeatService {
  constructor(private readonly prismaService: PrismaService) {}

  async get() {
    const response = await this.prismaService.seat.findMany({
      include: {
        session: true,
      },
    });
    return response.map((seat) => new SeatResponse(seat));
  }

  async getAvailableSeats(sessionId: string) {
    const seats = await this.prismaService.seat.findMany({
      where: {
        sessionId,
        status: SeatStatus.FREE,
      },
      include: {
        session: true,
      },
      orderBy: {
        number: 'asc',
      }
    });
    return seats.map((seat) => new SeatResponse(seat));
  }

  async findById(id: string) {
    const seat = await this.prismaService.seat.findUnique({
      where: {
        id,
      },
      include: {
        session: true,
      },
    });
    if (!seat) {
      Logger.error(`Seat not found with id: ${id}`, 'SeatService');
      throw new NotFoundException('Seat not found');
    }
    return new SeatResponse(seat);
  }

  async create(createSeatRequest: CreateSeatRequest) {
    const seatList: SeatResponse[] = [];
    for (const seatNumber of createSeatRequest.seatNumberList) {
      await this.checkIfSeatAlreadyExists(seatNumber);
      const seat = await this.prismaService.seat.create({
        data: {
          sessionId: createSeatRequest.sessionId,
          number: seatNumber,
          status: SeatStatus.FREE,
          value: createSeatRequest.value,
        },
        include: {
          session: true,
        },
      });
      seatList.push(new SeatResponse(seat));
    }
    return seatList;
  }

  async update(id: string, updateSeatRequest: UpdateSeatRequest) {
    await this.findById(id);
    const seat = await this.prismaService.seat.update({
      where: {
        id,
      },
      include: {
        session: true,
      },
      data: {
        sessionId: updateSeatRequest.sessionId,
        number: updateSeatRequest.seatNumber,
        status: updateSeatRequest.status as SeatStatus,
        value: updateSeatRequest.value,
      },
    });
    return new SeatResponse(seat);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prismaService.seat.delete({
      where: {
        id,
      },
    });
    return { message: 'Seat deleted successfully' };
  }

  private async checkIfSeatAlreadyExists(seatNumber: number) {
    const seat = await this.prismaService.seat.findFirst({
      where: {
        number: seatNumber,
      },
    });
    if (seat) {
      throw new ConflictException(`Seat with number ${seatNumber} already exists`);
    }
  }
}
