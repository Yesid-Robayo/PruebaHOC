import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
import type { ClientKafka } from "@nestjs/microservices"
import { Logger } from "@nestjs/common"

/**
 * KafkaProducerService is a service responsible for managing the lifecycle
 * of a Kafka producer and publishing messages to Kafka topics.
 * 
 * This service implements the `OnModuleInit` and `OnModuleDestroy` interfaces
 * to handle initialization and cleanup tasks for the Kafka producer.
 * 
 * @class KafkaProducerService
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 * 
 * @example
 * // Inject the KafkaProducerService into your service or controller
 * constructor(private readonly kafkaProducerService: KafkaProducerService) {}
 * 
 * // Publish a message to a Kafka topic
 * await this.kafkaProducerService.publish('topic-name', { key: 'value' });
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Connect to Kafka when the module initializes
    await this.kafkaClient.connect()
    this.logger.log("Kafka producer connected")
  }

  async onModuleDestroy() {
    // Disconnect from Kafka when the module is destroyed
    await this.kafkaClient.close()
    this.logger.log("Kafka producer disconnected")
  }

  /**
   * Publishes a message to a Kafka topic
   * @param topic The Kafka topic to publish to
   * @param message The message to publish
   */
  async publish<T>(topic: string, message: T): Promise<void> {
    try {
      this.logger.debug(`Publishing message to topic ${topic}: ${JSON.stringify(message)}`)
      await this.kafkaClient.emit(topic, message)
    } catch (error) {
      this.logger.error(`Failed to publish message to topic ${topic}: ${error.message}`)
      throw error
    }
  }
}

