import { Module } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import { InfrastructureModule } from "../infrastructure/infrastructure.module"

// Command handlers
import { CreateOrderHandler } from "./application/commands/handlers/create-order.handler"
import { UpdateOrderStatusHandler } from "./application/commands/handlers/update-order-status.handler"
import { CancelOrderHandler } from "./application/commands/handlers/cancel-order.handler"

// Query handlers
import { GetOrderByIdHandler } from "./application/queries/handlers/get-order-by-id.handler"
import { GetOrdersByUserIdHandler } from "./application/queries/handlers/get-orders-by-user-id.handler"

// Event handlers
import { OrderCreatedHandler } from "./application/events/handlers/order-created.handler"
import { OrderStatusChangedHandler } from "./application/events/handlers/order-status-changed.handler"

// Controllers
import { OrdersController } from "./infrastructure/controllers/orders.controller"
import { OrdersQueryController } from "./infrastructure/controllers/orders-query.controller"

// Saga
import { OrderSaga } from "./application/sagas/order.saga"
import { KafkaModule } from "src/infrastructure/messaging/kafka/kafka.module"

const CommandHandlers = [CreateOrderHandler, UpdateOrderStatusHandler, CancelOrderHandler]

const QueryHandlers = [GetOrderByIdHandler, GetOrdersByUserIdHandler]

const EventHandlers = [OrderCreatedHandler, OrderStatusChangedHandler]

@Module({
  imports: [CqrsModule, InfrastructureModule, KafkaModule],
  controllers: [OrdersController, OrdersQueryController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers, OrderSaga],
})
export class OrdersModule { }

