import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { OrdersModule } from "./orders/orders.module"
import { InfrastructureModule } from "./infrastructure/infrastructure.module"
import { ClientsModule, Transport } from "@nestjs/microservices"

/**
 * The main application module for the order service.
 *
 * This module sets up the following:
 * - **Environment Variables**: Loads environment variables globally using `ConfigModule`.
 * - **Kafka Client**: Configures a Kafka client for inter-service communication using `ClientsModule`.
 *   - The Kafka client is identified by `clientId: "order-service"`.
 *   - Brokers are specified via the `KAFKA_BROKERS` environment variable or default to `kafka:9092`.
 *   - A consumer group is defined with `groupId: "order-consumer"`.
 *   - Auto-topic creation is enabled for the producer.
 * - **Application Modules**: Imports `OrdersModule` and `InfrastructureModule` for the core functionality of the service.
 */
@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Kafka client for communication with other services
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "order-service",
            brokers: [process.env.KAFKA_BROKERS || "kafka:9092"],
          },
          consumer: {
            groupId: "order-consumer",
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),

    // Application modules
    OrdersModule,
    InfrastructureModule,
  ],
})
export class AppModule {}

