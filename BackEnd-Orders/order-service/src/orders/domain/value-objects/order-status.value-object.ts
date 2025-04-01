import { ValueObject } from "./value-object.base"

export type OrderStatusValue = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED"

export class OrderStatus extends ValueObject<OrderStatusValue> {
  // Static instances for all possible statuses
  static readonly PENDING = new OrderStatus("PENDING")
  static readonly PROCESSING = new OrderStatus("PROCESSING")
  static readonly SHIPPED = new OrderStatus("SHIPPED")
  static readonly DELIVERED = new OrderStatus("DELIVERED")
  static readonly CANCELLED = new OrderStatus("CANCELLED")
  static readonly RETURNED = new OrderStatus("RETURNED")

  private constructor(value: OrderStatusValue) {
    super(value)
  }

  static fromString(status: string): OrderStatus {
    switch (status) {
      case "PENDING":
        return OrderStatus.PENDING
      case "PROCESSING":
        return OrderStatus.PROCESSING
      case "SHIPPED":
        return OrderStatus.SHIPPED
      case "DELIVERED":
        return OrderStatus.DELIVERED
      case "CANCELLED":
        return OrderStatus.CANCELLED
      case "RETURNED":
        return OrderStatus.RETURNED
      default:
        throw new Error(`Invalid order status: ${status}`)
    }
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value
  }
}

