import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupRequest {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;
}
