import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { EMAIL_SENDER, type EmailSender } from "../../../domain/ports/email-sender.port";
import { USER_REPOSITORY, type UserRepository } from "../../../domain/ports/user.repository.port";
import { Inject } from "@nestjs/common";
import { UserId } from "../../../domain/value-objects/user-id.value-object";
export class OrderCreatedEvent {
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
  ) { }
}

@Controller()
export class OrderCreatedConsumer {
  private readonly logger = new Logger(OrderCreatedConsumer.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender
  ) { }

  @MessagePattern('order.created')  // 'order.created' topic
  async handleOrderCreatedEvent(@Payload() event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Handling OrderCreatedEvent: ${JSON.stringify(event)}`);

    try {
      const userId = new UserId(event.userId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        this.logger.error(`User with ID ${event.userId} not found`);
        return;
      }

      await this.emailSender.sendEmail(
        user.email.value,
        "Order Confirmation",
        this.generateOrderConfirmationEmail(user.name, event),
      );

      this.logger.log(`Order confirmation email sent to ${user.email.value}`);
    } catch (error) {
      this.logger.error(`Error handling OrderCreatedEvent: ${error.message}`);
    }
  }

  private generateOrderConfirmationEmail(userName: string, event: OrderCreatedEvent): string {
    return `
      <h1>Order Confirmation</h1>
      <p>Hello ${userName},</p>
      <p>Thank you for your order! Your order has been received and is being processed.</p>
      <h2>Order Details</h2>
      <p>Order ID: ${event.orderId}</p>
      <p>Date: ${new Date(event.createdAt).toLocaleString()}</p>
      <p>Total Amount: $${event.totalAmount.toFixed(2)}</p>
      <h3>Items</h3>
      <ul>
        ${event.items
        .map(
          (item) => `
          <li>Product ID: ${item.productId} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}</li>
        `)
        .join("")}
      </ul>
      <p>We will notify you when your order ships.</p>
      <p>Thank you for shopping with us!</p>
    `;
  }
}
