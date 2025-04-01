import { CommandHandler,  EventPublisher,  ICommandHandler } from "@nestjs/cqrs"
import { CreateUserCommand } from "../create-user.command"
import { Inject } from "@nestjs/common"
import { USER_REPOSITORY,  UserRepository } from "../../../domain/ports/user.repository.port"
import { User } from "../../../domain/entities/user.entity"
import { UserId } from "../../../domain/value-objects/user-id.value-object"
import { Email } from "../../../domain/value-objects/email.value-object"
import { v4 as uuidv4 } from "uuid"
import  { AuthService } from "../../../../infrastructure/auth/auth.service"
import { ConflictException } from "@nestjs/common"

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    // Check if user with email already exists
    const email = new Email(command.email)
    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser) {
      throw new ConflictException(`User with email ${command.email} already exists`)
    }

    // Hash password
    const passwordHash = await this.authService.hashPassword(command.password)

    // Create user
    const userId = new UserId(uuidv4())

    // Create and publish domain events
    const user = this.eventPublisher.mergeObjectContext(User.create(userId, email, command.name, passwordHash))

    // Save user
    await this.userRepository.save(user)

    // Commit events to the event bus
    user.commit()

    return userId.value
  }
}

