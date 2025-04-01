import type { Order } from "../entities/order.entity"
import type { OrderId } from "../value-objects/order-id.value-object"
import type { UserId } from "../value-objects/user-id.value-object"

export const ORDER_REPOSITORY = "ORDER_REPOSITORY"

export interface OrderRepository {
  save(order: Order): Promise<Order>
  findById(id: OrderId): Promise<Order | null>
  findByUserId(userId: UserId): Promise<Order[]>
  delete(id: OrderId): Promise<void>
}

