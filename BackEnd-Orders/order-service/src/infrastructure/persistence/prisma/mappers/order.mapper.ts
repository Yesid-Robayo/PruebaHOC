import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from "@prisma/client"
import { Order } from "../../../../orders/domain/entities/order.entity"
import { OrderItem } from "../../../../orders/domain/entities/order-item.entity"
import { OrderId } from "../../../../orders/domain/value-objects/order-id.value-object"
import { UserId } from "../../../../orders/domain/value-objects/user-id.value-object"
import { ProductId } from "../../../../orders/domain/value-objects/product-id.value-object"
import { Money } from "../../../../orders/domain/value-objects/money.value-object"
import { OrderStatus } from "../../../../orders/domain/value-objects/order-status.value-object"

type PrismaOrderWithItems = PrismaOrder & {
  items: PrismaOrderItem[]
}

export class OrderMapper {
  static toDomain(persistenceOrder: PrismaOrderWithItems): Order {
    const orderItems = persistenceOrder.items.map(
      (item) =>
        new OrderItem({
          id: item.id,
          productId: new ProductId(item.productId),
          quantity: item.quantity,
          price: new Money(item.price),
        }),
    )

    return new Order({
      id: new OrderId(persistenceOrder.id),
      userId: new UserId(persistenceOrder.userId),
      status: OrderStatus.fromString(persistenceOrder.status),
      items: orderItems,
      totalAmount: new Money(persistenceOrder.totalAmount),
      createdAt: persistenceOrder.createdAt,
      updatedAt: persistenceOrder.updatedAt,
    })
  }

  static toPersistence(domainOrder: Order): PrismaOrderWithItems {
    return {
      id: domainOrder.id.value,
      userId: domainOrder.userId.value,
      status: domainOrder.status.value,
      totalAmount: domainOrder.totalAmount.amount,
      createdAt: domainOrder.createdAt,
      updatedAt: domainOrder.updatedAt,
      items: domainOrder.items.map((item) => ({
        id: item.id,
        orderId: domainOrder.id.value,
        productId: item.productId.value,
        quantity: item.quantity,
        price: item.price.amount,
      })),
    }
  }
}

