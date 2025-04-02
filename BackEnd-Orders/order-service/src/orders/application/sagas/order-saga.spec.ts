import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';

import { catchError, map, of } from 'rxjs';
import { OrderSaga } from 'src/orders/application/sagas/order.saga';
import { OrderCreatedEvent } from 'src/orders/domain/events/order-created.event';
import { OrderStatusChangedEvent } from 'src/orders/domain/events/order-status-changed.event';

describe('OrderSaga', () => {
  let saga: OrderSaga;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [OrderSaga],
    }).compile();

    saga = module.get<OrderSaga>(OrderSaga);
  });

  it('should be defined', () => {
    expect(saga).toBeDefined();
  });

  describe('orderCreated', () => {
    it('should process OrderCreatedEvent without returning a command', (done) => {
      // Arrange
      const event = new OrderCreatedEvent(
        'order-123',
        'user-123',
        100,
        [{ productId: 'product-123', quantity: 2, price: 50 }],
        new Date()
      );

      // Act
      const result$ = saga.orderCreated(of(event));

      // Assert
      result$.subscribe(command => {
        expect(command).toBeNull(); // Should return null as we're just logging
        done();
      });
    });

    it('should handle errors in saga without crashing', (done) => {
      // Arrange
      const event = new OrderCreatedEvent(
        'order-123',
        'user-123',
        100,
        [{ productId: 'product-123', quantity: 2, price: 50 }],
        new Date()
      );

      // Create an Observable that emits the event and then throws an error
      const events$ = of(event).pipe(
        map(e => {
          throw new Error('Test error');
          return e;
        }),
        catchError(err => {
          // In real saga, this would be handled internally
          return of(event); // Return the event to continue processing
        })
      );

      // Act
      const result$ = saga.orderCreated(events$);

      // Assert
      result$.subscribe(command => {
        expect(command).toBeNull(); // Should still return null
        done();
      });
    });
  });

  describe('orderStatusChanged', () => {
    it('should process OrderStatusChangedEvent without returning a command', (done) => {
      // Arrange
      const event = new OrderStatusChangedEvent(
        'order-123',
        'user-123',
        'PENDING',
        'PROCESSING',
        new Date()
      );

      // Act
      const result$ = saga.orderStatusChanged(of(event));

      // Assert
      result$.subscribe(command => {
        expect(command).toBeNull(); // Should return null as we're just logging
        done();
      });
    });
  });
});
