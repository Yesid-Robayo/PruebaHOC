import { Injectable } from "@nestjs/common"
import { OrderEventPublisher as IOrderEventPublisher } from "../../../../orders/domain/ports/order-event.publisher.port"
import { OrderCreatedEvent } from "../../../../orders/domain/events/order-created.event"
import { OrderStatusChangedEvent } from "../../../../orders/domain/events/order-status-changed.event"
import { KafkaProducerService } from "../kafka-producer.service"
import { Logger } from "@nestjs/common"

@Injectable()
export class OrderEventPublisher implements IOrderEventPublisher {
  private readonly logger = new Logger(OrderEventPublisher.name)

  constructor(private readonly kafkaProducer: KafkaProducerService) { }

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Publishing OrderCreatedEvent: ${JSON.stringify(event)}`)
    await this.kafkaProducer.publish("order.created", {
      key: event.orderId,
      value: {
        orderId: event.orderId,
        userId: event.userId,
        totalAmount: event.totalAmount,
        items: event.items,
        createdAt: event.createdAt,
      },
    })
  }

  async publishOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.log(`Publishing OrderStatusChangedEvent: ${JSON.stringify(event)}`)
    await this.kafkaProducer.publish("order.status.changed", {
      key: event.orderId,
      value: {
        orderId: event.orderId,
        userId: event.userId,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        updatedAt: event.updatedAt,
      },
    })
  }
}

