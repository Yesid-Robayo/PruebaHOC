import { ValueObject } from "./value-object.base";

/**
 * Type representing all valid order status values
 */
export type OrderStatusValue = 
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

/**
 * OrderStatus Value Object - Represents the state of an order in the system
 * 
 * @remarks
 * - Implements the type-safe enumeration pattern
 * - Provides static instances for all valid statuses
 * - Enforces valid status transitions through type checking
 */
export class OrderStatus extends ValueObject<OrderStatusValue> {
  // Static instances for all possible statuses (Flyweight pattern)
  static readonly PENDING = new OrderStatus("PENDING");
  static readonly PROCESSING = new OrderStatus("PROCESSING");
  static readonly SHIPPED = new OrderStatus("SHIPPED");
  static readonly DELIVERED = new OrderStatus("DELIVERED");
  static readonly CANCELLED = new OrderStatus("CANCELLED");
  static readonly RETURNED = new OrderStatus("RETURNED");

  /**
   * Private constructor enforces use of predefined instances
   * @param value - The status value
   */
  private constructor(value: OrderStatusValue) {
    super(value);
  }

  /**
   * Creates an OrderStatus from a string value
   * @param status - String representation of the status
   * @returns Corresponding OrderStatus instance
   * @throws Error if the string is not a valid status
   */
  static fromString(status: string): OrderStatus {
    const normalizedStatus = status.toUpperCase().trim();
    
    switch (normalizedStatus) {
      case "PENDING":
        return OrderStatus.PENDING;
      case "PROCESSING":
        return OrderStatus.PROCESSING;
      case "SHIPPED":
        return OrderStatus.SHIPPED;
      case "DELIVERED":
        return OrderStatus.DELIVERED;
      case "CANCELLED":
        return OrderStatus.CANCELLED;
      case "RETURNED":
        return OrderStatus.RETURNED;
      default:
        throw new Error(`Invalid order status: ${status}. Valid values are: ${this.validStatuses.join(", ")}`);
    }
  }

  /**
   * Gets all valid status values as strings
   */
  static get validStatuses(): string[] {
    return [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED"
    ];
  }

  /**
   * Compares this status with another for equality
   * @param other - Another OrderStatus to compare
   * @returns True if the status values are identical
   */
  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  /**
   * Checks if this status represents a terminal state
   * @returns True if the status cannot be changed further
   */
  isTerminal(): boolean {
    return this.equals(OrderStatus.CANCELLED) || 
           this.equals(OrderStatus.DELIVERED) || 
           this.equals(OrderStatus.RETURNED);
  }

  /**
   * String representation of the status
   */
  toString(): string {
    return this.value;
  }
}