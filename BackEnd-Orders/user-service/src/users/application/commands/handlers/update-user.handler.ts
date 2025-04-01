import { CommandHandler,  EventPublisher,  ICommandHandler } from "@nestjs/cqrs"
import { UpdateUserCommand } from "../update-user.command"
import { Inject, NotFoundException } from "@nestjs/common"
import { USER_REPOSITORY,  UserRepository } from "../../../domain/ports/user.repository.port"
import { UserId } from "../../../domain/value-objects/user-id.value-object"

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const userId = new UserId(command.userId)

    // Find user
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundException(`User with ID ${command.userId} not found`)
    }

    // Merge with event publisher to track and publish events
    const userWithEvents = this.eventPublisher.mergeObjectContext(user)

    // Update user
    userWithEvents.update(command.name)

    // Save updated user
    await this.userRepository.save(userWithEvents)

    // Commit events to the event bus
    userWithEvents.commit()
  }
}

