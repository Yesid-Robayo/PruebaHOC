import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { GetUserByEmailQuery } from "../get-user-by-email.query"
import { Inject, NotFoundException } from "@nestjs/common"
import { USER_REPOSITORY, type UserRepository } from "../../../domain/ports/user.repository.port"
import { Email } from "../../../domain/value-objects/email.value-object"
import type { UserDto } from "../../dtos/user.dto"
import { UserMapper } from "../../mappers/user.mapper"

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUserByEmailQuery): Promise<UserDto> {
    const email = new Email(query.email)
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new NotFoundException(`User with email ${query.email} not found`)
    }

    return UserMapper.toDto(user)
  }
}

