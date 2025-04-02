import { Module } from "@nestjs/common"
import { CircuitBreakerService } from "./circuit-breaker.service"

/**
 * The `CircuitBreakerModule` is a NestJS module that provides and exports
 * the `CircuitBreakerService`. This module is responsible for managing
 * circuit breaker functionality, which helps in handling failures gracefully
 * in distributed systems by preventing cascading failures and improving
 * system resilience.
 */
@Module({
  providers: [CircuitBreakerService],
  exports: [CircuitBreakerService],
})
export class CircuitBreakerModule {}

