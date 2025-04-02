import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetOrderByIdQuery } from "../get-order-by-id.query";
import { Inject, NotFoundException } from "@nestjs/common";
import { ORDER_REPOSITORY, OrderRepository } from "../../../domain/ports/order.repository.port";
import { OrderId } from "../../../domain/value-objects/order-id.value-object";
import { OrderDto } from "../../dtos/order.dto";
import { OrderMapper } from "../../mappers/order.mapper";

/**
 * Query handler for retrieving an order by its ID
 * 
 * @remarks
 * Implements the CQRS pattern for read operations, separating query concerns from command logic.
 * This handler is responsible for fetching a single order and converting it to a DTO.
 */
@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  /**
   * Constructs the query handler with required dependencies
   * @param orderRepository - The order repository interface for data access
   */
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  /**
   * Executes the GetOrderByIdQuery
   * @param query - Contains the order ID to look up
   * @returns Promise resolving to an OrderDto
   * @throws NotFoundException when no order exists with the given ID
   * 
   * @example
   * ```typescript
   * const result = await handler.execute(new GetOrderByIdQuery('order_123'));
   * ```
   */
  async execute(query: GetOrderByIdQuery): Promise<OrderDto> {
    // Convert string ID to domain value object for type safety
    const orderId = new OrderId(query.orderId);
    
    // Fetch the order aggregate from the repository
    const order = await this.orderRepository.findById(orderId);

    // Validate order existence
    if (!order) {
      throw new NotFoundException(`Order with ID ${query.orderId} not found`);
    }

    /**
     * Convert domain entity to DTO for API response
     * @remarks
     * The mapper handles:
     * - Value object to primitive conversion
     * - Data formatting
     * - Removing internal domain concerns
     */
    return OrderMapper.toDto(order);
  }
}