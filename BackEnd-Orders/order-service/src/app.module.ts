import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { OrdersModule } from "./orders/orders.module"
import { InfrastructureModule } from "./infrastructure/infrastructure.module"
import { ClientsModule, Transport } from "@nestjs/microservices"

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
            brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
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

