import { NotFoundException } from '@nestjs/common';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProducerService } from 'src/infrastructure/messaging/kafka/kafka-producer.service';
import { CircuitBreakerService } from 'src/infrastructure/resilience/circuit-breaker/circuit-breaker.service';
import { CreateOrderCommand } from 'src/orders/application/commands/create-order.command';
import { CreateOrderHandler } from 'src/orders/application/commands/handlers/create-order.handler';
import { Order } from 'src/orders/domain/entities/order.entity';
import { ORDER_REPOSITORY, OrderRepository } from 'src/orders/domain/ports/order.repository.port';
import { v4 as uuidv4 } from 'uuid';

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let orderRepository: OrderRepository;
  let kafkaClient: KafkaProducerService;
  let circuitBreakerService: CircuitBreakerService;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateOrderHandler,
        {
          provide: ORDER_REPOSITORY,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            sendAndReceive: jest.fn(),
          },
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn().mockImplementation((obj) => obj),
          },
        }
      ],
    }).compile();

    handler = module.get<CreateOrderHandler>(CreateOrderHandler);
    orderRepository = module.get<OrderRepository>(ORDER_REPOSITORY);
    kafkaClient = module.get<KafkaProducerService>('KAFKA_SERVICE');
    circuitBreakerService = module.get<CircuitBreakerService>(CircuitBreakerService);
    eventPublisher = module.get<EventPublisher>(EventPublisher);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create and save an order successfully', async () => {
      // Arrange
      const userId = uuidv4();
      const command = new CreateOrderCommand(
        userId,
        [
          { productId: uuidv4(), quantity: 2, price: 10.99 },
          { productId: uuidv4(), quantity: 1, price: 15.50 },
        ]
      );

      // Mock user verification
      circuitBreakerService.execute = jest.fn().mockResolvedValue(true);

      // Mock order save
      const saveOrderMock = jest.fn().mockImplementation((order) => {
        return Promise.resolve(order);
      });
      orderRepository.save = saveOrderMock;

      // Mock mergeObjectContext
      const commitMock = jest.fn();
      const orderMock = {
        commit: commitMock
      };
      
      // Mock Order.create with a spy on the static method
      const createSpy = jest.spyOn(Order, 'create').mockImplementation(() => orderMock as any);

      // Act
      await handler.execute(command);

      // Assert
      expect(circuitBreakerService.execute).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(saveOrderMock).toHaveBeenCalled();
      expect(commitMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      const command = new CreateOrderCommand(
        userId,
        [{ productId: uuidv4(), quantity: 1, price: 10.99 }]
      );

      // Mock user verification to return false (user not found)
      circuitBreakerService.execute = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(circuitBreakerService.execute).toHaveBeenCalled();
    });
  });
});