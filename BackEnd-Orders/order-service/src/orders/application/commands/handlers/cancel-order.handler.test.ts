import { Test, TestingModule } from '@nestjs/testing';
import { CancelOrderHandler } from './cancel-order.handler';
import { CancelOrderCommand } from '../cancel-order.command';
import { ORDER_REPOSITORY, OrderRepository } from '../../../domain/ports/order.repository.port';
import {  NotFoundException } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { OrderId } from '../../../domain/value-objects/order-id.value-object';
import { EventPublisher } from '@nestjs/cqrs';

describe('CancelOrderHandler', () => {
    let handler: CancelOrderHandler;
    let orderRepository: jest.Mocked<OrderRepository>;
    let eventPublisher: jest.Mocked<EventPublisher>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CancelOrderHandler,
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

        handler = module.get<CancelOrderHandler>(CancelOrderHandler);
        orderRepository = module.get(ORDER_REPOSITORY);
        eventPublisher = module.get(EventPublisher);
    });

    it('should cancel an order successfully', async () => {
        const command = new CancelOrderCommand('order-id-123');
        const mockOrder = {
            cancel: jest.fn(),
            commit: jest.fn(),
        } as unknown as Order;

        orderRepository.findById.mockResolvedValue(mockOrder);
        eventPublisher.mergeObjectContext.mockReturnValue(mockOrder);

        await handler.execute(command);

        expect(orderRepository.findById).toHaveBeenCalledWith(new OrderId(command.orderId));
        expect(mockOrder.cancel).toHaveBeenCalled();
        expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
        expect(mockOrder.commit).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order is not found', async () => {
        const command = new CancelOrderCommand('non-existent-order-id');
        orderRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(command)).rejects.toThrow(
            new NotFoundException(`Order with ID ${command.orderId} not found`),
        );

        expect(orderRepository.findById).toHaveBeenCalledWith(new OrderId(command.orderId));
        expect(eventPublisher.mergeObjectContext).not.toHaveBeenCalled();
    });
});