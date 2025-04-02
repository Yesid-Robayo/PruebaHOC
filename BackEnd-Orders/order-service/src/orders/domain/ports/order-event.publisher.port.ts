import type { OrderCreatedEvent } from "../events/order-created.event"
import type { OrderStatusChangedEvent } from "../events/order-status-changed.event"

export const ORDER_EVENT_PUBLISHER = "ORDER_EVENT_PUBLISHER"

/**
 * Interface representing an order event publisher.
 * This interface defines methods for publishing events related to orders.
 */
export interface OrderEventPublisher {
  /**
   * Publishes an event indicating that an order has been created.
   * 
   * @param event - The event containing details about the created order.
   * @returns A promise that resolves when the event has been published.
   */
  publishOrderCreated(event: OrderCreatedEvent): Promise<void>;

  /**
   * Publishes an event indicating that the status of an order has changed.
   * 
   * @param event - The event containing details about the order status change.
   * @returns A promise that resolves when the event has been published.
   */
  publishOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void>;
}
  
