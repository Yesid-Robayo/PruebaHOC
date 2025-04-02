import { EventsHandler, type IEventHandler } from "@nestjs/cqrs";
import { OrderCreatedEvent } from "../../../domain/events/order-created.event";
import { Inject, Logger } from "@nestjs/common";
import { ORDER_EVENT_PUBLISHER, type OrderEventPublisher } from "../../../domain/ports/order-event.publisher.port";

/**
 * Event handler for OrderCreatedEvent
 * Responsible for reacting to order creation events in the system
 */
@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(
    /**
     * Event publisher service (Kafka implementation)
     * Injected with ORDER_EVENT_PUBLISHER token for dependency inversion
     */
    @Inject(ORDER_EVENT_PUBLISHER)
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  /**
   * Handles the OrderCreatedEvent
   * @param event The order created event containing order details
   * @returns Promise that resolves when event processing completes
   */
  async handle(event: OrderCreatedEvent): Promise<void> {
    // Log the incoming event for auditing and debugging
    this.logger.log(`Handling OrderCreatedEvent: ${JSON.stringify(event)}`);

    /**
     * Primary responsibility: Publish event to message broker
     * - Uses injected publisher to abstract the messaging implementation
     * - Ensures reliable event propagation to other services
     */
    await this.orderEventPublisher.publishOrderCreated(event);

    /**
     * Extension point for additional side effects:
     * - Could send email/SMS notifications
     * - Trigger inventory updates
     * - Initiate fraud checks
     * - Update analytics
     * 
     * Note: For complex side effects, consider separate event handlers
     * to maintain single responsibility principle
     */
  }
}