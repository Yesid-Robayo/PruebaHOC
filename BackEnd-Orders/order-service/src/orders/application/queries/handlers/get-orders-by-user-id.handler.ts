import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetOrdersByUserIdQuery } from "../get-orders-by-user-id.query";
import { Inject } from "@nestjs/common";
import { ORDER_REPOSITORY, type OrderRepository } from "../../../domain/ports/order.repository.port";
import { UserId } from "../../../domain/value-objects/user-id.value-object";
import { OrderDto } from "../../dtos/order.dto";
import { OrderMapper } from "../../mappers/order.mapper";

/**
 * Query handler for retrieving all orders for a specific user
 * 
 * @remarks
 * Implements the CQRS pattern for read operations, providing efficient order lookup by user ID.
 * This handler is optimized for read performance and returns lightweight DTOs suitable for API responses.
 */
@QueryHandler(GetOrdersByUserIdQuery)
export class GetOrdersByUserIdHandler implements IQueryHandler<GetOrdersByUserIdQuery> {
  /**
   * Constructs the handler with required dependencies
   * @param orderRepository - The order repository abstraction for data access
   */
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  /**
   * Executes the user orders query
   * @param query - Contains the user ID for order lookup
   * @returns Promise resolving to an array of OrderDto
   * 
   * @example
   * ```typescript
   * const orders = await handler.execute(new GetOrdersByUserIdQuery('user_123'));
   * ```
   */
  async execute(query: GetOrdersByUserIdQuery): Promise<OrderDto[]> {
    // Convert primitive user ID to domain value object for type safety
    const userId = new UserId(query.userId);
    
    // Fetch all orders associated with the user ID
    const orders = await this.orderRepository.findByUserId(userId);

    /**
     * Transform domain entities to API-friendly DTOs
     * @remarks
     * The mapper:
     * - Converts value objects to primitives
     * - Formats dates and monetary values
     * - Filters internal domain concerns
     */
    return orders.map(OrderMapper.toDto);
  }
}