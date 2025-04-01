import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"

export class RegisterUserDto {
  @ApiProperty({ description: "User email", default: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string = "user@example.com"

  @ApiProperty({ description: "User name", default: "John Doe" })
  @IsString()
  @IsNotEmpty()
  name: string = "John Doe"

  @ApiProperty({ description: "User password", minLength: 6, default: "password123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string = "password123"
}
