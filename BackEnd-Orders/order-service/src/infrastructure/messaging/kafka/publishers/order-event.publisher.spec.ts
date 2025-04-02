import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProducerService } from 'src/infrastructure/messaging/kafka/kafka-producer.service';
import { OrderEventPublisher } from 'src/infrastructure/messaging/kafka/publishers/order-event.publisher';
import { OrderCreatedEvent } from 'src/orders/domain/events/order-created.event';
import { OrderStatusChangedEvent } from 'src/orders/domain/events/order-status-changed.event';

describe('OrderEventPublisher', () => {
  let publisher: OrderEventPublisher;
  let kafkaProducer: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderEventPublisher,
        {
          provide: KafkaProducerService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    publisher = module.get<OrderEventPublisher>(OrderEventPublisher);
    kafkaProducer = module.get<KafkaProducerService>(KafkaProducerService);
  });

  it('should be defined', () => {
    expect(publisher).toBeDefined();
  });

  describe('publishOrderCreated', () => {
    it('should publish OrderCreatedEvent to Kafka', async () => {
      // Arrange
      const event = new OrderCreatedEvent(
        'order-123',
        'user-123',
        100,
        [{ productId: 'product-123', quantity: 2, price: 50 }],
        new Date()
      );

      // Act
      await publisher.publishOrderCreated(event);

      // Assert
      expect(kafkaProducer.publish).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          key: event.orderId,
          value: expect.objectContaining({
            orderId: event.orderId,
            userId: event.userId,
            totalAmount: event.totalAmount,
            items: event.items,
            createdAt: event.createdAt,
          }),
        })
      );
    });
  });

  describe('publishOrderStatusChanged', () => {
    it('should publish OrderStatusChangedEvent to Kafka', async () => {
      // Arrange
      const event = new OrderStatusChangedEvent(
        'order-123',
        'user-123',
        'PENDING',
        'PROCESSING',
        new Date()
      );

      // Act
      await publisher.publishOrderStatusChanged(event);

      // Assert
      expect(kafkaProducer.publish).toHaveBeenCalledWith(
        'order.status.changed',
        expect.objectContaining({
          key: event.orderId,
          value: expect.objectContaining({
            orderId: event.orderId,
            userId: event.userId,
            oldStatus: event.oldStatus,
            newStatus: event.newStatus,
            updatedAt: event.updatedAt,
          }),
        })
      );
    });
  });
});
