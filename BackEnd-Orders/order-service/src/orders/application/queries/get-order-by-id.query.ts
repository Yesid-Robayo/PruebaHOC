import  { IQuery } from "@nestjs/cqrs"

/**
 * Query to retrieve an order by its unique identifier.
 * 
 * This query is used in the application layer to request the details
 * of a specific order based on its `orderId`.
 * 
 * @implements {IQuery}
 * 
 * @param {string} orderId - The unique identifier of the order to be retrieved.
 */
export class GetOrderByIdQuery implements IQuery {
  constructor(public readonly orderId: string) {}
}

