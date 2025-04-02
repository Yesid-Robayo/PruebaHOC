import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { Logger } from "@nestjs/common"
import { Observable, firstValueFrom } from "rxjs"

/**
 * KafkaProducerService is a service responsible for interacting with Kafka as a producer.
 * It handles connecting to Kafka, publishing messages, and sending requests with responses.
 * 
 * @class KafkaProducerService
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 * 
 * @description
 * This service provides methods to:
 * - Publish messages to Kafka topics (fire-and-forget).
 * - Send messages to Kafka topics and wait for responses.
 * - Manage Kafka connection lifecycle during module initialization and destruction.
 * 
 * @example
 * // Example usage:
 * const kafkaService = new KafkaProducerService(kafkaClient);
 * await kafkaService.publish('topic-name', { key: 'value' });
 * const response = await kafkaService.sendAndReceive('topic-name', { key: 'value' });
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Subscribe to response patterns BEFORE connecting
    this.kafkaClient.subscribeToResponseOf('user.verify');
    
    // Connect to Kafka when the module initializes
    await this.kafkaClient.connect();
    
    this.logger.log("Kafka producer connected and subscribed to response topics");
  }

  async onModuleDestroy() {
    // Disconnect from Kafka when the module is destroyed
    await this.kafkaClient.close()
    this.logger.log("Kafka producer disconnected")
  }

  /**
   * Publishes a message to a Kafka topic (fire and forget)
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

  /**
   * Sends a message to a Kafka topic and waits for a response
   * @param pattern The Kafka topic/pattern to send to
   * @param data The message data to send
   * @returns An Observable of the response
   */
  send<TRequest, TResponse>(pattern: string, data: TRequest): Observable<TResponse> {
    this.logger.debug(`Sending request to ${pattern}: ${JSON.stringify(data)}`)
    return this.kafkaClient.send<TResponse>(pattern, data);
  }

  /**
   * Sends a message to a Kafka topic and awaits the first response
   * @param pattern The Kafka topic/pattern to send to
   * @param data The message data to send
   * @returns A Promise that resolves to the first response value
   */
  async sendAndReceive<TRequest, TResponse>(pattern: string, data: TRequest): Promise<TResponse> {
    this.logger.debug(`Sending request to ${pattern} and awaiting response: ${JSON.stringify(data)}`)
    try {
      // Ensure we're subscribed to the response topic for this pattern
      if (!this.isSubscribedToPattern(pattern)) {
        this.logger.warn(`Not yet subscribed to response topic for ${pattern}, subscribing now`);
        this.kafkaClient.subscribeToResponseOf(pattern);
        // We might need to reconnect for this to take effect
        await this.kafkaClient.connect();
      }
      
      return await firstValueFrom(this.send<TRequest, TResponse>(pattern, data));
    } catch (error) {
      this.logger.error(`Error in sendAndReceive for pattern ${pattern}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Check if we've already subscribed to a response pattern
   * This is a simple helper method that you might need to adapt based on 
   * the actual ClientKafka implementation details
   */
  private isSubscribedToPattern(pattern: string): boolean {
    // This is a simplified check - the actual implementation may vary
    // depending on how ClientKafka tracks subscriptions internally
    // You might need to adapt this or remove it if there's no reliable way to check
    const anyKafkaClient = this.kafkaClient as any;
    return anyKafkaClient.responsePatterns && 
           Array.isArray(anyKafkaClient.responsePatterns) && 
           anyKafkaClient.responsePatterns.includes(pattern);
  }
}