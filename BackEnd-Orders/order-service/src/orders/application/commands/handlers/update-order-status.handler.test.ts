import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderStatusHandler } from './update-order-status.handler';
import { UpdateOrderStatusCommand } from '../update-order-status.command';
import { ORDER_REPOSITORY, OrderRepository } from '../../../domain/ports/order.repository.port';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { OrderId } from '../../../domain/value-objects/order-id.value-object';
import { OrderStatus } from '../../../domain/value-objects/order-status.value-object';

describe('UpdateOrderStatusHandler', () => {
    let handler: UpdateOrderStatusHandler;
    let orderRepository: jest.Mocked<OrderRepository>;
    let eventPublisher: jest.Mocked<EventPublisher>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateOrderStatusHandler,
                {
                    provide: ORDER_REPOSITORY,
                    useValue: {
                        findById: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: EventPublisher,
                    useValue: {
                        mergeObjectContext: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<UpdateOrderStatusHandler>(UpdateOrderStatusHandler);
        orderRepository = module.get(ORDER_REPOSITORY);
        eventPublisher = module.get(EventPublisher);
    });

    it('should update the order status successfully', async () => {
        const command = new UpdateOrderStatusCommand('order-id-123', 'SHIPPED');
        const mockOrder = {
            updateStatus: jest.fn(),
            commit: jest.fn(),
        } as unknown as Order;

        orderRepository.findById.mockResolvedValue(mockOrder);
        eventPublisher.mergeObjectContext.mockReturnValue(mockOrder);

        await handler.execute(command);

        expect(orderRepository.findById).toHaveBeenCalledWith(new OrderId('order-id-123'));
        expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(mockOrder);
        expect(mockOrder.updateStatus).toHaveBeenCalledWith(OrderStatus.fromString('SHIPPED'));
        expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
        expect(mockOrder.commit).toHaveBeenCalled();
    });

    it('should throw NotFoundException if the order is not found', async () => {
        const command = new UpdateOrderStatusCommand('non-existent-order-id', 'SHIPPED');
        orderRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
        expect(orderRepository.findById).toHaveBeenCalledWith(new OrderId('non-existent-order-id'));
        expect(eventPublisher.mergeObjectContext).not.toHaveBeenCalled();
    });
});