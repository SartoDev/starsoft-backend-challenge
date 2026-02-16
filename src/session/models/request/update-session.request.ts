import { IsNotEmpty, IsString } from "class-validator";

export class UpdateSessionRequest {
  @IsNotEmpty()
  hour: string;

  @IsNotEmpty()
  @IsString()
  movieId: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
