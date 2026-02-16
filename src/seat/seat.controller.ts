import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SeatService } from './seat.service';
import { CreateSeatRequest } from './models/request/create-seat.request';
import { UpdateSeatRequest } from './models/request/update-seat.request';
import { AuthCookieGuardion } from 'src/common/guards/auth-cookie.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Seat')
@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get()
  get() {
    return this.seatService.get();
  }

  @Get('available-seats')
  getAvailableSeats(@Query('sessionId') sessionId: string) {
    return this.seatService.getAvailableSeats(sessionId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.seatService.findById(id);
  }

  @Post()
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: CreateSeatRequest })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(@Body() createSeatRequest: CreateSeatRequest) {
    return this.seatService.create(createSeatRequest);
  }

  @Put(':id')
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: UpdateSeatRequest })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  update(@Param('id') id: string, @Body() updateSeatRequest: UpdateSeatRequest) {
    return this.seatService.update(id, updateSeatRequest);
  }

  @Delete(':id')
  @UseGuards(AuthCookieGuardion)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  delete(@Param('id') id: string) {
    return this.seatService.delete(id);
  }
}
