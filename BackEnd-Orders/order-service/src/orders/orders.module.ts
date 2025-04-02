import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { KafkaModule } from "src/infrastructure/messaging/kafka/kafka.module";

// Command handlers
import { CreateOrderHandler } from "./application/commands/handlers/create-order.handler";
import { UpdateOrderStatusHandler } from "./application/commands/handlers/update-order-status.handler";
import { CancelOrderHandler } from "./application/commands/handlers/cancel-order.handler";

// Query handlers
import { GetOrderByIdHandler } from "./application/queries/handlers/get-order-by-id.handler";
import { GetOrdersByUserIdHandler } from "./application/queries/handlers/get-orders-by-user-id.handler";

// Event handlers
import { OrderCreatedHandler } from "./application/events/handlers/order-created.handler";
import { OrderStatusChangedHandler } from "./application/events/handlers/order-status-changed.handler";

// Controllers
import { OrdersController } from "./infrastructure/controllers/orders.controller";
import { OrdersQueryController } from "./infrastructure/controllers/orders-query.controller";

// Saga
import { OrderSaga } from "./application/sagas/order.saga";

/**
 * Array of all command handlers for the orders domain
 */
const CommandHandlers = [
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler
];

/**
 * Array of all query handlers for the orders domain
 */
const QueryHandlers = [
  GetOrderByIdHandler,
  GetOrdersByUserIdHandler
];

/**
 * Array of all event handlers for the orders domain
 */
const EventHandlers = [
  OrderCreatedHandler,
  OrderStatusChangedHandler
];

/**
 * Orders Module - The main module for order-related functionality
 * 
 * @remarks
 * This module organizes all order-related components following CQRS pattern:
 * - Command handlers for write operations
 * - Query handlers for read operations
 * - Event handlers for reacting to domain events
 * - Sagas for complex workflows
 * 
 * @example
 * ```typescript
 * // Importing the module in another module
 * @Module({
 *   imports: [OrdersModule]
 * })
 * export class SomeOtherModule {}
 * ```
 */
@Module({
  imports: [
    CqrsModule, // Required for CQRS pattern
    InfrastructureModule, // Shared infrastructure dependencies
    KafkaModule // For event publishing
  ],
  controllers: [
    OrdersController, // Command endpoints (write operations)
    OrdersQueryController // Query endpoints (read operations)
  ],
  providers: [
    ...CommandHandlers, // All command handlers
    ...QueryHandlers, // All query handlers
    ...EventHandlers, // All event handlers
    OrderSaga // Long-running business processes
  ],
  exports: [
    // Export any providers that need to be available to other modules
    CqrsModule
  ]
})
export class OrdersModule {}