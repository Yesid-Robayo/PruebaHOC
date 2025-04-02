import { Test, TestingModule } from '@nestjs/testing';
import { OrderEventPublisher } from 'src/infrastructure/messaging/kafka/publishers/order-event.publisher';
import { OrderCreatedHandler } from 'src/orders/application/events/handlers/order-created.handler';
import { OrderStatusChangedHandler } from 'src/orders/application/events/handlers/order-status-changed.handler';
import { OrderCreatedEvent } from 'src/orders/domain/events/order-created.event';
import { OrderStatusChangedEvent } from 'src/orders/domain/events/order-status-changed.event';
import { ORDER_EVENT_PUBLISHER } from 'src/orders/domain/ports/order-event.publisher.port';

describe('Order Event Handlers', () => {
  describe('OrderCreatedHandler', () => {
    let handler: OrderCreatedHandler;
    let orderEventPublisher: OrderEventPublisher;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OrderCreatedHandler,
          {
            provide: ORDER_EVENT_PUBLISHER,
            useValue: {
              publishOrderCreated: jest.fn(),
            },
          }
        ],
      }).compile();

      handler = module.get<OrderCreatedHandler>(OrderCreatedHandler);
      orderEventPublisher = module.get<OrderEventPublisher>(ORDER_EVENT_PUBLISHER);
    });

    it('should publish OrderCreatedEvent', async () => {
      // Arrange
      const event = new OrderCreatedEvent(
        'order-123',
        'user-123',
        100,
        [{ productId: 'product-123', quantity: 2, price: 50 }],
        new Date()
      );
      
      // Act
      await handler.handle(event);
      
      // Assert
      expect(orderEventPublisher.publishOrderCreated).toHaveBeenCalledWith(event);
    });
  });

  describe('OrderStatusChangedHandler', () => {
    let handler: OrderStatusChangedHandler;
    let orderEventPublisher: OrderEventPublisher;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OrderStatusChangedHandler,
          {
            provide: ORDER_EVENT_PUBLISHER,
            useValue: {
              publishOrderStatusChanged: jest.fn(),
            },
          }
        ],
      }).compile();

      handler = module.get<OrderStatusChangedHandler>(OrderStatusChangedHandler);
      orderEventPublisher = module.get<OrderEventPublisher>(ORDER_EVENT_PUBLISHER);
    });

    it('should publish OrderStatusChangedEvent', async () => {
      // Arrange
      const event = new OrderStatusChangedEvent(
        'order-123',
        'user-123',
        'PENDING',
        'PROCESSING',
        new Date()
      );
      
      // Act
      await handler.handle(event);
      
      // Assert
      expect(orderEventPublisher.publishOrderStatusChanged).toHaveBeenCalledWith(event);
    });
  });
});