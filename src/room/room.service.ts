import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomResponse } from './models/response/room.response';
import { CreateRoomRequest } from './models/request/create-room.request';
import { UpdateRoomRequest } from './models/request/update-room.request';

@Injectable()
export class RoomService {
  constructor(private readonly prismaService: PrismaService) {}
    
  async get() {
    const response = await this.prismaService.room.findMany();
    return response.map((room) => new RoomResponse(room));
  }

  async findById(id: string) {
    const room = await this.prismaService.room.findUnique({
      where: {
        id,
      },
    });
    if (!room) {
      Logger.error(`Room not found with id: ${id}`, 'RoomService');
      throw new NotFoundException('Room not found');
    }
    return new RoomResponse(room);
  }

  async create(createRoomRequest: CreateRoomRequest) {
    await this.roomAlreadyExists(createRoomRequest.name);
    const room = await this.prismaService.room.create({
      data: createRoomRequest,
    });
    return new RoomResponse(room);
  }

  async update(id: string, updateRoomRequest: UpdateRoomRequest) {
    await this.findById(id);
    const room = await this.prismaService.room.update({
      where: {
        id,
      },
      data: updateRoomRequest,
    });
    return new RoomResponse(room);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prismaService.room.delete({
      where: {
        id,
      },
    });
    return { message: 'Room deleted successfully' };
  }

  private async roomAlreadyExists(name: string) {
    const room = await this.prismaService.room.findUnique({
      where: {
        name,
      },
    });
    if (room) {
      Logger.error(`Room with this name already exists: ${name}`, 'RoomService');
      throw new ConflictException('Room already exists');
    }
  }
}
