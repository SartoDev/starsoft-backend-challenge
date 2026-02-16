import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateSeatRequest {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  seatNumber: number;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
