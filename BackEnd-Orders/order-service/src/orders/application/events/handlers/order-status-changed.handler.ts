import { EventsHandler, type IEventHandler } from "@nestjs/cqrs";
import { OrderStatusChangedEvent } from "../../../domain/events/order-status-changed.event";
import { Inject, Logger } from "@nestjs/common";
import { ORDER_EVENT_PUBLISHER, type OrderEventPublisher } from "../../../domain/ports/order-event.publisher.port";

/**
 * Event handler for OrderStatusChangedEvent
 * Responsible for processing order status transitions and their side effects
 * 
 * @remarks
 * This handler is part of the event-driven architecture and implements the CQRS pattern.
 * It reacts to status changes in the order lifecycle and coordinates downstream effects.
 */
@EventsHandler(OrderStatusChangedEvent)
export class OrderStatusChangedHandler implements IEventHandler<OrderStatusChangedEvent> {
  private readonly logger = new Logger(OrderStatusChangedHandler.name);

  constructor(
    /**
     * Event publisher service (typically Kafka implementation)
     * @remarks Injected with ORDER_EVENT_PUBLISHER token for loose coupling
     */
    @Inject(ORDER_EVENT_PUBLISHER)
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  /**
   * Processes an OrderStatusChangedEvent
   * @param event The status change event containing order details and transition information
   * @returns Promise that resolves when all processing is complete
   * 
   * @throws Error if event publishing fails
   * 
   * @example
   * ```typescript
   * // The handler will automatically be invoked when an OrderStatusChangedEvent occurs
   * ```
   */
  async handle(event: OrderStatusChangedEvent): Promise<void> {
    // Log the event details for auditing and monitoring
    this.logger.log(
      `Processing status change from ${event.oldStatus} to ${event.newStatus} ` +
      `for order ${event.orderId}`
    );

    /**
     * Primary Action: Publish the status change event
     * @remarks
     * - Uses the injected publisher to abstract the messaging implementation
     * - Ensures reliable event propagation to interested services
     * - The publisher should implement retry logic for failure cases
     */
    await this.orderEventPublisher.publishOrderStatusChanged(event);

    /**
     * Extension Point: Additional Side Effects
     * @remarks
     * Potential additional actions could include:
     * - Sending customer notifications (email/SMS)
     * - Triggering fulfillment processes
     * - Updating analytics dashboards
     * - Initiating payment flows
     * 
     * For complex side effects, consider:
     * 1. Creating separate specialized handlers
     * 2. Using Sagas for workflow management
     * 3. Implementing idempotent operations
     */
    // Example placeholder for notification logic:
    // if (event.newStatus === 'shipped') {
    //   await this.notificationService.sendShippingNotification(event.orderId);
    // }
  }
}