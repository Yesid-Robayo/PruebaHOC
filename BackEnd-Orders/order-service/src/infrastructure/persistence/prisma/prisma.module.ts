import { Module } from "@nestjs/common"
import { PrismaService } from "./prisma.service"
import { OrderPrismaRepository } from "./repositories/order-prisma.repository"
import { ORDER_REPOSITORY } from "../../../orders/domain/ports/order.repository.port"

/**
 * The `PrismaModule` is a NestJS module that provides and exports the necessary
 * services and repositories for interacting with the Prisma ORM.
 *
 * @module PrismaModule
 *
 * @description
 * This module includes the `PrismaService` for database interactions and binds
 * the `ORDER_REPOSITORY` token to the `OrderPrismaRepository` implementation.
 * It ensures that these dependencies are available for injection in other modules.
 *
 * @providers
 * - `PrismaService`: A service for managing Prisma database operations.
 * - `ORDER_REPOSITORY`: A token provided with the `OrderPrismaRepository` implementation.
 *
 * @exports
 * - `PrismaService`: To allow other modules to use Prisma database operations.
 * - `ORDER_REPOSITORY`: To enable other modules to access the order repository.
 */
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

