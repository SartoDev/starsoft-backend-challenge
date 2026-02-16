import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionRequest } from './models/request/create-session.request';
import { UpdateSessionRequest } from './models/request/update-session.request';
import { SessionResponse } from './models/response/session.response';

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async get() {
    const response = await this.prismaService.session.findMany({
      include: {
        movie: true,
        room: true,
      },
    });
    return response.map((session) => new SessionResponse(session));
  }

  async findById(id: string) {
    const session = await this.prismaService.session.findUnique({
      where: {
        id,
      },
      include: {
        movie: true,
        room: true,
      },
    });
    if (!session) {
      Logger.error(`Session not found with id: ${id}`, 'SessionService');
      throw new NotFoundException('Session not found');
    }
    return new SessionResponse(session);
  }

  async create(createSessionRequest: CreateSessionRequest) {
    await this.validateMovieAndRoom(createSessionRequest.movieId, createSessionRequest.roomId);
    await this.validateSessionExists(createSessionRequest.hour, createSessionRequest.movieId, createSessionRequest.roomId);
    const session = await this.prismaService.session.create({
      data: {
        ...createSessionRequest,
        hour: new Date(`${new Date().toISOString().split('T')[0]}T${createSessionRequest.hour}:00.000Z`).toISOString(),
      },
      include: {
        movie: true,
        room: true,
      },
    });
    return new SessionResponse(session);
  }

  async update(id: string, updateSessionRequest: UpdateSessionRequest) {
    await this.findById(id);
    await this.validateMovieAndRoom(updateSessionRequest.movieId, updateSessionRequest.roomId);
    await this.validateSessionExists(updateSessionRequest.hour, updateSessionRequest.movieId, updateSessionRequest.roomId);
    const session = await this.prismaService.session.update({
      where: {
        id,
      },
      include: {
        movie: true,
        room: true,
      },
      data: {
        ...updateSessionRequest,
        hour: new Date(`${new Date().toISOString().split('T')[0]}T${updateSessionRequest.hour}:00.000Z`).toISOString(),
      },
    });
    return new SessionResponse(session);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prismaService.session.delete({
      where: {
        id,
      },
    });
    return { message: 'Session deleted successfully' };
  }

  private async validateMovieAndRoom(movieId: string, roomId: string) {
    const movie = await this.prismaService.movie.findUnique({
      where: {
        id: movieId,
      },
    });
    if (!movie) {
      Logger.error(`Movie not found with id: ${movieId}`, 'SessionService');
      throw new NotFoundException('Movie not found');
    }
    const room = await this.prismaService.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!room) {
      Logger.error(`Room not found with id: ${roomId}`, 'SessionService');
      throw new NotFoundException('Room not found');
    }
  }

  private async validateSessionExists(hour: string, movieId: string, roomId: string) {
    const session = await this.prismaService.session.findFirst({
      where: {
        hour: new Date(`${new Date().toISOString().split('T')[0]}T${hour}:00.000Z`).toISOString(),
        movie: { id: movieId },
        room: { id: roomId },
      },
    });
    if (session) {
      Logger.error(
        `Session already exists with movieId: ${movieId} and roomId: ${roomId}`,
        'SessionService',
      );
      throw new NotFoundException('Session already exists');
    }
  }
}
