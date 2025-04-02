import { AggregateRoot } from "@nestjs/cqrs";
import type { OrderId } from "../value-objects/order-id.value-object";
import type { UserId } from "../value-objects/user-id.value-object";
import { OrderStatus } from "../value-objects/order-status.value-object";
import type { OrderItem } from "./order-item.entity";
import { Money } from "../value-objects/money.value-object";
import { OrderCreatedEvent } from "../events/order-created.event";
import { OrderStatusChangedEvent } from "../events/order-status-changed.event";

/**
 * Interface defining the properties required to construct an Order
 */
export interface OrderProps {
  id: OrderId;
  userId: UserId;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: Money;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order Aggregate Root - The central entity in the Order domain
 * 
 * @remarks
 * Represents a customer order and enforces all order-related business rules.
 * Extends CQRS AggregateRoot for event sourcing capabilities.
 */
export class Order extends AggregateRoot {
  private _id: OrderId;
  private _userId: UserId;
  private _status: OrderStatus;
  private _items: OrderItem[];
  private _totalAmount: Money;
  private _createdAt: Date;
  private _updatedAt: Date;

  /**
   * Constructs a new Order instance
   * @param props - Required order properties
   */
  constructor(props: OrderProps) {
    super();
    this._id = props.id;
    this._userId = props.userId;
    this._status = props.status;
    this._items = props.items;
    this._totalAmount = props.totalAmount;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new Order
   * @param id - Unique order identifier
   * @param userId - Customer identifier
   * @param items - Array of order items
   * @returns New Order instance
   * @throws Error if order has no items
   */
  static create(id: OrderId, userId: UserId, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    // Calculate total amount by summing all item subtotals
    const totalAmount = items.reduce(
      (sum, item) => sum.add(item.price.multiply(item.quantity)),
      new Money(0)
    );

    const now = new Date();

    const order = new Order({
      id,
      userId,
      status: OrderStatus.PENDING,
      items,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    });

    // Apply domain event
    order.apply(
      new OrderCreatedEvent(
        order.id.value,
        order.userId.value,
        order.totalAmount.amount,
        order.items.map((item) => ({
          productId: item.productId.value,
          quantity: item.quantity,
          price: item.price.amount,
        })),
        order.createdAt,
      ),
    );

    return order;
  }

  /**
   * Updates the order status with validation
   * @param newStatus - Target status to transition to
   * @throws Error if status transition is invalid
   */
  updateStatus(newStatus: OrderStatus): void {
    if (this._status.equals(newStatus)) {
      return; // No change needed
    }

    this.validateStatusTransition(newStatus);

    const oldStatus = this._status;
    this._status = newStatus;
    this._updatedAt = new Date();

    // Apply domain event
    this.apply(
      new OrderStatusChangedEvent(
        this.id.value,
        this.userId.value,
        oldStatus.value,
        newStatus.value,
        this._updatedAt,
      ),
    );
  }

  /**
   * Validates if a status transition is allowed
   * @param newStatus - Proposed new status
   * @throws Error if transition is invalid
   * 
   * @remarks
   * Defines the order lifecycle state machine:
   * PENDING → PROCESSING or CANCELLED
   * PROCESSING → SHIPPED or CANCELLED
   * SHIPPED → DELIVERED or RETURNED
   * DELIVERED → RETURNED
   * CANCELLED/RETURNED → (terminal states)
   */
  private validateStatusTransition(newStatus: OrderStatus): void {
    const validTransitions = {
      [OrderStatus.PENDING.value]: [OrderStatus.PROCESSING.value, OrderStatus.CANCELLED.value],
      [OrderStatus.PROCESSING.value]: [OrderStatus.SHIPPED.value, OrderStatus.CANCELLED.value],
      [OrderStatus.SHIPPED.value]: [OrderStatus.DELIVERED.value, OrderStatus.RETURNED.value],
      [OrderStatus.DELIVERED.value]: [OrderStatus.RETURNED.value],
      [OrderStatus.CANCELLED.value]: [],
      [OrderStatus.RETURNED.value]: [],
    };

    if (!validTransitions[this._status.value].includes(newStatus.value)) {
      throw new Error(
        `Invalid status transition from ${this._status.value} to ${newStatus.value}`,
      );
    }
  }

  /**
   * Cancels the order by updating its status
   */
  cancel(): void {
    this.updateStatus(OrderStatus.CANCELLED);
  }

  // --- Getters (Read-only access to properties) ---

  get id(): OrderId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get status(): OrderStatus {
    return this._status;
  }

  /**
   * Returns a copy of order items array to maintain immutability
   */
  get items(): OrderItem[] {
    return [...this._items];
  }

  get totalAmount(): Money {
    return this._totalAmount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}