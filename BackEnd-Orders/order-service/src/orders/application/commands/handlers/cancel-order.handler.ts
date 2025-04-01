import { CommandHandler,  EventPublisher,  ICommandHandler } from "@nestjs/cqrs"
import { CancelOrderCommand } from "../cancel-order.command"
import { Inject, NotFoundException } from "@nestjs/common"
import { ORDER_REPOSITORY,  OrderRepository } from "../../../domain/ports/order.repository.port"
import { OrderId } from "../../../domain/value-objects/order-id.value-object"

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CancelOrderCommand): Promise<void> {
    const orderId = new OrderId(command.orderId)

    // Find order
    const order = await this.orderRepository.findById(orderId)
    if (!order) {
      throw new NotFoundException(`Order with ID ${command.orderId} not found`)
    }

    // Merge with event publisher to track and publish events
    const orderWithEvents = this.eventPublisher.mergeObjectContext(order)

    // Cancel order
    orderWithEvents.cancel()

    // Save updated order
    await this.orderRepository.save(orderWithEvents)

    // Commit events to the event bus
    orderWithEvents.commit()
  }
}

