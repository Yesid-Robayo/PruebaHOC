import  { ICommand } from "@nestjs/cqrs"

export class CreateOrderCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly items: Array<{
      productId: string
      quantity: number
      price: number
    }>,
  ) {}
}

