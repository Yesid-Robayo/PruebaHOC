import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class UpdateUserDto {
  @ApiProperty({ description: "User name", default: "Updated User" })
  @IsString()
  @IsNotEmpty()
  name: string = "Updated User"
}
