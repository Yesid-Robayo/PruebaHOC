import  { ICommand } from "@nestjs/cqrs"

/**
 * Command to update the status of an order.
 * Implements the `ICommand` interface.
 */
export class UpdateOrderStatusCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly newStatus: string,
  ) {}
}

