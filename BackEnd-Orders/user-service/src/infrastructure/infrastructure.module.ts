import { Module } from "@nestjs/common"
import { PrismaModule } from "./persistence/prisma/prisma.module"
import { KafkaModule } from "./messaging/kafka/kafka.module"
import { ResendModule } from "./notifications/resend/resend.module"
import { AuthModule } from "./auth/auth.module"

@Module({
  imports: [PrismaModule, KafkaModule, ResendModule, AuthModule],
  exports: [PrismaModule, KafkaModule, ResendModule, AuthModule],
})
export class InfrastructureModule {}

