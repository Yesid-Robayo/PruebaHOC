import  { ICommand } from "@nestjs/cqrs"

export class UpdateOrderStatusCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly newStatus: string,
  ) {}
}

