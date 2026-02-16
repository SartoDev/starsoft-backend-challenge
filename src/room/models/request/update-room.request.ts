import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateRoomRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}