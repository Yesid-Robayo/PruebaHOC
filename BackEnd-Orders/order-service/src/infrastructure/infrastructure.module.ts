import { Module } from "@nestjs/common"
import { PrismaModule } from "./persistence/prisma/prisma.module"
import { CircuitBreakerModule } from "./resilience/circuit-breaker/circuit-breaker.module"
import { KafkaModule } from "./messaging/kafka/kafka.module"

@Module({
  imports: [PrismaModule, CircuitBreakerModule, KafkaModule],
  exports: [PrismaModule, CircuitBreakerModule, KafkaModule],
})
export class InfrastructureModule {}

