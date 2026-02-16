import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionRequest {
  @ApiProperty()
  @IsNotEmpty()
  hour: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  movieId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  roomId: string;
}
