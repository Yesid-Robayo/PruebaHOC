import { EventsHandler, type IEventHandler } from "@nestjs/cqrs"
import { OrderCreatedEvent } from "../../../domain/events/order-created.event"
import { Inject, Logger } from "@nestjs/common"
import { ORDER_EVENT_PUBLISHER, type OrderEventPublisher } from "../../../domain/ports/order-event.publisher.port"

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(
    @Inject(ORDER_EVENT_PUBLISHER)
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Handling OrderCreatedEvent: ${JSON.stringify(event)}`)

    // Publish event to Kafka
    await this.orderEventPublisher.publishOrderCreated(event)

    // Additional business logic can be added here
    // For example, sending notifications, updating inventory, etc.
  }
}

