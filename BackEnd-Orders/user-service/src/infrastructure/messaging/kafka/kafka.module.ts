import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { KafkaProducerService } from "./kafka-producer.service"
import { KafkaConsumerService } from "./kafka-consumer.service"

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "KAFKA_PRODUCER",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "user-producer",
            brokers: [process.env.KAFKA_BROKERS || "kafka:9092"],
          },
        },
      },
    ]),
  ],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}

