import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from "@prisma/client";
import { Order } from "../../../../orders/domain/entities/order.entity";
import { OrderItem } from "../../../../orders/domain/entities/order-item.entity";
import { OrderId } from "../../../../orders/domain/value-objects/order-id.value-object";
import { UserId } from "../../../../orders/domain/value-objects/user-id.value-object";
import { ProductId } from "../../../../orders/domain/value-objects/product-id.value-object";
import { Money } from "../../../../orders/domain/value-objects/money.value-object";
import { OrderStatus } from "../../../../orders/domain/value-objects/order-status.value-object";

/**
 * Extended Prisma Order type that includes related items
 * Represents the database model structure with joined items
 */
type PrismaOrderWithItems = PrismaOrder & {
  items: PrismaOrderItem[];
};

/**
 * Mapper class for converting between domain models and persistence models
 * Handles bidirectional transformation between business logic and database layers
 */
export class OrderMapper {
  /**
   * Converts a Prisma persistence model to a domain entity
   * @param persistenceOrder The Prisma order model with items from database
   * @returns Fully constructed domain Order entity
   */
  static toDomain(persistenceOrder: PrismaOrderWithItems): Order {
    // Map each order item from persistence to domain model
    const orderItems = persistenceOrder.items.map(
      (item) =>
        new OrderItem({
          id: item.id,
          productId: new ProductId(item.productId), // Convert to ProductId value object
          quantity: item.quantity,
          price: new Money(item.price), // Convert to Money value object
        }),
    );

    // Construct and return the domain Order entity
    return new Order({
      id: new OrderId(persistenceOrder.id), // Convert to OrderId value object
      userId: new UserId(persistenceOrder.userId), // Convert to UserId value object
      status: OrderStatus.fromString(persistenceOrder.status), // Parse status string
      items: orderItems,
      totalAmount: new Money(persistenceOrder.totalAmount), // Convert to Money value object
      createdAt: persistenceOrder.createdAt,
      updatedAt: persistenceOrder.updatedAt,
    });
  }

  /**
   * Converts a domain entity to Prisma persistence model
   * @param domainOrder The domain Order entity to persist
   * @returns Plain object ready for Prisma database operations
   */
  static toPersistence(domainOrder: Order): PrismaOrderWithItems {
    return {
      id: domainOrder.id.value, // Extract primitive from OrderId
      userId: domainOrder.userId.value, // Extract primitive from UserId
      status: domainOrder.status.value, // Extract primitive from OrderStatus
      totalAmount: domainOrder.totalAmount.amount, // Extract amount from Money
      createdAt: domainOrder.createdAt,
      updatedAt: domainOrder.updatedAt,
      // Map each order item to persistence format
      items: domainOrder.items.map((item) => ({
        id: item.id,
        orderId: domainOrder.id.value, // Reference parent order
        productId: item.productId.value, // Extract primitive from ProductId
        quantity: item.quantity,
        price: item.price.amount, // Extract amount from Money
      })),
    };
  }
}