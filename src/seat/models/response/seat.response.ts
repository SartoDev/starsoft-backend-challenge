import { Seat } from 'generated/prisma/client';

export class SeatResponse {
  id: string;
  seatNumber: number;
  status: string;
  value: number;

  constructor(seat: Seat) {
    this.id = seat.id;
    this.seatNumber = seat.number;
    this.status = seat.status;
    this.value = seat.value.toNumber();
  }
}
