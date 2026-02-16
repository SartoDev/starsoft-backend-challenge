import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSeatRequest {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  seatNumber: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
