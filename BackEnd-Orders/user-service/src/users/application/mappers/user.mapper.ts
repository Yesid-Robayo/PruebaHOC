import type { User } from "../../domain/entities/user.entity"
import type { UserDto } from "../dtos/user.dto"

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}

