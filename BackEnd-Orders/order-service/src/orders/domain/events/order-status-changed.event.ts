/**
 * Event triggered when the status of an order changes.
 */
export class OrderStatusChangedEvent {
  /**
   * Creates an instance of OrderStatusChangedEvent.
   * 
   * @param orderId - The unique identifier of the order.
   * @param userId - The unique identifier of the user associated with the order.
   * @param oldStatus - The previous status of the order.
   * @param newStatus - The new status of the order.
   * @param updatedAt - The date and time when the status was updated.
   */
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly updatedAt: Date,
  ) {}
}

