

import { EventsHandler, type IEventHandler } from "@nestjs/cqrs"
import { Controller, Inject, Logger } from "@nestjs/common"
import { EMAIL_SENDER, type EmailSender } from "../../../domain/ports/email-sender.port"
import { USER_REPOSITORY, type UserRepository } from "../../../domain/ports/user.repository.port"
import { UserId } from "../../../domain/value-objects/user-id.value-object"
import { MessagePattern } from "@nestjs/microservices"

// This is a simplified version of the event from the order service
export class OrderStatusChangedEvent {
    constructor(
        public readonly orderId: string,
        public readonly userId: string,
        public readonly oldStatus: string,
        public readonly newStatus: string,
        public readonly updatedAt: Date,
    ) { }
}

@Controller()
export class OrderStatusChangedConsumer {
    private readonly logger = new Logger(OrderStatusChangedConsumer.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(EMAIL_SENDER)
        private readonly emailSender: EmailSender,
    ) { }
    @MessagePattern("order.status.changed")
    async handle(event: OrderStatusChangedEvent): Promise<void> {
        this.logger.log(`Handling OrderStatusChangedEvent: ${JSON.stringify(event)}`)

        try {
            // Find the user
            const userId = new UserId(event.userId)
            const user = await this.userRepository.findById(userId)

            if (!user) {
                this.logger.error(`User with ID ${event.userId} not found`)
                return
            }

            // Only send emails for certain status changes
            if (this.shouldSendEmail(event.newStatus)) {
                await this.emailSender.sendEmail(
                    user.email.value,
                    `Order Status Update: ${event.newStatus}`,
                    this.generateOrderStatusEmail(user.name, event),
                )

                this.logger.log(`Order status update email sent to ${user.email.value}`)
            }
        } catch (error) {
            this.logger.error(`Error handling OrderStatusChangedEvent: ${error.message}`)
        }
    }

    private shouldSendEmail(status: string): boolean {
        // Only send emails for these statuses
        const notifiableStatuses = ["SHIPPED", "DELIVERED", "CANCELLED"]
        return notifiableStatuses.includes(status)
    }

    private generateOrderStatusEmail(userName: string, event: OrderStatusChangedEvent): string {
        const statusMessages = {
            SHIPPED: "Your order has been shipped and is on its way!",
            DELIVERED: "Your order has been delivered. We hope you enjoy your purchase!",
            CANCELLED:
                "Your order has been cancelled. If you did not request this cancellation, please contact customer support.",
        }

        const message = statusMessages[event.newStatus as keyof typeof statusMessages] || `Your order status has been updated to ${event.newStatus}.`

        return `
      <h1>Order Status Update</h1>
      <p>Hello ${userName},</p>
      <p>${message}</p>
      <h2>Order Details</h2>
      <p>Order ID: ${event.orderId}</p>
      <p>New Status: ${event.newStatus}</p>
      <p>Updated: ${new Date(event.updatedAt).toLocaleString()}</p>
      <p>Thank you for shopping with us!</p>
    `
    }
}

