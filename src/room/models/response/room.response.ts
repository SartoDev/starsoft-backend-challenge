import { Room } from "generated/prisma/client";

export class RoomResponse {
  id: string;
  name: string;

  constructor(room: Room) {
    this.id = room.id;
    this.name = room.name;
  }
}
