import type { Order } from "../../domain/entities/order.entity"
import type { OrderDto } from "../dtos/order.dto"

/**
 * Mapper class for converting between domain models and Data Transfer Objects (DTOs)
 * Handles transformation between business logic and API response formats
 * 
 */
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

