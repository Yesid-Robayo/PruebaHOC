import { EventsHandler, type IEventHandler } from "@nestjs/cqrs"
import { OrderStatusChangedEvent } from "../../../domain/events/order-status-changed.event"
import { Inject, Logger } from "@nestjs/common"
import { ORDER_EVENT_PUBLISHER, type OrderEventPublisher } from "../../../domain/ports/order-event.publisher.port"

@EventsHandler(OrderStatusChangedEvent)
export class OrderStatusChangedHandler implements IEventHandler<OrderStatusChangedEvent> {
  private readonly logger = new Logger(OrderStatusChangedHandler.name);

  constructor(
    @Inject(ORDER_EVENT_PUBLISHER)
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async handle(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.log(`Handling OrderStatusChangedEvent: ${JSON.stringify(event)}`)

    // Publish event to Kafka
    await this.orderEventPublisher.publishOrderStatusChanged(event)

    // Additional business logic can be added here
    // For example, sending notifications, updating inventory, etc.
  }
}

