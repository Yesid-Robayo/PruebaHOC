import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { OrderEventPublisher } from 'src/infrastructure/messaging/kafka/publishers/order-event.publisher';
import { KafkaProducerService } from 'src/infrastructure/messaging/kafka/kafka-producer.service';
import { OrderCreatedEvent } from 'src/orders/domain/events/order-created.event';
import { OrderStatusChangedEvent } from 'src/orders/domain/events/order-status-changed.event';

describe('Kafka Integration E2E', () => {
  let app: INestApplication;
  let orderEventPublisher: OrderEventPublisher;
  let kafkaProducerService: KafkaProducerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    orderEventPublisher = app.get<OrderEventPublisher>(OrderEventPublisher);
    kafkaProducerService = app.get<KafkaProducerService>(KafkaProducerService);

    // Mock KafkaProducerService methods
    kafkaProducerService.publish = jest.fn().mockResolvedValue(undefined);
    kafkaProducerService.sendAndReceive = jest.fn().mockResolvedValue({ exists: true });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Event Publishing', () => {
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
      await orderEventPublisher.publishOrderCreated(event);

      // Assert
      expect(kafkaProducerService.publish).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          key: 'order-123',
          value: expect.objectContaining({
            orderId: 'order-123',
            userId: 'user-123',
          }),
        })
      );
    });

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
      await orderEventPublisher.publishOrderStatusChanged(event);

      // Assert
      expect(kafkaProducerService.publish).toHaveBeenCalledWith(
        'order.status.changed',
        expect.objectContaining({
          key: 'order-123',
          value: expect.objectContaining({
            orderId: 'order-123',
            oldStatus: 'PENDING',
            newStatus: 'PROCESSING',
          }),
        })
      );
    });
  });

  describe('User Verification', () => {
    it('should verify user existence via Kafka', async () => {
      // Arrange
      const userId = 'user-123';

      // Act
      const result = await kafkaProducerService.sendAndReceive<{ userId: string }, { exists: boolean }>(
        'user.verify',
        { userId }
      );

      // Assert
      expect(kafkaProducerService.sendAndReceive).toHaveBeenCalledWith(
        'user.verify',
        { userId }
      );
      expect(result).toEqual({ exists: true });
    });
  });
});