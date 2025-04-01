import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { DeleteUserCommand } from "../delete-user.command"
import { Inject, NotFoundException } from "@nestjs/common"
import { USER_REPOSITORY, type UserRepository } from "../../../domain/ports/user.repository.port"
import { UserId } from "../../../domain/value-objects/user-id.value-object"

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const userId = new UserId(command.userId)

    // Find user
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundException(`User with ID ${command.userId} not found`)
    }

    // Delete user
    await this.userRepository.delete(userId)
  }
}

