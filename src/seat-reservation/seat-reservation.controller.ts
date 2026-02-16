import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SeatReservationService } from './seat-reservation.service';
import { ReserveSeatReservationRequest } from './models/request/reserve-seat-reservation.request';
import { AuthCookieGuardion } from 'src/common/guards/auth-cookie.guard';
import { ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Usr } from 'src/common/user.decorator';
import type { User } from 'generated/prisma/client';

@Controller('seat-reservations')
export class SeatReservationController {
  constructor(private readonly seatReservationService: SeatReservationService) {}

  @Get('user-reservations')
  @UseGuards(AuthCookieGuardion)
  @HttpCode(HttpStatus.OK)
  getUserReservations(@Usr() user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.seatReservationService.getUserReservations(user.id);
  }

  @Post('pre-reservation')
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: ReserveSeatReservationRequest })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  preReservation(@Body() request: ReserveSeatReservationRequest, @Usr() user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.seatReservationService.preReservation(request.seatIdList, user.id);
  }

  @Post('confirm-reservation/:id')
  @UseGuards(AuthCookieGuardion)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  confirmReservation(@Param('id') id: string, @Usr() user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.seatReservationService.confirmReservation(id, user.id);
  }
}
