import {
  Controller,
  Get,
  Body,
  Put,
  Delete,
  Param,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomRequest } from './models/request/create-room.request';
import { UpdateRoomRequest } from './models/request/update-room.request';
import { AuthCookieGuardion } from 'src/common/guards/auth-cookie.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Room')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  get() {
    return this.roomService.get();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.roomService.findById(id);
  }

  @Post()
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: CreateRoomRequest })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(@Body() createRoomRequest: CreateRoomRequest) {
    return this.roomService.create(createRoomRequest);
  }

  @Put(':id')
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: UpdateRoomRequest })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  update(@Param('id') id: string, @Body() updateRoomRequest: UpdateRoomRequest) {
    return this.roomService.update(id, updateRoomRequest);
  }

  @Delete(':id')
  @UseGuards(AuthCookieGuardion)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  delete(@Param('id') id: string) {
    return this.roomService.delete(id);
  }
}
