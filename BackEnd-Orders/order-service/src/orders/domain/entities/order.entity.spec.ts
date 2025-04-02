import { Order } from './order.entity';
import { OrderId } from '../value-objects/order-id.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { OrderStatus } from '../value-objects/order-status.value-object';
import { Money } from '../value-objects/money.value-object';
import { OrderItem } from './order-item.entity';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderStatusChangedEvent } from '../events/order-status-changed.event';
import { ProductId } from '../value-objects/product-id.value-object';

describe('Order Entity', () => {
    const mockOrderId = new OrderId('order-123');
    const mockUserId = new UserId('usr_abc12345');
    const mockItems = [
        new OrderItem({
            id: 'item-1',
            productId: new ProductId('product-1'),
            quantity: 2,
            price: new Money(50),
        }),
        new OrderItem({
            id: 'item-2',
            productId: new ProductId('product-2'),
            quantity: 1,
            price: new Money(100),
        }),
    ];

    it('should create a new Order with valid properties', () => {
        const order = Order.create(mockOrderId, mockUserId, mockItems);

        expect(order.id).toEqual(mockOrderId);
        expect(order.userId).toEqual(mockUserId);
        expect(order.status).toEqual(OrderStatus.PENDING);
        expect(order.items).toHaveLength(2);
        expect(order.totalAmount.amount).toEqual(200); // 2 * 50 + 1 * 100
        expect(order.createdAt).toBeInstanceOf(Date);
        expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw an error when creating an Order with no items', () => {
        expect(() => Order.create(mockOrderId, mockUserId, [])).toThrowError(
            'Order must have at least one item',
        );
    });

    it('should apply OrderCreatedEvent when a new Order is created', () => {
        const order = Order.create(mockOrderId, mockUserId, mockItems);

        const events = order.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(OrderCreatedEvent);
        expect(events[0]).toMatchObject({
            orderId: mockOrderId.value,
            userId: mockUserId.value,
            totalAmount: 200,
            items: [
                { productId: 'product-1', quantity: 2, price: 50 },
                { productId: 'product-2', quantity: 1, price: 100 },
            ],
        });
    });

    it('should update the status of an Order', () => {
        const order = Order.create(mockOrderId, mockUserId, mockItems);

        order.updateStatus(OrderStatus.PROCESSING);

        expect(order.status).toEqual(OrderStatus.PROCESSING);
        expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw an error for invalid status transitions', () => {
        const order = Order.create(mockOrderId, mockUserId, mockItems);

        expect(() => order.updateStatus(OrderStatus.SHIPPED)).toThrowError(
            'Invalid status transition from PENDING to SHIPPED',
        );
    });

    it('should apply OrderStatusChangedEvent when status is updated', () => {
        const order = Order.create(mockOrderId, mockUserId, mockItems);

        order.updateStatus(OrderStatus.PROCESSING);

        const events = order.getUncommittedEvents();
        expect(events).toHaveLength(2); // OrderCreatedEvent + OrderStatusChangedEvent
        expect(events[1]).toBeInstanceOf(OrderStatusChangedEvent);
        expect(events[1]).toMatchObject({
            orderId: mockOrderId.value,
            userId: mockUserId.value,
            oldStatus: OrderStatus.PENDING.value,
            newStatus: OrderStatus.PROCESSING.value,
        });
    });

    it('should cancel the Order', () => {
        const order = Order.create(mockOrderId, mockUserId, mockItems);

        order.cancel();

        expect(order.status).toEqual(OrderStatus.CANCELLED);
    });
});