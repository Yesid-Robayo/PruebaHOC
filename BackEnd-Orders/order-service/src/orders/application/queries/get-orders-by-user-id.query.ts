import  { IQuery } from "@nestjs/cqrs"

/**
 * Query to retrieve orders associated with a specific user ID.
 * Implements the `IQuery` interface.
 */
export class GetOrdersByUserIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

