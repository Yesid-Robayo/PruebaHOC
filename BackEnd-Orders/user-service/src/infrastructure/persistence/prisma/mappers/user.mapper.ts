import type { User as PrismaUser } from "@prisma/client"
import { User } from "../../../../users/domain/entities/user.entity"
import { UserId } from "../../../../users/domain/value-objects/user-id.value-object"
import { Email } from "../../../../users/domain/value-objects/email.value-object"

export class UserMapper {
  static toDomain(persistenceUser: PrismaUser): User {
    return new User({
      id: new UserId(persistenceUser.id),
      email: new Email(persistenceUser.email),
      name: persistenceUser.name,
      passwordHash: persistenceUser.passwordHash,
      createdAt: persistenceUser.createdAt,
      updatedAt: persistenceUser.updatedAt,
    })
  }

  static toPersistence(domainUser: User): PrismaUser {
    return {
      id: domainUser.id.value,
      email: domainUser.email.value,
      name: domainUser.name,
      passwordHash: domainUser.passwordHash,
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt,
    }
  }
}

