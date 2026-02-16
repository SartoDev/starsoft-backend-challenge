import { Prisma } from "generated/prisma/client";
import { MovieResponse } from "src/movie/models/response/movie.response";
import { RoomResponse } from "src/room/models/response/room.response";

type SessionWithRelations = Prisma.SessionGetPayload<{
  include: {
    movie: true;
    room: true;
  };
}>;

export class SessionResponse {
  id: string;
  hour: string;
  movie: MovieResponse;
  room: RoomResponse;

  constructor(session: SessionWithRelations) {
    this.id = session.id;
    this.hour = session.hour.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    this.movie = new MovieResponse(session.movie);
    this.room = new RoomResponse(session.room);
  }
}
