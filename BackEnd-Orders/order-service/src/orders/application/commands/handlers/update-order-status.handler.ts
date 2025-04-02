import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { UpdateOrderStatusCommand } from "../update-order-status.command";
import { Inject, NotFoundException } from "@nestjs/common";
import { ORDER_REPOSITORY, OrderRepository } from "../../../domain/ports/order.repository.port";
import { OrderId } from "../../../domain/value-objects/order-id.value-object";
import { OrderStatus } from "../../../domain/value-objects/order-status.value-object";

/**
 * Command handler for updating order statuses
 * Implements CQRS pattern for order status transitions
 */
@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(
    /**
     * Order repository for persistence operations
     * Injected with ORDER_REPOSITORY token for flexibility
     */
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,

    /**
     * Event publisher for domain event management
     * Handles event aggregation and publishing
     */
    private readonly eventPublisher: EventPublisher,
  ) {}

  /**
   * Executes the order status update command
   * @param command Contains orderId and newStatus
   * @throws NotFoundException if order doesn't exist
   * @throws Error if status transition is invalid
   */
  async execute(command: UpdateOrderStatusCommand): Promise<void> {
    // Convert string ID to domain value object
    const orderId = new OrderId(command.orderId);

    // Retrieve order aggregate from repository
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${command.orderId} not found`);
    }

    /**
     * Enable event tracking on the aggregate
     * Wraps the order to capture domain events
     */
    const orderWithEvents = this.eventPublisher.mergeObjectContext(order);

    // Convert string status to domain value object
    const newStatus = OrderStatus.fromString(command.newStatus);
    
    /**
     * Execute domain logic for status update
     * - Validates status transition rules
     * - Generates OrderStatusChangedEvent
     */
    orderWithEvents.updateStatus(newStatus);

    // Persist the updated order state
    await this.orderRepository.save(orderWithEvents);

    /**
     * Publish all captured events
     * Events are dispatched to registered handlers
     */
    orderWithEvents.commit();
  }
}