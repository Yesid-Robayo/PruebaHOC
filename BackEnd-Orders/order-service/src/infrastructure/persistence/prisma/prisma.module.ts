import { Module } from "@nestjs/common"
import { PrismaService } from "./prisma.service"
import { OrderPrismaRepository } from "./repositories/order-prisma.repository"
import { ORDER_REPOSITORY } from "../../../orders/domain/ports/order.repository.port"

@Module({
  providers: [
    PrismaService,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderPrismaRepository,
    },
  ],
  exports: [PrismaService, ORDER_REPOSITORY],
})
export class PrismaModule {}

