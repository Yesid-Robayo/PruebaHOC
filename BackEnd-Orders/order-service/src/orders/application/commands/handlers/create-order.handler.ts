import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CreateOrderCommand } from "../create-order.command";
import { Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { ORDER_REPOSITORY, OrderRepository } from "../../../domain/ports/order.repository.port";
import { Order } from "../../../domain/entities/order.entity";
import { OrderId } from "../../../domain/value-objects/order-id.value-object";
import { UserId } from "../../../domain/value-objects/user-id.value-object";
import { OrderItem } from "../../../domain/entities/order-item.entity";
import { ProductId } from "../../../domain/value-objects/product-id.value-object";
import { Money } from "../../../domain/value-objects/money.value-object";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "@nestjs/common";
import { CircuitBreakerService } from "../../../../infrastructure/resilience/circuit-breaker/circuit-breaker.service";
import { KafkaProducerService } from "src/infrastructure/messaging/kafka/kafka-producer.service";

/**
 * Command handler for creating new orders
 * Implements CQRS pattern for order creation operations
 */
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);
  
  constructor(
    /**
     * Injected order repository for data persistence
     */
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    
    /**
     * Kafka client for inter-service communication
     */
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: KafkaProducerService,
    
    /**
     * Circuit breaker for resilient service calls
     */
    private readonly circuitBreakerService: CircuitBreakerService,
    
    /**
     * Event publisher for domain event management
     */
    private readonly eventPublisher: EventPublisher,
  ) { }
  
  /**
   * Executes the order creation command
   * @param command CreateOrderCommand containing order details
   * @returns Promise resolving to the created order ID
   * @throws NotFoundException if user doesn't exist
   * @throws BadRequestException for invalid requests or service failures
   */
  async execute(command: CreateOrderCommand): Promise<string> {
    // Step 1: Validate user exists using resilient verification
    await this.verifyUserExists(command.userId);
    
    // Step 2: Create order items from command
    const orderItems = command.items.map(
      (item) =>
        new OrderItem({
          id: uuidv4(), // Generate unique ID for each item
          productId: new ProductId(item.productId),
          quantity: item.quantity,
          price: new Money(item.price), // Convert to Money value object
        }),
    );
    
    // Step 3: Create order aggregate
    const orderId = new OrderId(uuidv4());
    const userId = new UserId(command.userId);
    
    /**
     * Step 4: Create and configure order with event publishing
     * - mergeObjectContext enables event tracking
     * - Order.create() factory method generates OrderCreatedEvent
     */
    const order = this.eventPublisher.mergeObjectContext(
      Order.create(orderId, userId, orderItems)
    );
    
    // Step 5: Persist the new order
    await this.orderRepository.save(order);
    
    // Step 6: Publish all generated domain events
    order.commit();
    
    return orderId.value;
  }
  
  /**
   * Verifies user existence using resilient service call pattern
   * @param userId User ID to verify
   * @throws NotFoundException if user doesn't exist
   * @throws BadRequestException for service failures
   */
  private async verifyUserExists(userId: string): Promise<void> {
    try {
      // Use circuit breaker pattern for resilience
      const userExists = await this.circuitBreakerService.execute<boolean>(
        "user-service", // Circuit identifier
        async () => {
          this.logger.log(`Verifying user existence for userId: ${userId}`);
          
          // Kafka RPC-style request/response
          const response = await this.kafkaClient.sendAndReceive<
            { userId: string }, 
            { exists: boolean }
          >(
            "user.verify", // Kafka topic
            { userId }     // Request payload
          );
          
          this.logger.log(`User verification response: ${JSON.stringify(response)}`);
          return response.exists;
        },
        // Fallback behavior if circuit is open
        () => {
          this.logger.warn(`Circuit open for user-service, using fallback`);
          return false; // Default to "user doesn't exist" in fallback
        }
      );
      
      if (!userExists) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    } catch (error) {
      this.logger.error(`Error verifying user: ${error.message}`);
      // Preserve NotFound/BadRequest, convert others to BadRequest
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Failed to verify user");
    }
  }
}