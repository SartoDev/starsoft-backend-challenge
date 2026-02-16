import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReserveSeatReservationRequest {
  @ApiProperty()
  @IsNotEmpty()
  seatIdList: string[];
}
