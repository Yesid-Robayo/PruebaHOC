import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginUserDto {
  @ApiProperty({ description: "User email", example: "user@example.com", default: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string = "user@example.com"

  @ApiProperty({ description: "User password", example: "password123", default: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string = "password123"
}
