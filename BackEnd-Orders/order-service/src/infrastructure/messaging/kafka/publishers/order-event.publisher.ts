import { Injectable } from "@nestjs/common";
import { OrderEventPublisher as IOrderEventPublisher } from "../../../../orders/domain/ports/order-event.publisher.port";
import { OrderCreatedEvent } from "../../../../orders/domain/events/order-created.event";
import { OrderStatusChangedEvent } from "../../../../orders/domain/events/order-status-changed.event";
import { KafkaProducerService } from "../kafka-producer.service";
import { Logger } from "@nestjs/common";

@Injectable()
export class OrderEventPublisher implements IOrderEventPublisher {
  // Logger instance for tracking event publishing
  private readonly logger = new Logger(OrderEventPublisher.name);

  /**
   * Constructs the event publisher with Kafka producer dependency
   * @param kafkaProducer Service for publishing messages to Kafka
   */
  constructor(private readonly kafkaProducer: KafkaProducerService) { }

  /**
   * Publishes an OrderCreatedEvent to Kafka
   * @param event The order creation event containing order details
   * @returns Promise that resolves when the event is published
   */
  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Publishing OrderCreatedEvent: ${JSON.stringify(event)}`);
    
    await this.kafkaProducer.publish("order.created", {
      key: event.orderId,  // Uses orderId as the Kafka message key
      value: {
        orderId: event.orderId,
        userId: event.userId,
        totalAmount: event.totalAmount,
        items: event.items,  // Array of order items
        createdAt: event.createdAt,  // ISO timestamp of creation
      },
    });
  }

  /**
   * Publishes an OrderStatusChangedEvent to Kafka
   * @param event The status change event containing transition details
   * @returns Promise that resolves when the event is published
   */
  async publishOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.log(`Publishing OrderStatusChangedEvent: ${JSON.stringify(event)}`);
    
    await this.kafkaProducer.publish("order.status.changed", {
      key: event.orderId,  // Uses orderId as the Kafka message key
      value: {
        orderId: event.orderId,
        userId: event.userId,
        oldStatus: event.oldStatus,  // Previous order status
        newStatus: event.newStatus,  // Current/updated order status
        updatedAt: event.updatedAt,  // ISO timestamp of status change
      },
    });
  }
}