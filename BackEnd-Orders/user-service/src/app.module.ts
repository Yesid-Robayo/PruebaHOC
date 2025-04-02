import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { UsersModule } from "./users/users.module"
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
            clientId: "user-service",
            brokers: [process.env.KAFKA_BROKERS || "kafka:9092"],
          },
          consumer: {
            groupId: "user-consumer",
          },
        },
      },
    ]),

    // Application modules
    UsersModule,
    InfrastructureModule,
  ],
})
export class AppModule {}

