import { Injectable } from "@nestjs/common"
import  { PrismaService } from "../prisma.service"
import type { UserRepository } from "../../../../users/domain/ports/user.repository.port"
import type { User } from "../../../../users/domain/entities/user.entity"
import { UserMapper } from "../mappers/user.mapper"
import type { UserId } from "../../../../users/domain/value-objects/user-id.value-object"
import type { Email } from "../../../../users/domain/value-objects/email.value-object"

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(user: User): Promise<User> {
    const userData = UserMapper.toPersistence(user)

    const savedUser = await this.prismaService.user.upsert({
      where: { id: userData.id },
      update: userData,
      create: userData,
    })

    return UserMapper.toDomain(savedUser)
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id: id.value },
    })

    if (!user) return null

    return UserMapper.toDomain(user)
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email: email.value },
    })

    if (!user) return null
    return UserMapper.toDomain(user)
  }

  async delete(id: UserId): Promise<void> {
    await this.prismaService.user.delete({
      where: { id: id.value },
    })
  }
}

