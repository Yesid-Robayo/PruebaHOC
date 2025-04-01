import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { GetUserByIdQuery } from "../get-user-by-id.query"
import { Inject, NotFoundException } from "@nestjs/common"
import { USER_REPOSITORY, type UserRepository } from "../../../domain/ports/user.repository.port"
import { UserId } from "../../../domain/value-objects/user-id.value-object"
import type { UserDto } from "../../dtos/user.dto"
import { UserMapper } from "../../mappers/user.mapper"

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    const userId = new UserId(query.userId)
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`)
    }

    return UserMapper.toDto(user)
  }
}

