import { ApiProperty } from "@nestjs/swagger"

export class UserDto {
  @ApiProperty({ description: "User ID" })
  id: string

  @ApiProperty({ description: "User email" })
  email: string

  @ApiProperty({ description: "User name" })
  name: string

  @ApiProperty({ description: "User creation date" })
  createdAt: Date

  @ApiProperty({ description: "User password hash" })
  passwordHash: string

  
  @ApiProperty({ description: "User last update date" })
  updatedAt: Date
}

