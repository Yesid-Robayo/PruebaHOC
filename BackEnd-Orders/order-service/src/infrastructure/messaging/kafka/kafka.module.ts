import { Module, OnModuleInit } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { KafkaProducerService } from "./kafka-producer.service";
import { ORDER_EVENT_PUBLISHER } from "src/orders/domain/ports/order-event.publisher.port";
import { OrderEventPublisher } from "./publishers/order-event.publisher";

/**
 * KafkaModule is a NestJS module that configures Kafka messaging for the order service.
 * It sets up a Kafka producer and consumer with specified options and provides services
 * for publishing and handling order-related events.
 *
 * @module KafkaModule
 *
 * @description
 * This module uses the `ClientsModule` from `@nestjs/microservices` to register a Kafka client.
 * The Kafka client is configured with a producer and consumer, allowing the service to
 * produce and consume messages from Kafka topics.
 *
 * @imports
 * - `ClientsModule`: Registers the Kafka client with the specified configuration.
 *
 * @providers
 * - `KafkaProducerService`: A service for producing Kafka messages.
 * - `KAFKA_SERVICE`: An alias for `KafkaProducerService` to provide flexibility in dependency injection.
 * - `ORDER_EVENT_PUBLISHER`: A service for publishing order-related events.
 *
 * @exports
 * - `KafkaProducerService`: Allows other modules to use the Kafka producer functionality.
 * - `ORDER_EVENT_PUBLISHER`: Allows other modules to publish order-related events.
 * - `KAFKA_SERVICE`: Exports the Kafka service alias for external use.
 *
 * @configuration
 * - `clientId`: Identifies the Kafka client as "order-producer".
 * - `brokers`: Specifies the Kafka brokers to connect to, defaulting to "kafka:9092".
 * - `groupId`: Sets the consumer group ID to "order-consumer-group".
 * - `allowAutoTopicCreation`: Enables automatic creation of topics if they do not exist.
 * - `fromBeginning`: Configures the consumer to start reading messages from the beginning of the topic.
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: "KAFKA_PRODUCER",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "order-producer",
            brokers: [process.env.KAFKA_BROKERS || "kafka:9092"],
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