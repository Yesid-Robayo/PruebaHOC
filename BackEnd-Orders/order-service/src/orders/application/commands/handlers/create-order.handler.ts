import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs"
import { CreateOrderCommand } from "../create-order.command"
import { Inject, NotFoundException, BadRequestException } from "@nestjs/common"
import { ORDER_REPOSITORY, OrderRepository } from "../../../domain/ports/order.repository.port"
import { Order } from "../../../domain/entities/order.entity"
import { OrderId } from "../../../domain/value-objects/order-id.value-object"
import { UserId } from "../../../domain/value-objects/user-id.value-object"
import { OrderItem } from "../../../domain/entities/order-item.entity"
import { ProductId } from "../../../domain/value-objects/product-id.value-object"
import { Money } from "../../../domain/value-objects/money.value-object"
import { v4 as uuidv4 } from "uuid"
import { Logger } from "@nestjs/common"
import { CircuitBreakerService } from "../../../../infrastructure/resilience/circuit-breaker/circuit-breaker.service"
import { KafkaProducerService } from "src/infrastructure/messaging/kafka/kafka-producer.service"

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);
  
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: KafkaProducerService, 
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly eventPublisher: EventPublisher,
  ) { }
  
  async execute(command: CreateOrderCommand): Promise<string> {
    // Verify user exists before creating order
    await this.verifyUserExists(command.userId)
    
    // Create order items
    const orderItems = command.items.map(
      (item) =>
        new OrderItem({
          id: uuidv4(),
          productId: new ProductId(item.productId),
          quantity: item.quantity,
          price: new Money(item.price),
        }),
    )
    
    // Create order
    const orderId = new OrderId(uuidv4())
    const userId = new UserId(command.userId)
    
    // Create and publish domain events
    const order = this.eventPublisher.mergeObjectContext(Order.create(orderId, userId, orderItems))
    
    // Save order
    await this.orderRepository.save(order)
    
    // Commit events to the event bus
    order.commit()
    
    return orderId.value
  }
  
  private async verifyUserExists(userId: string): Promise<void> {
    try {
      // Use circuit breaker to handle potential failures in user service
      const userExists = await this.circuitBreakerService.execute<boolean>(
        "user-service",
        async () => {
          this.logger.log(`Verifying user existence for userId: ${userId}`)
          
          // Now this works because kafkaClient is typed as KafkaProducerService
          const response = await this.kafkaClient.sendAndReceive<{ userId: string }, { exists: boolean }>(
            "user.verify", 
            { userId }
          );
          
          this.logger.log(`User verification response: ${JSON.stringify(response)}`)
          return response.exists
        },
        // Fallback function if circuit is open
        () => {
          this.logger.warn(`Circuit open for user-service, using fallback`);
          return false;
        }
      );
      
      if (!userExists) {
        throw new NotFoundException(`User with ID ${userId} not found`)
      }
    } catch (error) {
      this.logger.error(`Error verifying user: ${error.message}`)
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException("Failed to verify user")
    }
  }
}