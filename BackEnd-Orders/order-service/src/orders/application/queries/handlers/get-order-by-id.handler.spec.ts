import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ORDER_REPOSITORY, OrderRepository } from 'src/orders/domain/ports/order.repository.port';
import { GetOrderByIdHandler } from 'src/orders/application/queries/handlers/get-order-by-id.handler';
import { GetOrderByIdQuery } from 'src/orders/application/queries/get-order-by-id.query';
import { OrderMapper } from 'src/orders/application/mappers/order.mapper';
import { OrderId } from 'src/orders/domain/value-objects/order-id.value-object';

describe('GetOrderByIdHandler', () => {
  let handler: GetOrderByIdHandler;
  let orderRepository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdHandler,
        {
          provide: ORDER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        }
      ],
    }).compile();

    handler = module.get<GetOrderByIdHandler>(GetOrderByIdHandler);
    orderRepository = module.get<OrderRepository>(ORDER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return order when found', async () => {
      // Arrange
      const orderId = uuidv4();
      const query = new GetOrderByIdQuery(orderId);
      
      const mockOrder = {
        id: { value: orderId },
        userId: { value: 'user-123' },
        status: { value: 'PENDING' },
        items: [],
        totalAmount: { amount: 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock repository response
      orderRepository.findById = jest.fn().mockResolvedValue(mockOrder);
      
      // Mock mapper
      jest.spyOn(OrderMapper, 'toDto').mockReturnValue({
        id: orderId,
        userId: 'user-123',
        status: 'PENDING',
        items: [],
        totalAmount: 100,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      // Act
      const result = await handler.execute(query);
      
      // Assert
      expect(orderRepository.findById).toHaveBeenCalledWith(expect.any(OrderId));
      expect(OrderMapper.toDto).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual({
        id: orderId,
        userId: 'user-123',
        status: 'PENDING',
        items: [],
        totalAmount: 100,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
    
    it('should throw NotFoundException when order is not found', async () => {
      // Arrange
      const orderId = uuidv4();
      const query = new GetOrderByIdQuery(orderId);
      
      orderRepository.findById = jest.fn().mockResolvedValue(null);
      
      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      expect(orderRepository.findById).toHaveBeenCalledWith(expect.any(OrderId));
    });
  });
});