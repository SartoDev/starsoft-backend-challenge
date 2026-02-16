import { SeatReservation } from 'generated/prisma/client';

export class SeatReservationResponse {
  id: string;
  seatId: string;
  userId: string;
  status: string;

  constructor(seatReservation: SeatReservation) {
    this.id = seatReservation.id;
    this.seatId = seatReservation.seatId;
    this.userId = seatReservation.userId;
    this.status = seatReservation.status;
  }
}
