export type PreReservationRequestEvent = {
  requestId: string;
  seatId: string;
  userId: string;
  expiresInSeconds: number;
  createdAt: string;
  attempt: number;
  sessionId: string;
};
