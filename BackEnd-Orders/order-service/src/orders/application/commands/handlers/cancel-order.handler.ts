import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CancelOrderCommand } from "../cancel-order.command";
import { Inject, NotFoundException } from "@nestjs/common";
import { ORDER_REPOSITORY, OrderRepository } from "../../../domain/ports/order.repository.port";
import { OrderId } from "../../../domain/value-objects/order-id.value-object";

/**
 * Command handler for canceling orders
 * Implements the CQRS pattern for order cancellation operations
 */
@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    /**
     * Injected order repository for data persistence
     * Uses dependency injection token ORDER_REPOSITORY for flexibility
     */
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    
    /**
     * Event publisher for domain event management
     * Handles event merging and publishing to the event bus
     */
    private readonly eventPublisher: EventPublisher,
  ) {}

  /**
   * Executes the order cancellation command
   * @param command CancelOrderCommand containing order ID
   * @throws NotFoundException if order doesn't exist
   * @returns Promise that resolves when operation completes
   */
  async execute(command: CancelOrderCommand): Promise<void> {
    // Convert string ID to domain value object
    const orderId = new OrderId(command.orderId);

    // Retrieve order from repository
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${command.orderId} not found`);
    }

    /**
     * Merge order aggregate with event publisher
     * Enables automatic event tracking and publishing
     * @type {Order} - The order aggregate root with event capabilities
     */
    const orderWithEvents = this.eventPublisher.mergeObjectContext(order);

    // Execute domain logic to cancel the order
    // This will generate domain events internally
    orderWithEvents.cancel();

    // Persist the updated order state
    await this.orderRepository.save(orderWithEvents);

    /**
     * Commit all generated events to the event bus
     * This publishes events to registered handlers
     */
    orderWithEvents.commit();
  }
}