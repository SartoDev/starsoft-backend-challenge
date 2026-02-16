import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateMovieRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    releaseYear: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    genre: string;
}