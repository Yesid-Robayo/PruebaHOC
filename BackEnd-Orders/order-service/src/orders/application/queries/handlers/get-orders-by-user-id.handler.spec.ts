import { Test, TestingModule } from '@nestjs/testing';
import { GetOrdersByUserIdHandler } from './get-orders-by-user-id.handler';
import { GetOrdersByUserIdQuery } from '../get-orders-by-user-id.query';
import { ORDER_REPOSITORY, OrderRepository } from '../../../domain/ports/order.repository.port';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { OrderMapper } from '../../mappers/order.mapper';
import { OrderDto } from '../../dtos/order.dto';

describe('GetOrdersByUserIdHandler', () => {
    let handler: GetOrdersByUserIdHandler;
    let orderRepository: jest.Mocked<OrderRepository>;

    beforeEach(async () => {
        const mockOrderRepository = {
            findByUserId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetOrdersByUserIdHandler,
                {
                    provide: ORDER_REPOSITORY,
                    useValue: mockOrderRepository,
                },
            ],
        }).compile();

        handler = module.get<GetOrdersByUserIdHandler>(GetOrdersByUserIdHandler);
        orderRepository = module.get(ORDER_REPOSITORY);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

   

   

 
});