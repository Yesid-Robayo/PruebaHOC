import { CommandHandler,  EventPublisher,  ICommandHandler } from "@nestjs/cqrs"
import { UpdateOrderStatusCommand } from "../update-order-status.command"
import { Inject, NotFoundException } from "@nestjs/common"
import { ORDER_REPOSITORY,  OrderRepository } from "../../../domain/ports/order.repository.port"
import { OrderId } from "../../../domain/value-objects/order-id.value-object"
import { OrderStatus } from "../../../domain/value-objects/order-status.value-object"

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateOrderStatusCommand): Promise<void> {
    const orderId = new OrderId(command.orderId)

    // Find order
    const order = await this.orderRepository.findById(orderId)
    if (!order) {
      throw new NotFoundException(`Order with ID ${command.orderId} not found`)
    }

    // Merge with event publisher to track and publish events
    const orderWithEvents = this.eventPublisher.mergeObjectContext(order)

    // Update status
    const newStatus = OrderStatus.fromString(command.newStatus)
    orderWithEvents.updateStatus(newStatus)

    // Save updated order
    await this.orderRepository.save(orderWithEvents)

    // Commit events to the event bus
    orderWithEvents.commit()
  }
}

