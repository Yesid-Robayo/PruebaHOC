import type { Order } from "../../domain/entities/order.entity"
import type { OrderDto } from "../dtos/order.dto"

export class OrderMapper {
  static toDto(order: Order): OrderDto {
    return {
      id: order.id.value,
      userId: order.userId.value,
      status: order.status.value,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId.value,
        quantity: item.quantity,
        price: item.price.amount,
        subtotal: item.subtotal.amount,
      })),
      totalAmount: order.totalAmount.amount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }
}

