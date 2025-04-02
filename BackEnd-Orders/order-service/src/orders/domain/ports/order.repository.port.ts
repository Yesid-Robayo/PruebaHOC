import type { Order } from "../entities/order.entity"
import type { OrderId } from "../value-objects/order-id.value-object"
import type { UserId } from "../value-objects/user-id.value-object"

export const ORDER_REPOSITORY = "ORDER_REPOSITORY"

/**
 * Interface representing the repository for managing orders.
 * Provides methods for saving, retrieving, and deleting orders.
 */
export interface OrderRepository {
  /**
   * Saves a new order or updates an existing order in the repository.
   * 
   * @param order - The order to be saved.
   * @returns A promise that resolves to the saved order.
   */
  save(order: Order): Promise<Order>;

  /**
   * Finds an order by its unique identifier.
   * 
   * @param id - The unique identifier of the order.
   * @returns A promise that resolves to the order if found, or null if not found.
   */
  findById(id: OrderId): Promise<Order | null>;

  /**
   * Finds all orders associated with a specific user.
   * 
   * @param userId - The unique identifier of the user.
   * @returns A promise that resolves to an array of orders associated with the user.
   */
  findByUserId(userId: UserId): Promise<Order[]>;

  /**
   * Deletes an order by its unique identifier.
   * 
   * @param id - The unique identifier of the order to be deleted.
   * @returns A promise that resolves when the order has been deleted.
   */
  delete(id: OrderId): Promise<void>;
}


