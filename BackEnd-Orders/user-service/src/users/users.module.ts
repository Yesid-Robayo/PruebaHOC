import { Module } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import { InfrastructureModule } from "../infrastructure/infrastructure.module"

// Command handlers
import { CreateUserHandler } from "./application/commands/handlers/create-user.handler"
import { UpdateUserHandler } from "./application/commands/handlers/update-user.handler"
import { DeleteUserHandler } from "./application/commands/handlers/delete-user.handler"

// Query handlers
import { GetUserByIdHandler } from "./application/queries/handlers/get-user-by-id.handler"
import { GetUserByEmailHandler } from "./application/queries/handlers/get-user-by-email.handler"


// Controllers
import { UsersController } from "./infrastructure/controllers/users.controller"
import { AuthController } from "./infrastructure/controllers/auth.controller"

// Kafka consumers
import { UserVerificationConsumer } from "./infrastructure/messaging/kafka/user-verification.consumer"
import { OrderCreatedConsumer } from "./infrastructure/messaging/kafka/order-consumer.service"
import { OrderStatusChangedConsumer } from "./infrastructure/messaging/kafka/order.status.changed.comsumer.service"

const CommandHandlers = [CreateUserHandler, UpdateUserHandler, DeleteUserHandler]

const QueryHandlers = [GetUserByIdHandler, GetUserByEmailHandler]


@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [UsersController, AuthController, UserVerificationConsumer, OrderCreatedConsumer, OrderStatusChangedConsumer],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class UsersModule {}

