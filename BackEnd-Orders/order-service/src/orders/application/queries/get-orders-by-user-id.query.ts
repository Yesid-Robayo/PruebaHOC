import  { IQuery } from "@nestjs/cqrs"

export class GetOrdersByUserIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

