import  { ICommand } from "@nestjs/cqrs"

/**
 * Command to create a new order.
 * Implements the ICommand interface.
 */
export class CreateOrderCommand implements ICommand {
  /**
   * @param userId - The unique identifier of the user placing the order.
   * @param items - An array of items included in the order. Each item contains:
   *   - `productId`: The unique identifier of the product.
   *   - `quantity`: The quantity of the product being ordered.
   *   - `price`: The price of the product.
   */
  constructor(
    public readonly userId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
  ) {}
}

