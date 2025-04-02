/**
 * Event triggered when a new order is created.
 */
export class OrderCreatedEvent {
  /**
   * Creates an instance of OrderCreatedEvent.
   * @param orderId - The unique identifier of the order.
   * @param userId - The unique identifier of the user who placed the order.
   * @param totalAmount - The total amount of the order.
   * @param items - The list of items in the order, including product ID, quantity, and price.
   * @param createdAt - The date and time when the order was created.
   */
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly totalAmount: number,
    public readonly items: Array<{
      productId: string
      quantity: number
      price: number
    }>,
    public readonly createdAt: Date,
  ) {}
}

