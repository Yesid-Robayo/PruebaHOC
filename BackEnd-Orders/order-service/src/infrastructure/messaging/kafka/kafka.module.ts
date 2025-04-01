import { Module, OnModuleInit } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { KafkaProducerService } from "./kafka-producer.service";
import { ORDER_EVENT_PUBLISHER } from "src/orders/domain/ports/order-event.publisher.port";
import { OrderEventPublisher } from "./publishers/order-event.publisher";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "KAFKA_PRODUCER",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "order-producer",
            brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
          },
          consumer: {
            groupId: "order-consumer-group", // Ensure this is unique per service
            allowAutoTopicCreation: true, // Allow auto creation of topics
          },
          subscribe: {
            fromBeginning: true, // Start consuming from the beginning of the topic
          },
          
        },
      },
    ]),
  ],
  providers: [
    KafkaProducerService,
    {
      provide: "KAFKA_SERVICE",
      useClass: KafkaProducerService,
    },
    {
      provide: ORDER_EVENT_PUBLISHER,
      useClass: OrderEventPublisher,
    },
  ],
  exports: [KafkaProducerService, ORDER_EVENT_PUBLISHER, "KAFKA_SERVICE"],
})
export class KafkaModule {}