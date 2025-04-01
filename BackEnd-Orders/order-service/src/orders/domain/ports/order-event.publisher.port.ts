import type { OrderCreatedEvent } from "../events/order-created.event"
import type { OrderStatusChangedEvent } from "../events/order-status-changed.event"

export const ORDER_EVENT_PUBLISHER = "ORDER_EVENT_PUBLISHER"

export interface OrderEventPublisher {
  publishOrderCreated(event: OrderCreatedEvent): Promise<void>
  publishOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void>
}

