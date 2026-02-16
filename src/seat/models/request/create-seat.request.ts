import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSeatRequest {
  @ApiProperty()
  @IsNotEmpty()
  seatNumberList: number[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  value: number;
}
