export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly updatedAt: Date,
  ) {}
}

