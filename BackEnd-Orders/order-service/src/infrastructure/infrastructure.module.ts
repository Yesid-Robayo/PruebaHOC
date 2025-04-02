import { Module } from "@nestjs/common"
import { PrismaModule } from "./persistence/prisma/prisma.module"
import { CircuitBreakerModule } from "./resilience/circuit-breaker/circuit-breaker.module"
import { KafkaModule } from "./messaging/kafka/kafka.module"

/**
 * The `InfrastructureModule` is a NestJS module that provides and manages
 * the infrastructure-level dependencies for the application. This module
 * imports and exports the following modules:
 *
 * - `PrismaModule`: Handles database interactions using Prisma ORM.
 * - `CircuitBreakerModule`: Provides circuit breaker functionality for
 *   fault tolerance and resilience.
 * - `KafkaModule`: Manages Kafka integration for message-based communication.
 *
 * By exporting these modules, `InfrastructureModule` ensures that they
 * are available for use in other parts of the application.
 */
@Module({
  imports: [PrismaModule, CircuitBreakerModule, KafkaModule],
  exports: [PrismaModule, CircuitBreakerModule, KafkaModule],
})
export class InfrastructureModule {}

