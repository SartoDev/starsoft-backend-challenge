import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoomRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}